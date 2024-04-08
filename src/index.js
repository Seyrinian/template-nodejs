const express = require('express');
const { db } = require('./db');
const app = express();
const port = 3000;

app.use(express.json());

let isAuthenticated = false;

app.get('/movies', (_req, res) => {
    db.all('SELECT * FROM movies', [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (rows.length === 0) {
            return res.status(204).send('No Content');
        }
        return res.status(200).json(rows);
    });
});

app.get('/movies/:movieId', (req, res) => {
    db.get(
        'SELECT * FROM movies WHERE id = ?',
        [req.params.movieId],
        (err, row) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            if (row === undefined) {
                return res.status(404).send('Not Found');
            }
            return res.status(200).json(row);
        },
    );
});

app.post('/movies', (req, res) => {
    if (
        req.body.title === undefined ||
        req.body.director === undefined ||
        req.body.year === undefined ||
        req.body.rating === undefined
    ) {
        return res.status(400).send('Bad Request');
    }
    if (req.body.rating < 0 || req.body.rating > 5) {
        return res.status(400).send('Rating must be between 0 and 5');
    }
    db.run(
        `INSERT INTO movies (
    title, 
    director, 
    year, 
    rating) 
    VALUES (?, ?, ?, ?)`,
        [req.body.title, req.body.director, req.body.year, req.body.rating],
        (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.status(201).send('Created');
        },
    );
});

app.delete('/movies/:movieId', (req, res) => {
    if (!isAuthenticated) {
        return res.status(401).send('Unauthorized');
    }

    db.run('DELETE FROM movies WHERE id = ?', [req.params.movieId], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        return res.status(204).send('No Content');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        isAuthenticated = true;
        return res.status(200).send('Logged in successfully');
    } else {
        isAuthenticated = false;
        return res.status(401).send('Unauthorized');
    }
});

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = { app, server };
