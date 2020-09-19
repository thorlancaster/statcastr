class UIPanel{
  constructor(){
    this.element = DCE("div", "uiPanel");
    this.children = [];
  }

  appendChild(el){
    if(el instanceof UIPanel){
      this.element.appendChild(el.element);
      if(!this.children.includes(el))
        this.children.push(el);
    }
    else
      this.element.appendChild(el);
    return this;
  }

  /**
  * Function to call when this element's size changes
  * @caution To avoid layout thrashing, call this function on the root if possible
  */
  resize(){
    this.calcSize();
    this.applySize();
  }

  /**
  * Apply a JSON-based style to this object and its children.
  * The style can either be a JSON object in the form of
  * {class: {key1: value1, key2:value2...}, class2...}
  * or an array of such objects.
  * @param obj JSON style object
  */
  applyStyle(obj){
    if(Array.isArray(obj)){
      for(var i = 0; i < obj.length; i++){
        for(var x = 0; x < this.children.length; x++){
          this.children[x].applyStyle(obj[i]);
        }
      }
    }else{
      for(var x = 0; x < this.children.length; x++){
        this.children[x].applyStyle(obj);
      }
    }
  }
  update(){
    for(var x = 0; x < this.children.length; x++){this.children[x].update();}}
  calcSize(){
    for(var x = 0; x < this.children.length; x++){this.children[x].calcSize();}}
  applySize(){
    for(var x = 0; x < this.children.length; x++){this.children[x].applySize();}}

  /**
  * Get a property from a style object
  * @param obj style object
  * @param property name of property to get
  * @param oldVal value to return if style not found
  */
  getApplyStyle(obj, property, oldVal){
    var cls = this.element.classList;
    for(var x = 0; x < cls.length; x++){
      var c = cls[x];
      if(obj[c] && obj[c][property]){
        return obj[c][property];
      }
    }
    return oldVal;
  }

  getElement(){
    return this.element;
  }

  addClass(name){
    this.element.classList.add(name); return this;}
  removeClass(name){
    this.element.classList.remove(name); return this;}

  setStyle(name, value){this.element.style[name] = value; return this;}
  setStyles(n1, n2, v){
    this.setStyle(n1, v);
    this.setStyle(n2, v);
    return this;
  }
  // Shortcut to set flex-grow and flex-shrink.
  // Higher values makes the element more stretchy
  setElasticity(x){
    this.setStyle("flexGrow", x);
    this.setStyle("flexShrink", x);
    return this;
  }
}

class TextField extends UIPanel{
  constructor(txt){
    super();
    this.addClass("textField");
    if(txt != null)
      this.setText(txt);
  }
  setText(txt){
    this.element.textContent = txt; return this;}
  setHTML(html){
    this.element.innerHTML = html; return this;}
}


class ImageField extends UIPanel{
  constructor(url){
    super();
    var t = this;
    if(url == null)
      url = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // Blank image
    t.landscape = true;
    t.addClass("imageField");
    t.setStyle("justifyContent", "center");
    t.image = DCE("img");
    t.image.src = url;
    t.element.appendChild(t.image);
    t.setResizePolicy();
  }

  calcSize(){
    super.calcSize();
    this.landscape = (this.element.clientWidth > this.element.clientHeight);
  }

  applySize(){
    super.applySize();
    this.setResizePolicy();
  }

  setSrc(src){
    this.image.src = src;
  }

  setResizePolicy(){
    var t = this;
    if(t.landscape != t._pLandscape){
      var is = t.image.style;
      if(t.landscape){
        is.height = "100%";
        is.width = "auto";
        t.setStyle("flexDirection", "row");
      } else {
        is.height = "auto";
        is.width = "100%";
        t.setStyle("flexDirection", "column");
      }
    }
    t._pLandscape = t.landscape;
  }

}

class NumberField extends UIPanel{
  constructor(format){
    super();
    var t = this;
    t.format = format;
    t.value = 0;
    t.litColor = "#FFF";
    t.unlitColor = "#111"
    t.bgColor = "#000";
    t.addClass("numberField");
    t.canvas = DCE("canvas");
    t.element.appendChild(t.canvas);
    var s = t.canvas.style;
    s.width = "100%";
    s.height = "100%";
    t.ctx = t.canvas.getContext("2d");
  }

  setValue(num){
    this.value = parseInt(num);
  }

  applyStyle(obj){
    super.applyStyle(obj);
    var t = this;
    t.litColor = super.getApplyStyle(obj, "litColor", t.litColor);
    t.unlitColor = super.getApplyStyle(obj, "unlitColor", t.unlitColor);
    t.bgtColor = super.getApplyStyle(obj, "bgColor", t.bgtColor);
  }

