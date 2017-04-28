"use strict";
var walk = require('walk'),
    fs = require('fs'),
    walker,
    options;
//var Grid = require("gridfs-stream");
//var mongoose = require('mongoose')

var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

var url = 'mongodb://127.0.0.1/test';


var instrType = require('./modules/instrumentTypes.js');
var compType = require('./modules/compositionTypes.js');

/*
var uri = 'mongodb://127.0.0.1/'
var options = { server: { socketOptions: { connectTimeoutMS: 10000 } } }
mongoose.connect(uri, options)
var conn = mongoose.connection
Grid.mongo = mongoose.mongo;
let gfs = Grid(conn.db);
*/

let getCompositionTitle = function (composition) {
	for (var i = composition.length - 1; i > 1; i--) {
		if (instrType.getInstrument(composition[i]) == '' && compType.getComposition(composition[i]) == '') {
			return composition[i];
		}
	}
	return '';
}

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

var uploadCount = 0;
var sheetMusicPath = '/Sheet-Music/master-composers';
walker = walk.walk(sheetMusicPath);

walker.on("file", function (root, fileStats, next) {
		fs.readFile(fileStats.name, function () {
				var name = fileStats.name;
				var path = root + '\/'; // path without file name
				var fPath = path + name; // path with file name
				var shmType = "";

				uploadCount++;
				var fileType = name.split('.');
				fileType = fileType[1].toLowerCase();

				// make sure we get a newly initialized levels variable each time (we might not need this)
				var levels = '';
				// splits the path string by the characters specified below and then returns levels as an array of strings
				levels = path
					.split('.').toString()
					.split('/').toString()
					.split('\\').toString()
					.split('+').toString() // we can leverage these characters in search
					.split('~').toString()
					.split(',');

				var metadataTags = levels.toString() + name;
				metadataTags = metadataTags.split(',');
				metadataTags = metadataTags.filter(function (metadataTags) { return metadataTags.trim() != '' });
				metadataTags = metadataTags.toString();
				// console.log("index path: " + metadataTags.toLocaleLowerCase())
				levels = levels.filter(function (levels) { return levels.trim() != '' });

				var pathRootLevel = ((levels[1] != undefined) ? levels[0].toLowerCase() : '');
				var composerLevel = ((levels[2] != undefined) ? levels[1].toLowerCase() : '');
				var typeOfInstrument = instrType.getInstrument(fPath);
				var typeOfComposition = compType.getComposition(fPath);
				var compositionTitle = getCompositionTitle(levels);

				if(pathRootLevel == "Copyrighted-Music-For-Sale"){
					shmType = "copyrighted";
				}
				else{
					shmType = "public";
				}

				var note = {
filename: name,

metadata: {
composerType: pathRootLevel,
composerName: composerLevel,
compositionType: typeOfComposition,
compositionTitle: compositionTitle,
instrumentType: typeOfInstrument,
tags: fPath,
ipType: shmType,
approved: true
}
};

db.collection('fs.files').insertOne(note, function(err, r) {
				console.log(fPath);
		});

next(); // go to the next file in the tree
});
});

walker.on('end', function () {
		console.log('File upload complete');
		db.close();
		});

walker.on('errors', function (root, nodeStatsArray, next) {
		next();
		});
});
