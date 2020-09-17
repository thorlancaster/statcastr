class Main{
  constructor(){
    var t = this;
    t.appRoot = DGE(APP_ROOT);
    t.views = [];

    t.viewSelector = new TabSelector();
    var vs = t.viewSelector;
    vs.addClass("mainTabSelector");
    vs.setStyle("flexShrink", "0");
    vs.setStyles("top", "left", "0px");
    t.appRoot.appendChild(vs.element);
    vs.addIcon("favicon.ico");

    vs.addTab("<u>F</u>ILE", "file", true);
    vs.addTab("<u>S</u>COREBOARD", "scoreboard");
    vs.addTab("SPLIT&nbsp;<u>B</u>OX", "splitBox");
    vs.addTab("<u>T</u>EAM STATS", "teamStats");
    vs.addTab("<u>O</u>PPONENT STATS", "opponentStats");
    vs.addTab("<u>P</u>LAY-BY-PLAY", "playByPlay");
    vs.addTab("S<u>C</u>ORING", "scoring");
    vs.addTab("SHOOTIN<u>G</u>", "shooting");
    vs.addTab("<u>H</u>ELP", "help", true);

    vs.addSelectionListener(function(sel){
      console.log("Selected: " + sel);
    });

    vs.setSelected("scoreboard");

    t.viewContainer = DCE("div","viewContainer");
    t.viewContainer.style.flexShrink = "1";
    t.viewContainer.style.flexGrow = "1";
    t.appRoot.appendChild(t.viewContainer);


    t.model = t.createSportModel("basketball");
    t.model.dbgCreatePlayByPlay();
    t.model.updateFromPBP();
    window.MODEL = t.model;
    t.generateView("scoreboard", new ScoreboardView(t.model, new Scoreboard()));

    t.getSelectedView().update();

    setTimeout(function(){t.onResize()}, 0);
  }

  createSportModel(name){
    switch(name){
      case "basketball":
        return new BasketballGameModel();
      break;
      default:
        throw "Unsupported sport name: " + name;
    }
  }

  init(){
    var t = this;
    t.setView("scoreboard");
  }

  generateView(name, obj){
    this.views.push([name, obj]);
  }

  setView(vid){
    var t = this;
    CLEAR(t.viewContainer);
    var selView = null; // View that maps to given vid
    for(var x = 0; x < t.views.length; x++){
      var key = t.views[x][0];
      var val = t.views[x][1];
      if(key == vid){
        selView = val;
        break;
      }
    }
    if(selView == null)
      selView = new NullView();
    t.viewContainer.appendChild(selView.getElement());
  }

  getSelectedView(){
    return this.views[0][1]; // TODO fix
  }

  onResize(){
    this.getSelectedView().resize();
    this.viewSelector.resize();
  }

  onFocus(){

  }
  onBlur(){

  }
}
