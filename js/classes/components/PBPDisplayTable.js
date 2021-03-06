
/**
 * Table that displays human-readable plays of a game.
 */

class PBPDisplayTable extends DisplayTable {
  constructor(limit) {
    super("Most Recent Plays", ["Team", "Time", "Score", "Play"]);
    this.limit = limit ? limit : 5;
    this.filter = null;
  }
  setStateFromModel(m) {
    // TODO preserve highlight state if !clearHighlightOnUpdate
    var t = this;
    var tmp = m.pbp.getPlays(t.limit, t.filter);
    var plays = tmp[0];
    var idxs = tmp[1];
    var useAbbrs = MAIN.mobile && Preferences.useAbbrsOnMobile;
    var useHtml = Preferences.playersAreColored;
    t.table.setLength(plays.length);
    for (var x = 0; x < plays.length; x++) {
      var xn = plays.length - x - 1;
      let pInfo = m.getPBPInfo(plays[x], useHtml, useAbbrs);
      var r = t.table.getRow(xn);
      r.dataset.playIdx = idxs[x];
      var name = useAbbrs ? pInfo.team.abbr : pInfo.team.name;
      t.table.setRow(xn, [name, pInfo.time, pInfo.score]);
      t.table.setCell(3, xn, pInfo.play, true);
    }
  }
}