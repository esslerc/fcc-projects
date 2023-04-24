function palindrome(str) {
    let normalizedStr = str.toLowerCase().replace(/[\W_]+/g, "");
    if (normalizedStr === normalizedStr.split("").reverse().join("")) {
      return true;
    }   
    return false; 
  }