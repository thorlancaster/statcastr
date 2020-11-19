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
    // Model
    l.loadScript("js/classes/model/GameModel.js");
    l.loadScript("js/classes/model/basketball/BasketballGameModel.js");
    l.loadScript("js/classes/model/basketball/BasketballPBP.js");
    l.loadScript("js/classes/model/basketball/BasketballPlayer.js");
    l.loadScript("js/classes/model/basketball/BasketballPlayType.js");
    l.loadScript("js/classes/model/basketball/BasketballSubStats.js");
    l.loadScript("js/classes/model/basketball/BasketballTeam.js");
    // UI
    l.loadScript("js/classes/ui/UIPanel.js");
    l.loadScript("js/classes/ui/Dialog.js");
    l.loadScript("js/classes/TouchManager.js");
    l.loadScript("js/classes/ui/Toast.js");
    l.loadScript("js/classes/ui/ButtonField.js");
    l.loadScript("js/classes/ui/TextField.js");
    l.loadScript("js/classes/ui/ProgressBarField.js");
    l.loadScript("js/classes/ui/ImageField.js");
    l.loadScript("js/classes/ui/NumberField.js");
    l.loadScript("js/classes/ui/TableField.js");
    l.loadScript("js/classes/ui/TabSelector.js");
    // Components
    l.loadScript("js/classes/components/DisplayTable.js");
    l.loadScript("js/classes/components/PBPDisplayTable.js");
    l.loadScript("js/classes/components/PeriodTabSelector.js");
    l.loadScript("js/classes/components/ScoreDisplayHeader.js");
    l.loadScript("js/classes/components/ViewDisplay.js");
    l.loadScript("js/classes/components/TabbedViewDisplay.js");
    l.loadScript("js/classes/components/TeamStatsDisplayTable.js");
    // View
    l.loadScript("js/classes/view/View.js");
    l.loadScript("js/classes/view/ScoreboardView.js");
    l.loadScript("js/classes/view/TeamStatsView.js");
    l.loadScript("js/classes/view/PlayByPlayView.js");
    l.loadScript("js/classes/view/AdminView.js");
    // ViewDisplay
    l.loadScript("js/classes/viewdisplay/PlayByPlayDisplay.js");
    l.loadScript("js/classes/viewdisplay/ScoreboardDisplay.js");
    l.loadScript("js/classes/viewdisplay/TeamStatsDisplay.js");
    l.loadScript("js/classes/viewdisplay/AdminViewDisplay.js");
    // Synchronizr
    l.loadScript("js/classes/synchronizr/ReliableChannel.js");
    l.loadScript("js/classes/synchronizr/Synchronizr.js");
    // Main App
    l.loadScript("js/classes/StatcastrApp.js");

    l.loadScript("js/classes/Main.js");

    

    // STYLES
    t.loadStyle("css/main.css");

    // Start application when loaded
    window.addEventListener("load", function(){
    });
    window.addEventListener("resize", function(e){if(MAIN.onResize) MAIN.onResize(e);});
    window.addEventListener("focus", function(e){if(MAIN.onFocus) MAIN.onFocus(e);});
    window.addEventListener("blur", function(e){if(MAIN.onBlur) MAIN.onBlur(e);});
    window.addEventListener("keydown", function(e){if(MAIN.keyDown) MAIN.keyDown(e);});
    window.addEventListener("keyup", function(e){if(MAIN.keyUp) MAIN.keyUp(e);});
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
