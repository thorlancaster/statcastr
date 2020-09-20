class TeamStatsDisplay extends UIPanel{
    constructor(model){
        super();
        var t = this;
        this.model = model;
        t.setStyle("height", "100%").setStyle("flexDirection", "column");
        t.setStyle("alignItems", "center").setStyle("overflow", "auto");
        // t.dispHeader = new ScoreDisplayHeader();
        // t.dispHeader.setStyle("position", "sticky").setStyle("width", "100%")
        // .setStyle("top", "0").setElasticity(0);
        // t.appendChild(t.dispHeader);
    }
    
}