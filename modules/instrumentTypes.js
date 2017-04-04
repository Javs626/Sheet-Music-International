var instrumentType = [
  "violin",
  "viola",
  "cello",
  "bass",
  "flute",
  "piccolo",
  "oboe",
  "english horn",
  "clarinet",
  "bass clarinet",
  "bassoon",
  "contrabassoon",
  "saxophones",
  "trumpet",
  "horn",
  "french horn",
  "trombone",
  "tuba",
  "celesta",
  "piano",
  "harpsichord",
  "organ",
  "synthesizer",
  "harp",
  "snare drum",
  "bass drum",
  "cymbals",
  "tambourine",
  "triangle",
  "xylophone",
  "glockenspiel",
  "chimes",
  "marimba",
  "vibraphone",
  "soprano",
  "mezzo-soprano",
  "alto",
  "countertenor",
  "tenor",
  "baritone"
];

exports.getInstrument = function(instrument){
      var instrumentToLowercase = instrument.toLowerCase();
      for (var i = 0; i < instrumentType.length; i++) {
if(instrumentToLowercase.includes(instrumentType[i])){
        return instrumentType[i];
      }
    }
    return "";
}
/*
exports.isInstrument = function(instrument){
      var instrumentToLowercase = instrument.toLowerCase();
      for (var i = 0; i < instrumentType.length; i++) {
      if (instrumentToLowercase == instrumentType[i]) {
        return true;
      }
      else{
          return false;
      }
    }
}
*/

