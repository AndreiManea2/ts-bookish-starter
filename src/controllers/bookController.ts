import { Router, Request, Response } from 'express';
import { getAllBooks } from '../services/bookService';
import { authenticateToken } from '../middleware/auth';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();

        this.router.get('/', this.getAllBooks.bind(this));

        this.router.get('/:id', this.getBook.bind(this));

        this.router.post('/', authenticateToken, this.createBook.bind(this));
    }

    async getAllBooks(req: Request, res: Response) {
        try {
            const books = await getAllBooks();
            res.json(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getBook(req: Request, res: Response) {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        try {
            const pool = await (await import('../db')).default;
            const result = await pool
                .request()
                .input('id', id)
                .query('SELECT * FROM book WHERE id = @id');

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Error fetching book:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createBook(req: Request, res: Response) {
        const { title, isbn, authors, numberOfCopies } = req.body;

        if (!title || !isbn || !Array.isArray(authors) || authors.length === 0 || !numberOfCopies) {
            return res.status(400).json({ error: 'Missing or invalid book data!' });
        }

        try {
            const pool = await (await import('../db')).default;
            const transaction = pool.transaction();
            await transaction.begin();

            const request = transaction.request();

            // Insert book
            const insertBookResult = await request
                .input('title', title)
                .input('isbn', isbn)
                .query('INSERT INTO book (title, isbn) OUTPUT INSERTED.id VALUES (@title, @isbn)');

            const bookId = insertBookResult.recordset[0].id;

            for (const authorName of authors) {
                let authorId: number;

                // Check if author exists
                const checkAuthorResult = await transaction
                    .request()
                    .input('authorName', authorName)
                    .query('SELECT id FROM author WHERE name = @authorName');

                if (checkAuthorResult.recordset.length > 0) {
                    authorId = checkAuthorResult.recordset[0].id;
                } else {
                    // Insert author
                    const insertAuthorResult = await transaction
                        .request()
                        .input('authorName', authorName)
                        .query('INSERT INTO author (name) OUTPUT INSERTED.id VALUES (@authorName)');
                    authorId = insertAuthorResult.recordset[0].id;
                }

                // Link book to author
                await transaction
                    .request()
                    .input('bookId', bookId)
                    .input('authorId', authorId)
                    .query('INSERT INTO bookauthor (book_id, author_id) VALUES (@bookId, @authorId)');
            }

            // Insert copies
            for (let i = 0; i < numberOfCopies; i++) {
                await transaction
                    .request() // new request for each iteration
                    .input('bookId', bookId)
                    .query('INSERT INTO copy (book_id) VALUES (@bookId)');
            }
            
            await transaction.commit();

            res.status(201).json({ message: 'Book created successfully.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to add book' });
        }
    }
}

export default new BookController().router;
