//migration.js contains all the queries to build the SQLite Database

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// ------ Creating the Artist Table -----

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS Artist", err =>{
    if (err) {
      return throw err;
    }
  });

  db.run(`CREATE TABLE Artist (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    biography TEXT NOT NULL,
    is_currently_employed INTEGER DEFAULT 1
  )`, err => {
    if (err) {
      return throw err;
    }
  });
});




// ------ Creating the Series Table -----

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS Series", err =>{
    if (err) {
      return throw err;
    }
  });

  db.run(`CREATE TABLE Series (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
  )`, err => {
    if (err) {
      return throw err;
    }
  });
});



// ------ Creating the Issues Table -----

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS Issues", err =>{
    if (err) {
      return throw err;
    }
  });

  db.run(`CREATE TABLE Issues (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    issue_number TEXT NOT NULL,
    publication_date TEXT NOT NULL,
    artist_id INTEGER FOREIGN KEY NOT NULL,
    series_id INTEGER FOREIGN KEY NOT NULL
  )`, err => {
    if (err) {
      return throw err;
    }
  });
});
