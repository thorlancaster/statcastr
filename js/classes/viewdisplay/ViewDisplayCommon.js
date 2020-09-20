/**
 * The header at the top of most views that shows:
 * The home team name and icon,
 * The home team score,
 * The clock,
 * The guest team score,
 * and finally the guest team name and icon.
 */
class ScoreDisplayHeader extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.setStyle("height", "5em").setStyle("background", "var(--main-bg2)");
    t.home = new ScoreDisplayHeaderTeam("TEAM", "")
    .setStyle("width", "8em").setElasticity(0);
    t.guest = new ScoreDisplayHeaderTeam("OPPONENT", "")
    .setStyle("width", "8em").setElasticity(0);
    t.homeScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardHomeScore");
    t.guestScore = new NumberField("xxX").setStyle("width", "9em").setElasticity(0.001).addClass("scoreboardGuestScore");
    t.clock = new NumberField("PX  nX:XX").setStyle("width", "24em").setElasticity(0.001);
    t.appendChild(t.home);
    t.appendChild(t.homeScore);
    t.appendChild(new UIPanel());
    t.appendChild(t.clock);
    t.appendChild(new UIPanel());
    t.appendChild(t.guestScore);
    t.appendChild(t.guest);
  }
  calcSize(){
    super.calcSize();
  }
  setStateFromModel(m){
    var t = this;
    var gTime = m.clock.getTime();
    t.home.image.setSrc(m.team.image);
    t.home.name.setText(m.team.name);
    t.guest.image.setSrc(m.opp.image);
    t.guest.name.setText(m.opp.name);
    t.clock.setValue(m.clock.period * 10000 + gTime.minutes * 100 + gTime.seconds);
    t.homeScore.setValue(m.team.getStat("points"));
    t.guestScore.setValue(m.opp.getStat("points"));
  }
}
class ScoreDisplayHeaderTeam extends UIPanel{
  constructor(name, image){
    super();
    var t = this;
    t.setStyle("flexDirection", "column")
    t.image = new ImageField(image);
    t.name = new TextField(name);
    t.name.setStyle("height", "1em").setElasticity(0);
    t.appendChild(t.image);
    t.appendChild(t.name);
  }
}


/**
 * Table that displays human-readable plays of a game.
 * This element includes a Label and a Table of plays,
 * but not the TabSelector often seen above it.
 */
class PBPDisplayTable extends UIPanel{
  constructor(){
    super();
    var t = this;
    t.limit = 5;
    t.filter = null;
    t.setStyle("flexDirection", "column");
    t.label = new TextField("Most Recent Plays");
    t.label.setElasticity(0);
    t.label.setStyle("fontSize", "1.5em").setStyle("justifyContent", "left")
      .setStyle("marginLeft", "0.2em");
    t.table = new TableField(["Team", "  Time  ", "Score", "Play"]);
    t.appendChild(t.label);
    t.appendChild(t.table);
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
