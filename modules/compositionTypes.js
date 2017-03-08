var compositionType = [
  "duets",
  "piano-concertos",
  "violin-concertos",
  "oboe-concertos",
  "concertos",
  "overtures",
  "symphony",
  "books",
  "choral",
  "contata",
  "ballata",
  "estampie",
  "organum",
  "saltarello",
  "ballade",
  "canzona",
  "carol",
  "chanson",
  "fantasia",
  "galliard",
  "intermedio",
  "laude",
  "litany",
  "madrigal",
  "mass",
  "opera",
  "operetta",
  "singspiel",
  "zarzuela",
  "oratorio",
  "polonaise",
  "prelude",
  "quartet",
  "quintet",
  "requiem",
  "rhapsody",
  "rondo",
  "scherzo",
  "serenade",
  "sonata",
  "suite",
  "waltz",
  "ballet",
  "blues",
  "burlesque",
  "cabaret",
  "jazz",
  "jazz standard",
  "vaudeville",
  "motet",
  "pavane",
  "ricercar",
  "sequence",
  "tiento",
  "toccata",
  "baroque",
  "allemande",
  "canon",
  "cantata",
  "chaconne",
  "courante",
  "fugue",
  "gavotte",
  "gigue",
  "minuet",
  "oratorio",
  "partita",
  "passacaglia",
  "passepied",
  "sarabande",
  "sinfonia",
  "bagatelle",
  "caprice",
  "divertimento",
  "etude",
  "impromptu",
  "intermezzo",
  "mazurka",
  "march",
  "nocturne"
];

exports.getComposition = function(composition){
      var compositionToLowercase = composition.toLowerCase();
      for (var i = 0; i < compositionType.length; i++) {
      if(compositionToLowercase.includes(compositionType[i])){

        return compositionType[i];
      }

    }
    return "";
}

/*
exports.isComposition = function(composition){
      var compositionToLowercase = composition.toLowerCase();
      for (var i = 0; i < compositionType.length; i++) {
      if (compositionToLowercase == compositionType[i]) {
        return true;
      }
      else{
        return false;
      }
    }
}
*/