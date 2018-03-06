//This file contains all the server routing logic

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const PORT = process.env.PORT || 4000;

module.exports = app;

app.use(bodyParser.json());
app.use(morgan('dev'));

app.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
