const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Unable to register user. Username and password are required." });
    }
    if (!isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const result = Object.keys(books)
        .filter(isbn => books[isbn].author === author)
        .map(isbn => ({ isbn: isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
    }
    return res.status(404).json({ message: `No books found by author ${author}` });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const result = Object.keys(books)
        .filter(isbn => books[isbn].title === title)
        .map(isbn => ({ isbn: isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
    }
    return res.status(404).json({ message: `No books found with title ${title}` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// ---------------------------------------------------------------
// Tasks 10-13: the same lookups done with Axios,
// using async/await and Promise callbacks
// ---------------------------------------------------------------

// Task 10: Get all books - async/await with Axios
public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving book list", error: error.message });
    }
});

// Task 11: Get book details by ISBN - Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then(response => res.status(200).send(JSON.stringify(response.data, null, 4)))
        .catch(error => res.status(404).json({ message: `Book with ISBN ${isbn} not found`, error: error.message }));
});

// Task 12: Get book details by author - async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: `No books found by author ${author}`, error: error.message });
    }
});

// Task 13: Get book details by title - Promise callbacks with Axios
public_users.get('/async/title/:title', function (req, res) {
    const title = req.params.title;
    axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then(response => res.status(200).send(JSON.stringify(response.data, null, 4)))
        .catch(error => res.status(404).json({ message: `No books found with title ${title}`, error: error.message }));
});

module.exports.general = public_users;