  getDigit(pos){
    var t = this;
    var f = t.format;
    var fChar = f.charAt(f.length-pos-1);
    var rtn = 0;
    switch(fChar){
      case "X": rtn = 0; break; // Number or '0'
      case "x": rtn = -1; break; // Number or ' ' if leading zero
      case "n": rtn = -2; break; // Number or ' ' if zero
      default: rtn = fChar; break;
    }
    if(typeof rtn == "number"){
      var apos = pos; // Get actual position in the number
      for(var x = pos; x >= 0; x--){
        var c = f.charAt(f.length-x-1);
        if(!(c == 'x' || c == 'X' || c == '1' || c == 'n'))
          apos--;
      }
      switch(fChar){
        case "X":
          return Math.floor(t.value / Math.pow(10, apos) % 10);
        case "x":
          var val = t.value / Math.pow(10, apos);
          if(val >= 1)
            return Math.floor(val % 10);
          else return -1;
        case "n":
          var val = Math.floor(t.value / Math.pow(10, apos) % 10);
          if(val >= 1)
            return val;
          else return -1;
        default:
          return rtn;
      }
    }

    return fChar;
  }
  // @Override
  calcSize(){
    super.calcSize(); var t = this;
    t.width = t.element.clientWidth;
    t.height = t.element.clientHeight;
  }
  // @Override
  applySize(){
    super.applySize(); var t = this;
    t.canvas.width = t.width;
    t.canvas.height = t.height;
    t.update();
  }
  // @Override
  update(){
    super.update();
    var t = this;
    var cw = t.canvas.width;
    var ch = t.canvas.height;
    var ctx = t.ctx;
    if(t.bgColor){
      ctx.fillStyle = t.bgColor;
      ctx.fillRect(0, 0, cw, ch);
    } else {
      ctx.clearRect(0, 0, cw, ch);
    }
    var numDigits = t.format.length;
    var xStart = cw * 0.1, xEnd = cw * (1-0.1), yStart = ch * 0.1, yEnd = ch*(1-0.1);
    var acw = xEnd - xStart, ach = yEnd - yStart;
    var space = 0.67; // How many digit heights to advance each number
    var fullWidth = ach*space*numDigits - ach*(space-0.5)// Width of all the numbers
    var fullHeight = ach; // Height of all the numbers
    var numStartY = yStart; // Y-coordinate where numbers start
    if(fullWidth > acw){ // Maintain aspect ratio
      var squish = acw / fullWidth;
      fullHeight *= squish;
      fullWidth = acw;
      numStartY += (1-squish)*ach/2;
    }
    // +1 to offset Math.floor() later
    var numStartX = xStart + (acw-fullWidth)/2 + 1; // X-coordinate where numbers start
    for(var x = 0; x < numDigits; x++){
      var thisNum = t.getDigit(numDigits-x-1);
      if(thisNum != "-" && thisNum != ":" && thisNum != " "){
        ctx.fillStyle = t.unlitColor;
        t.drawDigit(ctx, numStartX+x*fullHeight*space, numStartY, fullHeight/2, fullHeight, 8, null);
      }
      ctx.fillStyle = t.litColor;
      t.drawDigit(ctx, numStartX+x*fullHeight*space, numStartY, fullHeight/2, fullHeight, thisNum, null);
    }
  }

  drawDigit(ctx, xpos, ypos, nw, nh, snum, spChars){
   // Set up variables for drawing
   xpos = Math.floor(xpos); ypos = Math.floor(ypos);
   nw = Math.floor(nw); var nh2 = Math.floor(nh/2);
   nh = Math.floor(nh);
   var sw = Math.floor(nh/8); var svh = Math.floor(nh/2);
   var num = parseInt(snum);
   var sa=num&1,sb=num&2,sc=num&4,sd=num&8,se=num&16,sf=num&32,sg=num&64;
   if(!spChars) sa=sb=sc=sd=se=sf=sg=0;
   // Determine which segments need lit
   if(!spChars && num >= 0 && num <= 10){
     if(num != 1 && num != 4 && num != 10) sa = true;
     if(num != 5 && num != 6 && num != 10) sb = true;
     if(num != 2 && num != 10) sc = true;
     if(num != 1 && num != 4 && num != 7 && num != 9 && num != 10) sd = true;
     if(num == 0 || num == 2 || num == 6 || num == 8) se = true;
     if(num == 0 || num == 4 || num == 5 || num == 6 || num == 8 || num == 9) sf = true;
     if(num != 0 && num != 1 && num != 7 && num != 10) sg = true;
     if(num == 10){
       ctx.fillRect(Math.floor(xpos+nw/2-sw/2), ypos+sw, sw, sw);
       ctx.fillRect(Math.floor(xpos+nw/2-sw/2), ypos+nh-sw*2, sw, sw);
     }
   } else if(!spChars && snum == "P"){
     sa=1,sb=1,sc=0,sd=0,se=1,sf=1,sg=1;
   }
   // Draw the lit segments
   if(sa) ctx.fillRect(xpos, ypos, nw, sw);
   if(sb) ctx.fillRect(xpos+nw-sw, ypos, sw, svh);
   if(sc) ctx.fillRect(xpos+nw-sw, ypos+nh2, sw, svh);
   if(sd) ctx.fillRect(xpos, Math.floor(ypos+nh*0.875+1), nw, sw);
   if(se) ctx.fillRect(xpos, ypos+nh2, sw, svh);
   if(sf) ctx.fillRect(xpos, ypos, sw, svh);
   if(sg) ctx.fillRect(xpos, Math.floor(ypos+nh*0.4375+1), nw, sw);
   else if(snum == "-"){
     ctx.fillRect(xpos, Math.floor(ypos+nh*0.4375+1), nw, sw);
   }
   else if(snum == ":"){
     ctx.fillRect(Math.floor(xpos+(nw-sw)/2), Math.floor(ypos+(nh-sw)*0.25),sw,sw);
     ctx.fillRect(Math.floor(xpos+(nw-sw)/2), Math.floor(ypos+(nh-sw)*0.75),sw,sw);
   }
 }
}
