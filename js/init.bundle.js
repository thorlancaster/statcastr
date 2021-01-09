// Loads the scripts required for the web app
// This is the bundled version for the production app

// Constants
var DEBUG = false;
var APP_ROOT = "main";

class Initializer {
  init(){
    var t = this;
    t.setLoader(true);
    // Start application when loaded
    window.addEventListener("load", t.run.bind(t));
    window.addEventListener("resize", function(e){if(MAIN.onResize) MAIN.onResize(e);});
    window.addEventListener("focus", function(e){if(MAIN.onFocus) MAIN.onFocus(e);});
    window.addEventListener("blur", function(e){if(MAIN.onBlur) MAIN.onBlur(e);});
    window.addEventListener("keydown", function(e){if(MAIN.onKey) MAIN.onKey(e);});
    window.addEventListener("keyup", function(e){if(MAIN.onKey) MAIN.onKey(e);});
  }

  run(){
    var t = this;
    try{
      window.MAIN = new Main();
      window.SC = window.MAIN.sc;
      t.setLoader(false);
    }
    catch(e){
      console.error(e);
      t.setLoader("Error<br/>See console for details");
    }
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

// Initialize app
var initializer = new Initializer();
initializer.init();

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
        console.log('Successfully registered service worker', reg);
    }).catch(function(err) {
        console.warn('Error while registering service worker', err);
    });
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (!event.data) {
        return;
      }
      switch (event.data) {
        case 'reload-window':
          new Toast("Application updated, reloading...");
          setTimeout(function(){
            window.location.reload();
          }, 1000);
          break;
        default:
          // NOOP
          break;
      }
    });
}
