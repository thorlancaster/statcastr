class PlayByPlayView extends View{
  constructor(model){
    super(model);
    var t = this;
    t.viewDisp = new PlayByPlayDisplay(model);
    t.header = new ScoreDisplayHeader();
    t.numPlays = 0;
    t.filter = null;
    t.defaultStyle();
  }

  // update(){ // Now handled by superclass
  //   var t = this;
  //   t.viewDisp.update();
    
    // var plays = t.model.pbp.getPlays(t.numPlays, t.filter);
    // v.dispHeader.setStateFromModel(t.model);
    // v.main.selector.setMaxVisible(t.model.clock.period + 1);
    // v.main.table.setLength(plays.length);
    // for(var x = 0; x < plays.length; x++){
    //   let pInfo = t.model.getPBPInfo(plays[x]);
    //   // Most recent on top
    //   v.main.table.setRow(plays.length-x-1, [pInfo.team.name, pInfo.time, pInfo.score, pInfo.play]);
    // }
  //   v.update();
  // }

  // onSelect(tab){ // Not part of this class anymore
  //   var t = this;
  //   switch(tab){
  //     case "recent":
  //       t.numPlays = 32;
  //       t.filter = {};
  //       break;
  //     default:
  //       t.numPlays = 999;
  //       t.filter = {period: parseInt(tab)};
  //   }
  //   t.update();
  // }

  // defaultStyle(){ // Now handled by superclass
  //   this.applyStyle(Constants.defaultStyle);
  //   this.update();
  // }
}
