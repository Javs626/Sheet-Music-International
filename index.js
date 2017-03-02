var express = require("express");
var app = express();
const bodyParser = require('body-parser');
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var upload = multer({ dest: "./uploads" });
var http = require('http');

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/");
var conn = mongoose.connection;

var sheetMusicFile;
var gfs;
const pieceType = [
  "Duets",
  "piano-concertos",
  "violin-concertos",
  "oboe-concertos",
  "concertos",
  "overtures",
  "symphony",
  "books",
  "choral",
  "contata",
  "Ballata",
  "Estampie",
  "Organum",
  "Saltarello",
  "Ballade",
  "Canzona",
  "Carol",
  "Chanson",
  "Fantasia",
  "Galliard",
  "Intermedio",
  "Laude",
  "Litany",
  "Madrigal",
  "Mass",
  "Opera",
  "Operetta",
  "Singspiel",
  "Zarzuela",
  "Oratorio",
  "Polonaise",
  "Prelude",
  "Quartet",
  "Quintet",
  "Requiem",
  "Rhapsody",
  "Rondo",
  "Scherzo",
  "Serenade",
  "Sonata",
  "Suite",
  "Waltz",
  "Ballet",
  "Blues",
  "Burlesque",
  "Cabaret",
  "Jazz",
  "jazz standard",
  "Vaudeville",
  "Motet",
  "Pavane",
  "Ricercar",
  "Sequence",
  "Tiento",
  "Toccata",
  "Baroque",
  "Allemande",
  "Canon",
  "Cantata",
  "Chaconne",
  "Courante",
  "Fugue",
  "Gavotte",
  "Gigue",
  "Minuet",
  "Oratorio",
  "Partita",
  "Passacaglia",
  "Passepied",
  "Sarabande",
  "Sinfonia",
  "Bagatelle",
  "Caprice",
  "Divertimento",
  "etude",
  "Impromptu",
  "Intermezzo",
  "Mazurka",
  "March",
  "Nocturne"
];
const instrumentType = [
  "Violin",
  "Viola",
  "Cello",
  "Bass",
  "Flute",
  "Piccolo",
  "Oboe",
  "English horn",
  "Clarinet",
  "Bass clarinet",
  "Bassoon",
  "Contrabassoon",
  "Saxophones",
  "Trumpet",
  "Horn",
  "french horn",
  "Trombone",
  "Tuba",
  "Celesta",
  "Piano",
  "Harpsichord",
  "Organ",
  "Synthesizer",
  "Harp",
  "Snare drum",
  "Bass drum",
  "Cymbals",
  "Tambourine",
  "Triangle",
  "Xylophone",
  "Glockenspiel",
  "Chimes",
  "Marimba",
  "Vibraphone",
  "Soprano",
  "Mezzo-soprano",
  "Alto",
  "Countertenor",
  "Tenor",
  "Baritone",
  "Bass"
];
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

