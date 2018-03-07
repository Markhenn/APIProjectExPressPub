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


// ------ Start of Routing -----

const artistRouter = require('./artist.js');
app.use('/api/artists', artistRouter);


// ------ Routing Series -----

app.get('/api/series', (req, res, next) =>{
  db.all("SELECT * FROM Series", (err, rows) =>{
    if (err) {
      return console.log(err);
    }

    res.status(200).send({series: rows});
  });
});

app.get('/api/series/:seriesId', (req, res, next) =>{
  db.get("SELECT * FROM series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    res.status(200).send({series: row});
  });
});

app.post('/api/series', (req, res, next) =>{

  db.run(`INSERT INTO Series (name, description) VALUES ($name, $des)`, {
    $name: req.body.series.name,
    $des: req.body.series.description
  }, function(err){

    if (err) {
      console.log(err);
      return res.status(400).send('Couldn\'t create series');
    }
    db.get("SELECT * FROM Series WHERE id = $id", {
      $id: this.lastID
    }, (err, row) =>{

      res.status(201).send({series: row});
    });
  });
});


app.put('/api/series/:seriesId', (req, res, next) =>{
  db.get("SELECT * FROM Series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    db.run(`UPDATE Series SET
        name = $name,
        description = $des
        WHERE id = $id
      `, {
        $name: req.body.series.name,
        $des: req.body.series.description,
        $id: req.params.seriesId
      }, function(err){
        if (err) {
          console.log(err);
          return res.status(400).send('Couldnt update series');
        }

        db.get("SELECT * FROM Series WHERE id = $id", {
          $id: req.params.seriesId
        }, (err, row) =>{
          res.status(200).send({series: row});
        });
      });
  });
});

app.delete('/api/series/:seriesId', (req, res, next) =>{
  db.get("SELECT * FROM Series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    db.get("SELECT * FROM Issue WHERE series_id = $id", {
      $id: req.params.seriesId
    }, (err, row) =>{

      if (err) {
        return console.log(err);
      }

      if (row) {
        return res.status(400).send('Related issues exist');
      }

      db.run("DELETE FROM Series WHERE id = $id", {
        $id: req.params.seriesId
      }, err =>{

        if (err) {
          console.log(err);
        }

        res.status(204).send('Series deleted')
      });

    });
  });
});



// ------ Routing Issues -----

app.get('/api/series/:seriesId/issues', (req, res, next) =>{

  db.get("SELECT * FROM series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    db.all("SELECT * FROM Issue WHERE series_id = $sid", {
      $sid: req.params.seriesId
    }, (err, rows) =>{
      if (err) {
        console.log(err);
      }

      res.status(200).send({issues: rows});
    });
  });
});

app.post('/api/series/:seriesId/issues', (req, res, next) =>{

    db.get("SELECT * FROM series WHERE id = $id", {
      $id: req.params.seriesId
    }, (err, row) =>{

      if (err || !row) {
        console.log(err);
        return res.status(404).send('Series doesnt exist');
      }

      db.get("SELECT * FROM Artist WHERE id = $id", {
        $id: req.body.issue.artistId
      }, (err, row) =>{

        if (err || !row) {
          console.log(err);
          return res.status(400).send('Artist doesnt exist');
        }



        db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
        VALUES ($name, $isn, $pubDate, $artId, $serId)`, {
          $name: req.body.issue.name,
          $isn: req.body.issue.issueNumber,
          $pubDate: req.body.issue.publicationDate,
          $artId: req.body.issue.artistId,
          $serId: req.params.seriesId
        }, function(err){

          if (err) {
            console.log(err);
            return res.status(400).send('Couldn\'t create issue');
          }
          db.get("SELECT * FROM Issue WHERE id = $id", {
            $id: this.lastID
          }, (err, row) =>{

            res.status(201).send({issue: row});
          });
        });
      });
    });
});


app.put('/api/series/:seriesId/issues/:issueId', (req, res, next) =>{

  db.get("SELECT * FROM Series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    db.get("SELECT * FROM Issue WHERE id = $id", {
      $id: req.params.issueId
    }, (err, row) =>{

      if (err || !row) {
        console.log(err);
        return res.status(404).send('Issue doesnt exist');
      }

      db.run(`UPDATE Issue SET
          name = $name,
          issue_number = $isn,
          publication_date = $pubDate,
          artist_id = $artId
          WHERE id = $id
        `, {
          $name: req.body.issue.name,
          $isn: req.body.issue.issueNumber,
          $pubDate: req.body.issue.publicationDate,
          $artId: req.body.issue.artistId,
          $id: req.params.issueId
        }, function(err){
          if (err) {
            console.log(err);
            return res.status(400).send('Couldnt update issue');
          }

          db.get("SELECT * FROM Issue WHERE id = $id", {
            $id: req.params.issueId
          }, (err, row) =>{
            res.status(200).send({issue: row});
          });
        });
  });
  });
});

app.delete('/api/series/:seriesId/issues/:issueId', (req, res, next) =>{
  db.get("SELECT * FROM Series WHERE id = $id", {
    $id: req.params.seriesId
  }, (err, row) =>{

    if (err || !row) {
      console.log(err);
      return res.status(404).send('Series doesnt exist');
    }

    db.get("SELECT * FROM Issue WHERE id = $id", {
      $id: req.params.issueId
    }, (err, row) =>{

      if (err || !row) {
        console.log(err);
        return res.status(404).send('Issue doesnt exist');
      }

      db.run("DELETE FROM Issue WHERE id = $id", {
        $id: req.params.issueId
      }, err =>{

        if (err) {
          console.log(err);
        }

        res.status(204).send('Issue deleted')
      });

    });
  });
});
