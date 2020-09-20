class TeamStatsView extends View{
    constructor(model){
        super(model);
        var t = this;
        t.viewDisp = new TeamStatsDisplay();
        t.header = new ScoreDisplayHeader();
        t.defaultStyle();
    }
    // update(){ // Now handled by superclass
    //     var t = this;
    //     t.viewDisp.update();
    //     t.header.update();
    //     var recentPlays = t.model.pbp.getPlays(5);
    // }

    defaultStyle(){
        this.applyStyle(Constants.defaultStyle);
        this.update();
      }
}