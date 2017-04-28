let walk = require('walk'),
  fs = require('fs'),
  walker,
  options;

let MongoClient = require('mongodb').MongoClient,
  assert = require('assert');

const url = 'mongodb://127.0.0.1/test';
const instrType = require('./modules/instrumentTypes.js');
const compType = require('./modules/compositionTypes.js');

const getCompositionTitle = function (composition) {
  for (let i = composition.length - 1; i > 1; i--) {
    if (instrType.getInstrument(composition[i]) == '' && compType.getComposition(composition[i]) == '') {
      return composition[i];
    }
  }
  return '';
};

MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);
  console.log('Connected correctly to server');

  let uploadCount = 0;
  const sheetMusicPath = '/Sheet-Music/master-composers';
  walker = walk.walk(sheetMusicPath);

  walker.on('file', (root, fileStats, next) => {
    fs.readFile(fileStats.name, () => {
      const name = fileStats.name;
      const path = `${root}/`; // path without file name
      const fPath = path + name; // path with file name
      let shmType = '';

      uploadCount++;
      let fileType = name.split('.');
      fileType = fileType[1].toLowerCase();

				// make sure we get a newly initialized levels variable each time (we might not need this)
      let levels = '';
				// splits the path string by the characters specified below and then returns levels as an array of strings
      levels = path
					.split('.').toString()
					.split('/').toString()
					.split('\\').toString()
					.split('+').toString() // we can leverage these characters in search
					.split('~').toString()
					.split(',');

      let metadataTags = levels.toString() + name;
      metadataTags = metadataTags.split(',');
      metadataTags = metadataTags.filter(metadataTags => metadataTags.trim() != '');
      metadataTags = metadataTags.toString();
				// console.log("index path: " + metadataTags.toLocaleLowerCase())
      levels = levels.filter(levels => levels.trim() != '');

      const pathRootLevel = ((levels[1] != undefined) ? levels[0].toLowerCase() : '');
      const composerLevel = ((levels[2] != undefined) ? levels[1].toLowerCase() : '');
      const typeOfInstrument = instrType.getInstrument(fPath);
      const typeOfComposition = compType.getComposition(fPath);
      const compositionTitle = getCompositionTitle(levels);

      if (pathRootLevel == 'Copyrighted-Music-For-Sale') {
        shmType = 'copyrighted';
      }				else {
        shmType = 'public';
      }

      const note = {
        filename: name,

        metadata: {
          composerType: pathRootLevel,
          composerName: composerLevel,
          compositionType: typeOfComposition,
          compositionTitle,
          instrumentType: typeOfInstrument,
          tags: fPath,
          ipType: shmType,
          approved: true,
        },
      };

      db.collection('fs.files').insertOne(note, (err, r) => {
        console.log(fPath);
      });

      next(); // go to the next file in the tree
    });
  });

  walker.on('end', () => {
    console.log('File upload complete');
    db.close();
  });

  walker.on('errors', (root, nodeStatsArray, next) => {
    next();
  });
});
