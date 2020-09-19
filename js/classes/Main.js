const Constants = {
  defaultStyle: [
    {numberField: {litColor: "#F81"}},
    {scoreboardHomeScore: {litColor: "#F01"}, scoreboardGuestScore: {litColor: "#F01"}, scoreboardPFPPlayerNum: {litColor: "#F01"},
    scoreboardHomeFouls: {litColor: "#F01"}, scoreboardGuestFouls: {litColor: "#F01"}, scoreboardClock: {litColor: "#FD0"},
    scoreboardPeriod: {litColor: "#FD0"}}
  ]
}

class Main{
  constructor(){
    var t = this;
    t.appRoot = DGE(APP_ROOT);
    t.views = [];
    t.NULL_VIEW = new NullView();

    t.viewSelector = t.createViewSelector();
    t.viewSelector.addSelectionListener(function(sel){ t.onViewSelected(sel); });
    t.appRoot.appendChild(t.viewSelector.element);

    t.viewContainer = DCE("div","viewContainer");
    t.viewContainer.style.flexShrink = "1";
    t.viewContainer.style.flexGrow = "1";
    t.appRoot.appendChild(t.viewContainer);


    t.model = t.createSportModel("basketball");
    t.model.dbgCreatePlayByPlay();
    t.model.updateFromPBP();
    window.MODEL = t.model;

    t.generateView("scoreboard", new ScoreboardView(t.model, new ScoreboardDisplay()));
    t.generateView("playByPlay", new PlayByPlayView(t.model, new PlayByPlayDisplay()));
    t.setView("playByPlay");
    t.update();

    // Allow the page to render before finishing
    setTimeout(function(){
      t.onResize();
      t.viewSelector.setSelected(t.selectedView);
    }, 0);

    setTimeout(function(){
      t.model.pbp.addPlay(new BasketballPBPItem(2, 470 * 1000, "24", true, BasketballPlayType.DUNK_MADE));
      t.model.updateFromPBP();
      t.update();
    }, 5000);
  }

  onViewSelected(sel){
    switch(sel){
      case "file":
      case "help":
      this.showMainDialog(sel);
      break;
      default:
      this.setView(sel);
    }
    this.getSelectedView().resize();
  }

  createViewSelector(){
    var vs = new TabSelector();
    vs.addClass("mainTabSelector");
    vs.setStyle("flexShrink", "0");
    vs.setStyles("top", "left", "0px");
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
    return vs;
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

  generateView(name, obj){
    this.views.push([name, obj]);
  }

  showMainDialog(dlg){
    console.log("TODO SHOW DIALOG " + dlg);
  }

  setView(vid){
    var t = this;
    t.selectedView = vid;
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
      selView = t.NULL_VIEW;
    t.viewContainer.appendChild(selView.getElement());
  }

  getSelectedView(){
    for(var v in this.views){
      if(this.views[v][0] == this.selectedView)
        return this.views[v][1];
    }
    return this.NULL_VIEW;
  }

  update(){
    this.getSelectedView().update();
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
