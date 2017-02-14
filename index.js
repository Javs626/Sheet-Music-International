var express = require("express");
var app = express();
const bodyParser = require('body-parser');
var fs = require("fs");
var path = require("path");
var multer = require("multer");
var upload = multer({dest: "./uploads"});

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/");
var conn = mongoose.connection;

var sheetMusicFile;
var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/fileHandler.js', express.static(path.resolve('Client/fileHandler.js'), { maxAge: '30 days' }));

conn.once("open", function(){
  gfs = Grid(conn.db);
  sheetMusicFile = gfs.files;
  app.get("/", function(req,res){
    //renders a multipart/form-data form
    res.render("home");
  });

  //second parameter is multer middleware.
  app.post("/", upload.single("avatar"), function(req, res, next){
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    var writestream = gfs.createWriteStream({
      filename: req.file.originalname
    });
    //
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
      .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.render("fileDisplay");})})
        .on("err", function(){res.send("Error uploading image")})
          .pipe(writestream);
  });

app.get('/fileDisplay', (req, res) => {
	gfs.files.find({}).toArray((err, files) => {
		if (err) return res.status(500).send(err);
    //res.render("fileDisplay");
		res.send(files);

	});
});

app.get('/schoolMusic', (req, res) => {
	gfs.files.find({}).toArray((err, files) => {
		if (err) return res.status(500).send(err);
    res.render("fileDisplay");
		//res.send(files);

	});
});
  app.post("/pop",function(req,res) {
    //res.send("hey");
    
  "use strict";
 
  var walk = require('walk')
    , fs = require('fs')
    , walker
    ,options
    ;
 
  walker = walk.walk('./composers');
 
  walker.on("file", function (root, fileStats, next) {
    fs.readFile(fileStats.name, function () {
      // doStuff 
      var name = fileStats.name;
      var path = root;
      console.log("File Name: " + name + "Path:"+ path );
      next();
    });
  });
 
  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });
 
  walker.on("end", function () {
    console.log("all done");
  });

});

  // sends the image we saved by filename.
  /*
  app.get("/:filename", function(req, res){
      var readstream = gfs.createReadStream({filename: req.params.filename});
      readstream.on("error", function(err){
        res.send("No image found with that title");
      });
      readstream.pipe(res);
  });
*/
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

