// Loads the scripts required for the web app.
// TODO These scripts should be bundled and minified for production

// Constants
var DEBUG = true; // Comment out for production
var APP_ROOT = "main";

class Initializer {
  init(){
    var t = this;
    t.setLoader(true);
    // Load dependencies
    t.scriptLoader = new ScriptLoader(t.run.bind(t));
    var l = t.scriptLoader;
    // SCRIPTS
    // Dependencies
    l.loadScript("js/libs/utils.js");
    l.loadScript("js/classes/MD5.js");
    // UI
    l.loadScript("js/classes/ui/UIPanel.js");
    l.loadScript("js/classes/ui/TextField.js");
    l.loadScript("js/classes/ui/ImageField.js");
    l.loadScript("js/classes/ui/NumberField.js");
    l.loadScript("js/classes/ui/TableField.js");
    l.loadScript("js/classes/ui/TabSelector.js");
    // Main
    // l.loadScript("js/classes/model/GameModel.js");
    // l.loadScript("js/classes/model/basketball/BasketballGameModel.js");
    // l.loadScript("js/classes/model/basketball/BasketballPlayType.js");
    // l.loadScript("js/classes/model/basketball/BasketballPBP.js");
    l.loadScript("js/classes/synchronizr/ReliableChannel.js");
    l.loadScript("js/classes/synchronizr/SynchronizrMain.js");
    l.loadScript("js/classes/synchronizr/Synchronizr.js");

    // STYLES
    t.loadStyle("css/main.css");

    window.addEventListener("resize", function(e){if(MAIN.onResize) MAIN.onResize(e);});
    window.addEventListener("focus", function(e){if(MAIN.onFocus) MAIN.onFocus(e);});
    window.addEventListener("blur", function(e){if(MAIN.onBlur) MAIN.onBlur(e);});
    window.addEventListener("keydown", function(e){if(MAIN.keyDown) MAIN.keyDown(e);});
    window.addEventListener("keyup", function(e){if(MAIN.keyUp) MAIN.keyUp(e);});
  }

  run(){
    var t = this;
    try{
      window.MAIN = new SynchronizrMain();
      MAIN.init(APP_ROOT);
      t.setLoader(false);
    }
    catch(e){
      console.error(e);
      t.setLoader("Error<br/>See console for details");
    }
  }

  loadStyle(src){
    var el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = src;
    document.head.appendChild(el);
  }

  setLoader(v){
    var el = document.getElementById("loader");
    if(el){
      if(v == true)
        el.style.display = "block";
      else if(v == false)
        el.style.display = "none";
      else
        el.innerHTML = v;
    } else console.warn("Cannot find loader");
  }
}

class ScriptLoader{
  constructor(callback){
    this.remaining = 0;
    this.scripts = [];
    this.callback = callback;
  }
  loadScript(src, retry){
    var t = this;
    if(!retry)
      t.scripts.push(src);
    var el = document.createElement("link");
    el.rel = "preload";
    el.as = "script";
    el.href = src;
    t.remaining++;
    el.addEventListener("load", function(){
      t.remaining--;
      if(t.remaining == 0){
        t.addScripts();
      }
    });
    el.addEventListener("error", function(){
      t.loadScript(src, true);
    });
    document.head.appendChild(el);
  }
  addScripts(){
    var t = this;
    for(var x = 0; x < t.scripts.length; x++){
      var el = document.createElement("script");
      el.src = t.scripts[x];
      document.head.appendChild(el);
      t.remaining++;
      el.addEventListener("load", function(){
        t.remaining--;
        if(t.remaining == 0){
          t.execScripts();
        }
      });
    }
  }
  execScripts(){
    this.callback.call();
  }
}

var initializer = new Initializer();
initializer.init();
