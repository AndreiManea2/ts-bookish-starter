import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import poolPromise from '../db';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
    const { id, username, email, password } = req.body;

    console.log('Register request body:', { id, username, email, password });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        await pool
            .request()
            .input('id', id)
            .input('username', username)
            .input('email', email)
            .input('password_hash', hashedPassword)
            .query(
                'INSERT INTO "user" (id, username, email, password_hash) VALUES (@id, @username, @email, @password_hash)'
            );
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('username', username)
            .query('SELECT * FROM "user" WHERE username = @username');

        const user = result.recordset[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, {
            expiresIn: '1h'
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
