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
        const { title, isbn } = req.body;
        try {
            const pool = await (await import('../db')).default;
            await pool
                .request()
                .input('title', title)
                .input('isbn', isbn)
                .query('INSERT INTO book (title, isbn) VALUES (@title, @isbn)');
            res.status(201).json({ message: 'Book created successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add book' });
        }
    }
}

export default new BookController().router;
