exports.fileCount = 0;
var currentProgress;
var progressIndex;
var duplicateTracker;
exports.calculateProgressPercentage = function(filesCounted){
    var percentageDone = (filesCounted/exports.fileCount)*100;
    var percentageDoneDisplay = (Math.ceil(percentageDone));


    if(percentageDoneDisplay % 10 == 0 && duplicateTracker == 0){
        //console.log(progressIndex);
        duplicateTracker = 1;
        currentProgress[progressIndex] = '==';
        progressIndex++;
    }
    else if(percentageDoneDisplay % 10 != 0){
        duplicateTracker = 0;
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('['+ currentProgress.toString().replace(/,/g,'') +'] '+ percentageDoneDisplay + '% ');//
}


exports.printFileCount = function(){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Calculating number of files to scan: " + exports.fileCount);
}

exports.init = function(){
 currentProgress = ["  ","  ","  ","  ","  ","  ","  ","  ","  ","  "];
 progressIndex = 0;
 duplicateTracker = 0;
}
/*
borrowed from
http://stackoverflow.com/questions/17309749/node-js-console-log-is-it-possible-to-update-a-line-rather-than-create-a-new-l
 */