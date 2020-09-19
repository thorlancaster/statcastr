class PlayByPlayView extends View{
  constructor(model, viewDisp){
    super(model, viewDisp);
    var t = this;
    t.numPlays = 0;
    t.filter = null;
    t.defaultStyle();
    viewDisp.main.selector.addSelectionListener(t.onSelect.bind(t));
  }

  update(){
    var t = this;
    var v = t.viewDisp;
    var plays = t.model.pbp.getPlays(t.numPlays, t.filter);
    v.dispHeader.setStateFromModel(t.model);
    v.main.selector.setMaxVisible(t.model.clock.period + 1);
    v.main.table.setLength(plays.length);
    for(var x = 0; x < plays.length; x++){
      let pInfo = t.model.getPBPInfo(plays[x]);
      // Most recent on top
      v.main.table.setRow(plays.length-x-1, [pInfo.team.name, pInfo.time, pInfo.score, pInfo.play]);
    }
    v.update();
  }

  onSelect(tab){
    var t = this;
    switch(tab){
      case "recent":
        t.numPlays = 32;
        t.filter = {};
        break;
      default:
        t.numPlays = 999;
        t.filter = {period: parseInt(tab)};
    }
    t.update();
  }

  defaultStyle(){
    this.applyStyle(Constants.defaultStyle);
    this.update();
  }
}
