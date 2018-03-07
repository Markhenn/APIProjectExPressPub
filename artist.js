const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = artistRouter;

// ------ Routing Artists -----

const validateArtist = (req, res, next) => {
  db.get("SELECT * FROM Artist WHERE id = $id", {
    $id: req.params.artistId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Artist doesnt exist');
    }
    req.params.row = row;
    next();
    });
};

artistRouter.get('/', (req, res, next) =>{
  db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, rows) =>{
    if (err) {
      return console.log(err);
    }

    res.status(200).send({artists: rows});
  });
});


artistRouter.get('/:artistId', validateArtist, (req, res, next) =>{

    res.status(200).send({artist: req.params.row});

});


artistRouter.post('/', (req, res, next) =>{

  db.run(`INSERT INTO Artist (name, date_of_birth, biography) VALUES ($name, $dob, $bio)`, {
    $name: req.body.artist.name,
    $dob: req.body.artist.dateOfBirth,
    $bio: req.body.artist.biography
  }, function(err){

    if (err) {
      console.log(err);
      return res.status(400).send('Couldn\'t create artist');
    }
    db.get("SELECT * FROM Artist WHERE id = $id", {
      $id: this.lastID
    }, (err, row) =>{

      res.status(201).send({artist: row});
    });
  });
});



artistRouter.put('/:artistId', validateArtist, (req, res, next) =>{

    db.run(`UPDATE Artist SET
        name = $name,
        date_of_birth = $dob,
        biography = $bio,
        is_currently_employed = $ice
        WHERE id = $id
      `, {
        $name: req.body.artist.name,
        $dob: req.body.artist.dateOfBirth,
        $bio: req.body.artist.biography,
        $ice: req.body.artist.isCurrentlyEmployed,
        $id: req.params.artistId
      }, function(err){
        if (err) {
          console.log(err);
          return res.status(400).send('Couldnt update artist');
        }

        db.get("SELECT * FROM Artist WHERE id = $id", {
          $id: req.params.artistId
        }, (err, row) =>{
          res.status(200).send({artist: row});
        });
      });
  });

artistRouter.delete('/:artistId', validateArtist, (req, res, next) =>{

    db.run(`UPDATE Artist SET
        is_currently_employed = 0
        WHERE id = $id
      `, {
        $id: req.params.artistId
      }, function(err){

        if (err) {
          console.log(err);
          return res.status(400).send('Error deleting artist');
        }

        db.get("SELECT * FROM Artist WHERE id = $id", {
          $id: req.params.artistId
        }, (err, row) =>{
          res.status(200).send({artist: row});
        });

      });
  });
