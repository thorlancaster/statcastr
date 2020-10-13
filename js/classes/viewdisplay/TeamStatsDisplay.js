/**
 * Class that displays the Team Stats view
 */
class TeamStatsDisplay extends TabbedViewDisplay{
    constructor(model, whichTeam){
        super(model, "All");
        var t = this;
        t.addClass("teamStatsDisplay");

        t.team = whichTeam ? model.team : model.opp; // Main team object
        t.whichTeam = whichTeam; // Boolean team
        t.effTeam = t.team; // Effective Team (or sub-stats team)
        t.intervalDesc = "Full"

        t.mainTable = new TeamStatsDisplayTable(t.team.town);
        t.mainTable.setColumns([
            ["Player", "numNameStr"],
            ["PTS", "points"],
            ["FLS", "fouls"],
            ["FG", "fgStr"],
            ["FT", "ftStr"],
            ["REB", "rebounds"],
            ["AST", "assists"],
            ["TO", "turnovers"],
            ["BL", "blocks"],
            ["ST", "steals"],
            ["MIN", function(player){
                return player.getPlayTimeStr();
            }.bind(this)]
        ]);
        t.appendChild(t.mainTable);
    }
    
    update(){
        var t = this;
        t.mainTable.label.setText(t.team.town + " " + t.intervalDesc + " Box Score");
        t.selector.setMaxVisible(t.model.clock.period + 1);
        t.mainTable.setStateFromModel(t.effTeam);
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
        t.intervalDesc = ls;        
        var txtInt = parseInt(txt);
        if(isNaN(txtInt))
            t.effTeam = t.team; // Entire game
        else{
            var tms = t.model.subStats[txtInt - 1]; // Single period
            t.effTeam = t.whichTeam ? tms.team:tms.opp;
        }
        t.update();
    }
}