conn.once("open", function () {
  console.log("We are up and running!");
  gfs = Grid(conn.db);
  sheetMusicFile = gfs.files;
  app.get("/", function (req, res) {
    //renders a multipart/form-data form

    res.render("home");
  });

  //second parameter is multer middleware.
  app.post("/", upload.single("avatar"), function (req, res, next) {
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    var writestream = gfs.createWriteStream({
      filename: req.file.originalname
    });
    //
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
      .on("end", function () { fs.unlink("./uploads/" + req.file.filename, function (err) { res.send("File Sent!"); }) })
      .on("err", function () { res.send("Error uploading image") })
      .pipe(writestream);
  });

  app.post("/search", function (req, res) {
    var file = req.body.file;
    gfs.files.find({ filename: new RegExp(file, 'i') }).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("results", { files: files });
    });
  });

  //Displays All files currently in database in json format
  app.get('/fileDisplay', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.send(files);
    });
  });

  app.get('/schoolMusic', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("schoolMusic", { files: files });
    });
  });

  app.get('/alphabetical/:range', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("masterComposers.ejs", { files: files });
    });
  });

  app.post("/pop", function (req, res) {

    "use strict";

    var walk = require('walk')
      , fs = require('fs')
      , walker
      , options
      ;

    walker = walk.walk('./master-composers');

    walker.on("file", function (root, fileStats, next) {
      fs.readFile(fileStats.name, function () {
        var name = fileStats.name;
        var path = root + "\\"; // path without file name
        var fPath = path + name; // path with file name
        //console.log(name);
      console.log(fPath);
      // We need to check if the file is a pdf, it is not a pdf, skip
      var fileType = name.split('.');
      fileType = fileType[1].toLowerCase();
      //console.log(fileType[1].toLowerCase());

     // if (fileType == "pdf"){
        
      //  console.log("file type pdf confirmed");

  // make sure we get a newly initialized levels variable each time (we might not need this)
  var levels = '';
  //splits the path string by the characters specified below and then returns levels as an array of strings
  levels = path
  .split('.').toString()
  .split("/").toString()
  .split("\\").toString()
  .split('+').toString()// we can leverage these characters in search
  .split('~').toString()
  .split(',');
  // filter out any blank entries as a result of string splitting
  levels = levels.filter(function(levels){return levels.trim() != ''});
  // in order to not have any possible null exceptions, we see if the array
  //value is undefined, if we have a value set it to its corresponding levels
  //else set it to an empty string
  var pathRootLevel = ((levels[0] != undefined) ? levels[0]:'');
  var composerLevel = ((levels[1] != undefined) ? levels[1]:'');
  // depending on the depth of the path, level 2 could either be a type or title
  var pieceTypeLevel = '';
  var pieceTitleLevel = '';
  var pieceInstrumentLevel = '';
  //var pieceTitleLevel = ((levels[3] != undefined) ? levels[3]:'');
  if(levels[2] != undefined && getMetadataType(levels[2]) == "pieceTypeLevel"){
    pieceTypeLevel = levels[2];
  }
  else if (levels[2] != undefined && getMetadataType(levels[2]) == "pieceInstrumentLevel"){
    pieceInstrumentLevel = levels[2];
  }
  else if(levels[2] != undefined){
    pieceTitleLevel = levels[2];
  }

  if (levels[3] != undefined && getMetadataType(levels[3]) == "pieceInstrumentLevel") {
    pieceInstrumentLevel = levels[3];
  }
  else if(levels[3] != undefined) {
    pieceTitleLevel = levels[3];
  }
  //for debugging to see if each level is formatted correctly
 /* console.log(
    "Path Root: " + pathRootLevel + 
    " Composer: " + composerLevel + 
    " Piece Type: " + pieceTypeLevel + 
    " Instrument Type: " + pieceInstrumentLevel +
    " Title: " + pieceTitleLevel);*/
        
        /*
                  metadata: {
            composerType: pathRootLevel,
            composer: composerLevel,
            pieceTypeorTitle: pieceTypeorTitleLevel,
            pieceTitle: pieceTitleLevel,
            approved: true
          } */
        upload.single("avatar");
        var writestream = gfs.createWriteStream({
          filename: name
        });
        //
        // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
        fs.createReadStream(fPath)
          .on("end", function () { })
          .on("err", function () { console.log('success') })
          .pipe(writestream);
    //  }
        next();// go to the next file in the tree
      });
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
      next();
    });

    walker.on("end", function () {
      console.log("all done");
      res.render("home");
    });
  });

  var getMetadataType = function (data) {
    for (var i = 0; i < pieceType.length; i++) {
      if (data.toLowerCase() == pieceType[i].toLowerCase()) {
        return "pieceType";
      }
    }
    for (var i = 0; i < instrumentType.length; i++) {
      if (data.toLowerCase() == instrumentType[i].toLowerCase()) {
        return "pieceInstrumentLevel";
      }
    }
  }

  app.get("/file/:id", function (req, res) {
    //getFileById(req.params.id);
    /* var readstream = gfs.createReadStream({filename: req.params.id});
     readstream.on("error", function(err){
       res.send("No image found with that title");
     });
     readstream.pipe(res);*/

    gfs.findOne({ _id: req.params.id }, function (err, file) {
      console.log(req.params.id);
      if (err) {
        return res.status(400).send(err);
      }
      else if (!file) {
        return res.status(404).send('Error on the database looking for the file.');
      }

      res.set('Content-Type', file.contentType);
      res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

      var readstream = gfs.createReadStream({
        _id: req.params.ID
      });

      readstream.on("error", function (err) {
        res.end();
      });
      readstream.pipe(res);
    });
  });


  //delete the image
  /*
  app.get("/delete/:filename", function(req, res){
    gfs.exist({filename: req.params.filename}, function(err, found){
      if(err) return res.send("Error occured");
      if(found){
        gfs.remove({filename: req.params.filename}, function(err){
          if(err) return res.send("Error occured");
          res.send("Image deleted!");
        });
      } else{
        res.send("No image found with that title");
      }
    });
  });*/
});

app.set("view engine", "ejs");
app.set("views", "./views");

if (!module.parent) {
  app.listen(3000);
}



