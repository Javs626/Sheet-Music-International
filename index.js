var express = require('express')
var app = express()
const bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
var multer = require('multer')
var upload = multer({ dest: './uploads' })
var http = require('http')
var util = require('util');
var passport = require('passport')
var login = require('./login');
var request = require('request');
var dotenv = require('dotenv');
var config = require('./config');
var mongoose = require('mongoose')
var uri = 'mongodb://127.0.0.1/'
var options = { server: { socketOptions: { connectTimeoutMS: 10000 } } }
mongoose.connect(uri, options)
var conn = mongoose.connection
var auth = require('http-auth');
var basic = auth.basic ({
	realm: "SHM area.",
	}, (username, password, callback) => {
		callback(username === "Scottsdale" && password === "Philharmonic");
	}
);



var sheetMusicFile
var gfs
var compType = require('./modules/compositionTypes.js');
var instrType = require('./modules/instrumentTypes.js');
//var progress = require('./modules/progressCounter.js');
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

dotenv.load();
// Configure Logging
config.log(app);

// Configure templates
config.template(app);

// Configure parsers
config.parsers(app);

// Configure session
config.session(app);

// Configure passport
config.passport(app);

// Configure static folders
config.static(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static( './public' ) );
app.use('/sheet-music', express.static( './sheet-music' ) );
app.use(auth.connect(basic));

conn.once("open", function () {
  console.log("We are up and running! localhost 3000");
  gfs = Grid(conn.db);
  sheetMusicFile = gfs.files;

    app.get('/',
    //login.redirectIfAuth('/user'),
    function(req, res) {
      res.render('home', {
        env: {
          AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
          AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
          AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
        }
      });
    });

      app.get('/callback',
    passport.authenticate('auth0'),
    function(req, res) {
      // Check if the user has an account type flag
      // If they don't, they are not registered and need to
      // be taken to the registration page
      if (!req.user._json.user_metadata || !req.user._json.user_metadata.account_type) {
        res.redirect("/register");
      } else {
        req.user.account_type = req.user._json.user_metadata.account_type;
      }
      res.redirect("/user");
    });
    /*
  app.get("/", function (req, res) {
    //renders a multipart/form-data form

    res.render("home");
  });*/

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
              tags: metadataTags,
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
        tags: 'master-composerJohn WilliamsSoundtrackStarwars Theme Songtrumpet',
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
    if(file != ""){

    
    var searchTerms = file.split(' ')
    var regex = ''
    var inst = instrType.getInstrument(file)
    var compT = compType.getComposition(file)
    for (var i = 0; i < searchTerms.length; i++) {
      if (regex == '') {
        regex = searchTerms[i]
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
      'metadata.tags': new RegExp(regex, 'i'),
      'metadata.ipType': new RegExp(selectRegex, 'i')
    }).sort({
      filename: 1
    }).toArray((err, files) => {
      res.render('search', { files: files, query: req.body.file})
    })
  }
  else{
    console.log("hey, bad search");
    res.render('search', {files:undefined,query:file})
  }
  })

function removeDuplicates(num) {
  var x,
      len=num.length,
      out=[],
      obj=[];
 
  for (x=0; x<len; x++) {
    obj[num[x]]=0;
  }
  for (x in obj) {
    out.push(x);
  }
  return out;
}
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

  app.get('/donate', (req, res) => {
      res.render('donate')
  })
  /*app.get('/register', (req, res) => {
      res.render('register')

  })*/

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
      res.render(__dirname + '/views/repertoire/flute.ejs', { files: files });

    });
  });
  app.get('/Clarinet', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/clarinet.ejs', { files: files });

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
      res.render(__dirname + '/views/repertoire/saxophone.ejs', { files: files });

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
  app.get('/organ', (req, res) => {
    gfs.files.find({}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render(__dirname + '/views/repertoire/organ.ejs', { files: files });
    });
  });
  //end repertoire




  app.get('/ab', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalAB.ejs", { files: files });
    });
  });

   app.get('/ce', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalCE.ejs", { files: files });
    });
  });

     app.get('/fh', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalFH.ejs", { files: files });
    });
  });

       app.get('/in', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalIN.ejs", { files:files });
    });
  });

       app.get('/or', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalOR.ejs", { files: files });
    });
  });

      app.get('/sz', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("alphabeticalSZ.ejs", { files: files });
    });
  });

  app.get('/masterComposers', (req, res) => {
    gfs.files.find({"metadata.composerType": "master-composers"}).toArray((err, files) => {
      if (err) return res.status(500).send(err);
      res.render("masterComposers.ejs", { files: files });
    });
  });

  app.post('/scan', function (req, res) {
        res.render('home');

  
    'use strict'

    var walk = require('walk'),
      fs = require('fs'),
      walker,
      options


    walker = walk.walk('./master-composers')

      //progress.fileCount = 0;
      //progress.init();
    walker.on('file', function (root, fileStats, next) {
      fs.readFile(fileStats.name, function () {
        //progress.fileCount++;
        //progress.printFileCount();
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

  
app.get('user',function(req,res){
  res.render('user');
});

    app.post('/user',
    login.required,
    function(req, res) {
      var fname = req.body.firstname;
      var lname = req.body.lastname;
      var email = req.body.email;
      var userid = req.user.id;

      var fullname = fname + " " + lname;

   conn.collection('users').insert( {
     "userId":userid,
     "firstname":fname,
     "lastname":lname,
     "email":email,
      "musicCollection" : [],
      "fullname" : fullname
   },
   function(error,response){
     console.log(response.ops[0]);
           res.render('user', {
        user: response.ops[0]
      });
   }
   );
    });

  app.get('/register',
    login.required,
    function(req, res) {
      console.log(req.user);
      console.log("bork!");
      res.render('register', {
        user: req.user
      });
    });

  app.post('/register',
    login.required,
    function(req, res) {
      console.log("bork!");
      var user_id = req.user.id;
      var account_type = req.body.account_type;
      // TODO: Validate your fields here

      request({
        method: 'PATCH',
        url: util.format('https://%s/api/v2/users/%s', process.env['AUTH0_DOMAIN'], user_id),
        json: {
          user_metadata: {
            account_type: account_type
          }
        },
        headers: {
          Authorization: 'Bearer ' + process.env['AUTH0_API_KEY']
        }
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
          throw error;
        }
        if (response.statusCode !== 200) {
          console.log(request.statusCode);
          console.log(body);
          throw 'Invalid request';
        }
        req.user.account_type = account_type;
        if (req.query.return_url) {
          res.redirect(req.query.return_url);
        } else {
          res.redirect('/user');
        }
      })
    });

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

//app.set('view engine', 'ejs')
//app.set('views', './views')

if (!module.parent) {
  app.listen(3000)
}
