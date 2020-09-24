
/**
 * Table that displays human-readable plays of a game.
 */
 
class PBPDisplayTable extends DisplayTable{
  constructor(){
    super("Most Recent Plays", ["Team", "Time", "Score", "Play"]);
    this.limit = 5;
    this.filter = null;
  }
  setStateFromModel(m){
    var t = this;
    var plays = m.pbp.getPlays(t.limit, t.filter);
    t.table.setLength(plays.length);
    for(var x = 0; x < plays.length; x++){
      let pInfo = m.getPBPInfo(plays[x]);
      t.table.setRow(plays.length-x-1, [pInfo.team.name, pInfo.time, pInfo.score, pInfo.play]);
    }
  }
}