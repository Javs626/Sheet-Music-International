var express = require('express')
var app = express()
const bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
var multer = require('multer')
var upload = multer({ dest: './uploads' })
var http = require('http')

var mongoose = require('mongoose')
var uri = 'mongodb://127.0.0.1/'
var options = { server: { socketOptions: { connectTimeoutMS: 10000 } } }
mongoose.connect(uri, options)
var conn = mongoose.connection

var sheetMusicFile
var gfs
var compType = require('./modules/compositionTypes.js');
var instrType = require('./modules/instrumentTypes.js');
var progress = require('./modules/progressCounter.js');
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use( express.static( "public" ) );


//this line is used to add files inside the public folder
app.use(express.static(__dirname + '/public'));

conn.once("open", function () {
  console.log("We are up and running! localhost 3000");
  gfs = Grid(conn.db);
  sheetMusicFile = gfs.files;
  app.get("/", function (req, res) {
    //renders a multipart/form-data form

    res.render("home");
  });

  //second parameter is multer middleware.
  app.post("/", upload.single("avatar"), function (req, res, next) {
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    //todo: research forms with multiple inputs
    //then take input and run them through the composition and instrument type filter
    //only if they are empty when they come back (the user did not fill out the form)
    //then use that data to fill out the file metadata 
    //test the approved field and after it is verified to work,
    //then set it to false since admins will have to approve the uploads.
    /*
                metadata: {
              composerType: pathRootLevel,
              composerName: composerLevel,
              compositionType: typeOfComposition,
              compositionTitle: compositionTitle,
              instrumentType: typeOfInstrument,
              filePath: metadatafullpath,
              ipType: "public",
              approved: true
            }
     */
    var writestream = gfs.createWriteStream({
      filename: req.file.originalname,
      metadata: {
        composerType: 'master-composers',
        composerName: 'John Williams',
        compositionType: 'Soundtrack',
        compositionTitle: 'Starwars Theme Song',
        instrumentType: 'trumpet',
        filePath: 'master-composerJohn WilliamsSoundtrackStarwars Theme Songtrumpet',
        ipType: 'private',
        approved: true
      }
    })
    //
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream('./uploads/' + req.file.filename)
      .on('end', function () { fs.unlink('./uploads/' + req.file.filename, function (err) { res.send('File Sent!'); }) })
      .on('err', function () { res.send('Error uploading image') })
      .pipe(writestream)
  })

  app.post('/search', function (req, res) {
    var select = req.body.ipTypeList
    var selectRegex = ''
    var file = req.body.file.toString()
    var searchTerms = file.split(' ')
    var regex = ''
    var inst = instrType.getInstrument(file)
    var compT = compType.getComposition(file)
    for (var i = 0; i < searchTerms.length; i++) {
      if (regex == '') {
        regex = '(?=.*' + searchTerms[i] + ')'
      } else {
        regex = regex + '(?=.*' + searchTerms[i] + ')'
      }
    }
    if (select == 'public') {
      selectRegex = 'public'
    } else {
      selectRegex = '.*'
    }

    console.log(select)
    console.log(file)
    console.log(searchTerms)
    console.log(regex)
    // { filename: { $regex: /^A/i } }

    gfs.files.find({
      'metadata.filePath': new RegExp(regex, 'i'),
      'metadata.ipType': new RegExp(selectRegex, 'i')
    }).collation({
      locale: 'en',
      strength: 2
    }).sort({
      filename: 1
    }).toArray((err, files) => {
      if (err) return res.status(500).send(err)
      res.render('search', { files: files, query:file})
    })
  })

  // Displays All files currently in database in json format
  app.get('/fileDisplay', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err)
      res.send(files)
    })
  })

  app.get('/schoolMusic', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err)
      res.render('schoolMusic', { files: files })
    })
  })

  app.get('/faq', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("faq.ejs", { files: files });
    });
  });
  app.get('/repertoire-instrumental', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("repertoire-instrumental.ejs", { files: files });
    });
  });
  //repertoire

  app.get('/trombone', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/trombone.ejs', { files: files });

    });
  });
  app.get('/violin', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/violin.ejs', { files: files });

    });
  });
  app.get('/viola', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/viola.ejs', { files: files });

    });
  });
  app.get('/cello', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/cello.ejs', { files: files });

    });
  });
  app.get('/bass', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/bass.ejs', { files: files });

    });
  });
  app.get('/Flute', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/Flute.ejs', { files: files });

    });
  });
  app.get('/Clarinet', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/Clarinet.ejs', { files: files });

    });
  });
  app.get('/Oboe-English-Horn', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/Oboe-English-Horn.ejs', { files: files });

    });
  });
  app.get('/bassoon', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/bassoon.ejs', { files: files });

    });
  });
  app.get('/Saxophone', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/Saxophone.ejs', { files: files });

    });
  });
  app.get('/trumpet', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/trumpet.ejs', { files: files });

    });
  });
  app.get('/tuba', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/tuba.ejs', { files: files });

    });
  });
  app.get('/piano', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/piano.ejs', { files: files });
    });
  });
  //end repertoire




  app.get('/ab', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalAB.ejs", { files: files });
    });
  });

   app.get('/ce', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
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
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
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
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
    locale: 'en',
    strength: 2
}).sort({
    filename: 1
}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalIN.ejs", { files:files });
    });
  });

       app.get('/or', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
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
    gfs.files.find({"metadata.composerType": "master-composers"}).collation({
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
      res.render("home");
    var walk = require('walk')
      , fs = require('fs')
      , walker
      , options
      ;
      var uploadCount = 0;
    walker = walk.walk('./master-composers');

    walker.on("file", function (root, fileStats, next) {
      fs.readFile(fileStats.name, function () {
        var name = fileStats.name
        var path = root + '\\' // path without file name
        var fPath = path + name // path with file name
        uploadCount++;
        var shmType = "public";
        if(uploadCount > 1000){
            shmType = "private";
        }
        //console.log("blue");
        progress.calculateProgressPercentage(uploadCount);
        //console.log(fPath)
        
        // We need to check if the file is a pdf, it is not a pdf, skip
        var fileType = name.split('.')
        fileType = fileType[1].toLowerCase()
        // console.log(fileType[1].toLowerCase())

        if (fileType == 'pdf') {

          //  console.log("file type pdf confirmed")

          // make sure we get a newly initialized levels variable each time (we might not need this)
          var levels = ''
          // splits the path string by the characters specified below and then returns levels as an array of strings
          levels = path
            .split('.').toString()
            .split('/').toString()
            .split('\\').toString()
            .split('+').toString() // we can leverage these characters in search
            .split('~').toString()
            .split(',')

          var metadatafullpath = levels.toString() + name
          metadatafullpath = metadatafullpath.split(',')
          metadatafullpath = metadatafullpath.filter(function (metadatafullpath) { return metadatafullpath.trim() != '' })
          metadatafullpath = metadatafullpath.toString()
          // console.log("index path: " + metadatafullpath.toLocaleLowerCase())
          levels = levels.filter(function (levels) { return levels.trim() != '' })

          var pathRootLevel = ((levels[0] != undefined) ? levels[0].toLowerCase() : '')
          var composerLevel = ((levels[1] != undefined) ? levels[1].toLowerCase() : '')
          var typeOfInstrument = instrType.getInstrument(fPath)
          var typeOfComposition = compType.getComposition(fPath)
          var compositionTitle = getCompositionTitle(levels)
          // for debugging
          
                    //console.log("composerType: " + pathRootLevel)
                    //console.log("composerName: " + composerLevel)
                    //console.log("composition: " + typeOfComposition)
                    //console.log("instrument: " + typeOfInstrument)
                    //console.log("title: " + compositionTitle)
          
          // todo: rename file path in metadata,the term is left over from the old system
          // and does not resemble how the system now operates.
          upload.single('avatar')
          var writestream = gfs.createWriteStream({
            filename: name,

            metadata: {
              composerType: pathRootLevel,
              composerName: composerLevel,
              compositionType: typeOfComposition,
              compositionTitle: compositionTitle,
              instrumentType: typeOfInstrument,
              filePath: metadatafullpath,
              ipType: shmType,
              approved: true
            }
          })
          //
          // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
          fs.createReadStream(fPath)
            .on('end', function () { })
            .on('err', function () { console.log('success') })
            .pipe(writestream)
        }
        next() // go to the next file in the tree
      })
    })

        walker.on('end', function () {
      console.log('File upload complete')
    })

    walker.on('errors', function (root, nodeStatsArray, next) {
      next()
    })


    
  })

  app.post('/scan', function (req, res) {
        res.render('home');

  
    'use strict'

    var walk = require('walk'),
      fs = require('fs'),
      walker,
      options


    walker = walk.walk('./master-composers')

      progress.fileCount = 0;
      progress.init();
    walker.on('file', function (root, fileStats, next) {
      fs.readFile(fileStats.name, function () {
        progress.fileCount++;
        progress.printFileCount();
        next() 
      })
    })
        walker.on('end', function () {
      console.log(' Done scanning')
    })

    walker.on('errors', function (root, nodeStatsArray, next) {
      next()
    })    
  })

  var getMetadataType = function (data) {
    for (var i = 0; i < pieceType.length; i++) {
      if (data.toLowerCase() == pieceType[i].toLowerCase()) {
        return 'pieceType'
      }
    }
    for (var i = 0; i < instrumentType.length; i++) {
      if (data.toLowerCase() == instrumentType[i].toLowerCase()) {
        return 'pieceInstrumentLevel'
      }
    }
  }

  app.get('/file/:id', function (req, res) {
    // getFileById(req.params.id)
    /* var readstream = gfs.createReadStream({filename: req.params.id})
     readstream.on("error", function(err){
       res.send("No image found with that title")
     })
     readstream.pipe(res);*/

    gfs.findOne({ _id: req.params.id }, function (err, file) {
      console.log(req.params.id)
      if (err) {
        return res.status(400).send(err)
      }
      else if (!file) {
        return res.status(404).send('Error on the database looking for the file.')
      }

      res.set('Content-Type', file.contentType)
      res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"')

      var readstream = gfs.createReadStream({
        _id: req.params.id
      })

      readstream.on('error', function (err) {
        res.end()
      })
      readstream.pipe(res)
    })
  })

  var getCompositionTitle = function (composition) {
    for (var i = composition.length - 1; i > 1; i--) {
      if (instrType.getInstrument(composition[i]) == '' && compType.getComposition(composition[i]) == '') {
        return composition[i]
      }
    }
    return ''
  }
  // delete the image
  /*
  app.get("/delete/:filename", function(req, res){
    gfs.exist({filename: req.params.filename}, function(err, found){
      if(err) return res.send("Error occured")
      if(found){
        gfs.remove({filename: req.params.filename}, function(err){
          if(err) return res.send("Error occured")
          res.send("Image deleted!")
        })
      } else{
        res.send("No image found with that title")
      }
    })
  });*/
})

app.set('view engine', 'ejs')
app.set('views', './views')

if (!module.parent) {
  app.listen(3000)
}
