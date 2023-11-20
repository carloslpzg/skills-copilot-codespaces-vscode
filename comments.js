//Create web server with Express
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const { Client } = require('pg');

//Set up the connection to the database
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'comments',
  password: 'postgres',
  port: 5432,
});
client.connect();

//Set up the body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set up the static folder
app.use(express.static('public'));

//Create a GET route that returns all comments
app.get('/api/comments', (req, res) => {
  const query = 'SELECT * FROM comments';
  client.query(query, (err, result) => {
    if (err) {
      console.log(err.stack);
    } else {
      res.json(result.rows);
    }
  });
});

//Create a POST route that adds a new comment
app.post(
  '/api/comments',
  [
    check('name')
      .isLength({ min: 1 })
      .withMessage('Name is required'),
    check('comment')
      .isLength({ min: 1 })
      .withMessage('Comment is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const name = req.body.name;
      const comment = req.body.comment;
      const query =
        'INSERT INTO comments (name, comment) VALUES ($1, $2) RETURNING *';
      const values = [name, comment];
      client.query(query, values, (err, result) => {
        if (err) {
          console.log(err.stack);
        } else {
          res.json(result.rows[0]);
        }
      });
    } else {
      res.status(422).json({ errors: errors.array() });
    }
  }
);

//Create a DELETE route that deletes a comment
app.delete('/api/comments/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM comments WHERE id = $1';
  const values = [id];
  client.query(query, values, (err, result) => {
    if (err) {
      console.log(err.stack);
    } else

