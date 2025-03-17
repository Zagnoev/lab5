const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config(); 

const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

app.get('/whoami', (req, res) => {
    res.json({ studentNumber: "2282203" }); 
});

app.get('/books', (req, res) => {
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
});

app.post('/books', (req, res) => {
    console.log("Received Request Body:", req.body);
    const id = req.body.id;
    const title = req.body.title;
    const details = req.body.details || []; 

    if (!id || !title) {
        return res.status(400).json({ error: "Missing required fields: id, title" });
    }

    if (books.some(b => b.id === id)) {
        return res.status(400).json({ error: "Book with this ID already exists" });
    }
    
    const newBook = {
        id: id,
        title: title,
        details: details.map(detail => ({
            id: detail.id || "", 
            author: detail.author || "", 
            genre: detail.genre || "", 
            publicationYear: detail.publicationYear || null 
        }))
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});


app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const { title, details } = req.body;

    if (title) book.title = title; 

    if (details) {
        book.details = book.details.map(existingDetail => {
            const updatedDetail = details.find(d => d.id === existingDetail.id);
            return updatedDetail ? { ...existingDetail, ...updatedDetail } : existingDetail;
        });
    }

    res.json(book);
});


app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found" });
    }
    books.splice(bookIndex, 1);
    res.status(204).send();
});



app.post('/books/:id/details', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    const { author, genre, publicationYear } = req.body;
    
    let existingDetail = book.details.find(d => d.id === "1"); 

    if (existingDetail) {
        if (author) existingDetail.author = author;
        if (genre) existingDetail.genre = genre;
        if (publicationYear) existingDetail.publicationYear = publicationYear;
        return res.status(200).json(book);
    }

    const newDetail = {
        id: "1", 
        author: author || "",
        genre: genre || "",
        publicationYear: publicationYear || null
    };
    
    book.details.push(newDetail);
    res.status(201).json(book);
});


app.delete('/books/:id/details/:detailId', (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    
    const detail = book.details.find(d => d.id === req.params.detailId);
    if (!detail) {
        return res.status(404).json({ error: "Detail not found" });
    }
    
    const { field } = req.body;
    
    if (!field || !detail.hasOwnProperty(field)) {
        return res.status(400).json({ error: "Invalid or missing field" });
    }
    
    delete detail[field];
    res.status(200).json(book);
});
    

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
