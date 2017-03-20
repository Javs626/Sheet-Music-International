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
    var file = req.body.file.toString();
    var searchTerms = file.split(" ");

    console.log(file);
    console.log(searchTerms);
    
    //{ filename: { $regex: /^A/i } }
    
 gfs.files.find({ filename: new RegExp(file, 'i') }).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("search", { files: files });
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
app.get('/faq', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("faq", { files: files });
    });
  });
  app.get('/ab', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("masterComposers.ejs", { files: files });
    });
  });

   app.get('/ce', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalCE.ejs", { files: files });
    });
  });

     app.get('/fh', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalFH.ejs", { files: files });
    });
  });

       app.get('/in', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalIN.ejs", { files: files });
    });
  });

       app.get('/or', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalOR.ejs", { files: files });
    });
  });

      app.get('/sz', (req, res) => {
    gfs.files.find({}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalSZ.ejs", { files: files });
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
        console.log(fPath);
        upload.single("avatar");
        var writestream = gfs.createWriteStream({
          filename: name
        });
        //
        // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
        fs.createReadStream(fPath)
          .on("end", function () { })
          .on("err", function () { console.log(success) })
          .pipe(writestream);
        next();// go to the next file in the tree

      });
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
      next();
    });

    walker.on("end", function () {
      console.log("all done");
    });
  });


  app.get("/file/:id", function (req, res) {

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
        _id: req.params.id
      });

      readstream.on("error", function (err) {
        res.end();
      });
      readstream.pipe(res);
    });
  });



});

app.set("view engine", "ejs");
app.set("views", "./views");

if (!module.parent) {
  app.listen(3000);
}

