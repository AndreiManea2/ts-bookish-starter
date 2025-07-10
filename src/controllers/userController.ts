import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

class UserController {
    router: Router;

    constructor() {
        this.router = Router();

        this.router.get('/myCheckouts', authenticateToken, this.getUserCheckouts.bind(this));

        this.router.post('/checkout', authenticateToken, this.checkoutBook.bind(this));
    }

    async getUserCheckouts(req: Request, res: Response) {
        const userId = (req as any).user?.id; // comes from JWT via middleware

        try {
            const pool = await (await import('../db')).default;

            const result = await pool.request()
                .input('userId', userId)
                .query(`
                    SELECT 
                        b.title,
                        c.id AS copyId,
                        chk.due_date
                    FROM checkout chk
                    JOIN copy c ON chk.copy_id = c.id
                    JOIN book b ON c.book_id = b.id
                    WHERE chk.user_id = @userId
                `);

            res.json(result.recordset);
        } catch (error) {
            console.error('Failed to fetch user checkouts:', error);
            res.status(500).json({ error: 'Failed to fetch user checkouts' });
        }
    }

    async checkoutBook(req: Request, res: Response) {
        const userId = (req as any).user?.id;
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({ error: 'bookId is required' });
        }

        try {
            const pool = await (await import('../db')).default;

            // Find an available copy
            const availableCopyResult = await pool.request()
                .input('bookId', bookId)
                .query(`
                    SELECT TOP 1 c.id AS copyId
                    FROM copy c
                    LEFT JOIN checkout co ON c.id = co.copy_id AND co.due_date >= GETDATE()
                    WHERE c.book_id = @bookId AND co.id IS NULL
                `);

            if (availableCopyResult.recordset.length === 0) {
                return res.status(404).json({ error: 'No available copies of this book' });
            }

            const copyId = availableCopyResult.recordset[0].copyId;

            // Insert checkout
            const checkoutDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(checkoutDate.getDate() + 14);

            await pool.request()
                .input('copyId', copyId)
                .input('userId', userId)
                .input('checkoutDate', checkoutDate)
                .input('dueDate', dueDate)
                .query(`
                    INSERT INTO checkout (copy_id, user_id, checkout_date, due_date)
                    VALUES (@copyId, @userId, @checkoutDate, @dueDate)
                `);

            res.status(201).json({ message: 'Book checked out successfully', copyId });
        } catch (error) {
            console.error('Checkout error:', error);
            res.status(500).json({ error: 'Failed to check out book' });
        }
    }

}

export default new UserController().router;