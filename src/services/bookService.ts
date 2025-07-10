// services/bookService.ts
import poolPromise from '../db';
import { Book } from '../models/book';

export async function getAllBooks(): Promise<Book[]> {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, title, isbn FROM book ORDER BY title');

    return result.recordset.map(
        row => new Book(row.id, row.title, row.isbn)
    );
}
