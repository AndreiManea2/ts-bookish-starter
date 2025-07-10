export class Book {
    id: number;
    title: string;
    isbn: string;

    constructor(id: number, title: string, isbn: string) {
        this.id = id;
        this.title = title;
        this.isbn = isbn;
    }
}
