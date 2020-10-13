const Constants = {
  defaultStyle: [
    {numberField: {litColor: "#F81"}},
    {scoreboardHomeScore: {litColor: "#F01"}, scoreboardGuestScore: {litColor: "#F01"}, scoreboardPFPPlayerNum: {litColor: "#F01"},
    scoreboardHomeFouls: {litColor: "#F01"}, scoreboardGuestFouls: {litColor: "#F01"}, scoreboardClock: {litColor: "#FD0"},
    scoreboardPeriod: {litColor: "#FD0"}}
  ]
}

class StatcastrApp{
  constructor(appRootEl){
    var t = this;
    assert(appRootEl != null, "App Root Element is required")
    t.appRoot = appRootEl;
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
    // t.model.dbgCreatePlayByPlay();
    // t.testPerfPBPReload();
    t.model.reloadFromPBP();
    window.MODEL = t.model;

    t.generateView("scoreboard", new ScoreboardView(t.model));
    t.generateView("playByPlay", new PlayByPlayView(t.model));
    t.generateView("teamStats", new TeamStatsView(t.model, true));
    t.generateView("opponentStats", new TeamStatsView(t.model, false));
    t.setView("scoreboard");
    t.update();

    // Allow the page to render before finishing
    setTimeout(function(){
      t.onResize();
      t.viewSelector.setSelected(t.selectedView);
    }, 0);

    // setTimeout(function(){
    //   t.model.pbp.addPlay(new BasketballPBPItem(2, 470 * 1000, "24", true, BasketballPlayType.DUNK_MADE));
    //   // TODO only calculate last play, NOT reload everything
    //   // t.testPerfPBPReload();
    //   t.model.reloadFromPBP();
    //   t.update();
    // }, 5000);
  }

  testPerfPBPReload(){
    var perf = performance.now(); // Testing code for performance
    for(var x = 0; x < 1000; x++)
      this.model.reloadFromPBP();
    console.log("1000 PBP reloads: " + (performance.now() - perf) + "ms");
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
    this.getSelectedView().update();
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
        var rtn = new BasketballGameModel();
        return rtn;
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
    var h = selView.getHeaderElement();
    if(h) t.viewContainer.appendChild(h);
    t.viewContainer.appendChild(selView.getMainElement());
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

  /* Stuff for Synchronizr compatibliity */
  getStaticData(){return this.model.getStaticData();}
  getStaticDataClass(){return null}
  getDynamicData(){return this.model.getDynamicData();}
  getDynamicDataClass(){return null}
  getEventData(){return this.model.getEventData();}
  getEventDataClass(){return BasketballPBPItem;}
  onSynchronizrUpdate(s, d, e){
    var t = this;
    if(s){
      t.model.reloadRosters();
      t.model.reloadFromPBP();
    } else if(e === true){ // Event data modified beyond appending
      t.model.reloadFromPBP();
    } else if(typeof e == "number"){
      for(var x = 0; x < e; x++)
        t.model.updateFromPBP(-x);
    }
    t.update();
  }
}