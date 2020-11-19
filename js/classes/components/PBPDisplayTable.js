
/**
 * Table that displays human-readable plays of a game.
 */
 
class PBPDisplayTable extends DisplayTable{
  constructor(limit){
    super("Most Recent Plays", ["Team", "Time", "Score", "Play"]);
    this.limit = limit ? limit : 5;
    this.filter = null;
  }
  setStateFromModel(m){
    // TODO preserve highlight state if !clearHighlightOnUpdate
    var t = this;
    var tmp = m.pbp.getPlays(t.limit, t.filter);
    var plays = tmp[0];
    var idxs = tmp[1];
    t.table.setLength(plays.length);
    for(var x = 0; x < plays.length; x++){
      let pInfo = m.getPBPInfo(plays[x]);
      var r = t.table.getRow(plays.length-x-1);
        r.dataset.playIdx = idxs[x];
      t.table.setRow(plays.length-x-1, [pInfo.team.name, pInfo.time, pInfo.score, pInfo.play]);
    }
  }
}