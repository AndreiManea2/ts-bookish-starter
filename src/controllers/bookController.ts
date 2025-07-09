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

    getBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
    }

    async createBook(req: Request, res: Response) {
        const { id, title, isbn } = req.body;
        try {
            const pool = await (await import('../db')).default;
            await pool
                .request()
                .input('id', id)
                .input('title', title)
                .input('isbn', isbn)
                .query('INSERT INTO book (id, title, isbn) VALUES (@id, @title, @isbn)');
            res.status(201).json({ message: 'Book created successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add book' });
        }
    }
}

export default new BookController().router;
