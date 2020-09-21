class TeamStatsDisplay extends TabbedViewDisplay{
    constructor(model, whichTeam){
        super(model, "All");
        var t = this;
        t.addClass("teamStatsDisplay");

        t.team = whichTeam ? model.team : model.opp;

        t.mainTable = new TeamStatsDisplayTable(t.team.town);
        t.mainTable.setColumns([
            ["Player", "numName"],
            ["PTS", "points"],
            ["FLS", "fouls"],
            ["FG", "fgStr"],
            ["FT", "ftStr"],
            ["REB", "rebounds"],
            ["AST", "assists"],
            ["TO", "turnovers"],
            ["BL", "blocks"],
            ["ST", "steals"],
            ["MIN", "playTimeStr"]
        ]);
        t.mainTable.setLabel("Full Box Score");
        
        t.appendChild(t.mainTable);
    }
    
    update(){
        var t = this;
        t.selector.setMaxVisible(t.model.clock.period + 1);
        t.mainTable.setStateFromModel(t.team);
    }
    onSelect(txt){
        var t = this;
        var ls = "";
        switch(txt){
        case "*": ls = "Full"; break;
        case "1": ls = "1st Period"; break;
        case "2": ls = "2nd Period"; break;
        case "3": ls = "3rd Period"; break;
        default: ls = txt + "th Period";
        }
        var tbl = t.mainTable;
        tbl.label.setText(t.team.town + " " + ls + " Box Score");
        t.update();
    }
}