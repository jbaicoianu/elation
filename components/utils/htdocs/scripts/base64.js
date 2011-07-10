elation.extend("utils.base64.reader", function(base64) {
  this.base64alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  this.position = 0;
  this.base64 = base64;
  this.bits = 0;
  this.bitsLength = 0;
  this.readByte = function() {
    if(this.bitsLength == 0) {               
      var tailBits = 0;
      while(this.position < this.base64.length && this.bitsLength < 24) {                    
        var ch = this.base64.charAt(this.position);
        ++this.position;
        if(ch > " ") {
          var index = this.base64alphabet.indexOf(ch);
          if(index < 0) throw "Invalid character";
          if(index < 64) {
            if(tailBits > 0) throw "Invalid encoding (padding)";
            this.bits = (this.bits << 6) | index;
          } else {
            if(this.bitsLength < 8) throw "Invalid encoding (extra)";
            this.bits <<= 6;
            tailBits += 6;
          }
          this.bitsLength += 6;
        }
      }
      
      if(this.position >= this.base64.length) {
        if(this.bitsLength == 0) 
          return -1;
        else if(this.bitsLength < 24)
          throw "Invalid encoding (end)";
      }
      
      if(tailBits == 6)
        tailBits = 8; 
      else if(tailBits == 12)
        tailBits = 16;
      this.bits = this.bits >> tailBits;
      this.bitsLength -= tailBits;
    }
    
    this.bitsLength -= 8
    var code = (this.bits >> this.bitsLength) & 0xFF;
    return code;
  }
});
