class TeamStatsView extends View{
    constructor(model, whichTeam){
        super(model);
        var t = this;
        t.viewDisp = new TeamStatsDisplay(model, whichTeam);
        t.header = new ScoreDisplayHeader();
        t.defaultStyle();
    }

    defaultStyle(){
        this.applyStyle(Constants.defaultStyle);
        this.update();
      }
}