// Loads the scripts required for the web app.
// I know, PHP would be better here, but js is required to keep the
// project organized without losing the ability to host statically.

// Constants
var DEBUG = true; // Comment out for production
var APP_ROOT = "main";

class Initializer {
  init(){
    var t = this;
    t.scripts = [];
    t.remaining = 0;
    t.setLoader(true);
    // Load dependencies
    if(DEBUG){
      // Debug-only dependencies

    } else {
      // Production-only dependencies

    }
    // Constant dependencies and Application Classes
    t.loadScript("js/libs/utils.js");
    t.loadScript("js/classes/Main.js");
    t.loadScript("js/classes/UIPanel.js");
    t.loadScript("js/classes/scoreboard/Scoreboard.js");
    // Styles
    t.loadStyle("css/main.css");

    // Start application when loaded
    window.addEventListener("load", function(){
      try{
        window.MAIN = new Main();
        MAIN.init(APP_ROOT);
        t.animate(t);
        t.setLoader(false);
      }
      catch(e){
        console.error(e);
        t.setLoader("Error<br/>See console for details");
      }
    });
    window.addEventListener("resize", function(e){ MAIN.onResize(e); });
    window.addEventListener("focus", function(e){if(MAIN.onFocus) MAIN.onFocus(e);});
    window.addEventListener("blur", function(e){if(MAIN.onBlur) MAIN.onBlur(e);});
    window.addEventListener("keydown", function(e){if(MAIN.keyDown) MAIN.keyDown(e);});
    window.addEventListener("keyup", function(e){if(MAIN.keyUp) MAIN.keyUp(e);});

  }
  animate(){
    // MAIN.animate();
    // requestAnimationFrame(initializer.animate);
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
        t.execScripts();
      }
    });
    el.addEventListener("error", function(){
      t.loadScript(src, true);
    });
    document.head.appendChild(el);
  }
  execScripts(){
    for(var x = 0; x < this.scripts.length; x++){
      var el = document.createElement("script");
      el.src = this.scripts[x];
      document.head.appendChild(el);
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

var initializer = new Initializer();
initializer.init();
