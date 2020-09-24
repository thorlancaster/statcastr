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
}
