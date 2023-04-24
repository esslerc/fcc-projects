function rot13(str) {
    let alphabet = "abcdefghijklmnopqrstuvwxyz"
        .toUpperCase()
        .split("");
      
    let special = str.match(/[!?\.]/)
  
    let words = []
    if(special != undefined) {
      words = str.replace(special[0], "").split(/\s/g);
    } else {
      words = str.split(/\s/g);
    }
  
    let translatedText = []
    
    words.forEach(word => {
      let translatedWord = ""
  
      for(let i = 0; i < word.length; i++) {
        let charPos = alphabet.indexOf(word[i]);
            
        if((charPos + 13) > alphabet.length-1) {
          charPos =  13 - (alphabet.length - charPos);
        } else {
          charPos =  13 + charPos;
        }
        translatedWord += alphabet[charPos];
      }
    
      translatedText.push(translatedWord);
    });
  
    if(special != undefined) {
      return translatedText.join(" ") + special[0];
    }
      
    return translatedText.join(" ");
  }