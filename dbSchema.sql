-- USERS
CREATE TABLE "user" (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- BOOK
CREATE TABLE book (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL
);

-- AUTHOR
CREATE TABLE author (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- BOOKAUTHOR
CREATE TABLE bookauthor (
    book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES author(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

-- COPY
CREATE TABLE copy (
    id INTEGER PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES book(id) ON DELETE CASCADE
);

-- CHECKOUT
CREATE TABLE checkout (
    id INTEGER PRIMARY KEY,
    copy_id INTEGER NOT NULL REFERENCES copy(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    checkout_date DATE NOT NULL,
    due_date DATE NOT NULL
);

-- Insertions into BOOK
INSERT INTO book (id, title, isbn) VALUES
    (1, 'The Great Gatsby', '9780743273565'),
    (2, 'To Kill a Mockingbird', '9780061120084'),
    (3, '1984', '9780451524935'),
    (4, 'Pride and Prejudice', '9780141439518'),
    (5, 'The Catcher in the Rye', '9780316769488');
