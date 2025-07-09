import { Router, Request, Response } from 'express';
import { getAllBooks } from '../services/bookService';

class BookController {
    router: Router;

    constructor() {
        this.router = Router();

        this.router.get('/', this.getAllBooks.bind(this));

        this.router.get('/:id', this.getBook.bind(this));

        this.router.post('/', this.createBook.bind(this));
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

    createBook(req: Request, res: Response) {
        // TODO: implement functionality
        return res.status(500).json({
            error: 'server_error',
            error_description: 'Endpoint not implemented yet.',
        });
    }
}

export default new BookController().router;
