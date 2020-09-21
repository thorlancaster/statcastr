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
 * Parent class for Tables that display a variety of stats.
 * This element includes a Label and a TableField.
 */
class DisplayTable extends UIPanel{
  /**
   * @param {String} title Title for the DisplayTable
   * @param {Array} tableArgs array of names for the table's columns
   */
  constructor(title, tableArgs){
    super();
    var t = this;
    t.setStyle("flexDirection", "column");
    t.label = new TextField(title);
    t.label.setElasticity(0);
    t.label.setStyle("fontSize", "1.5em").setStyle("justifyContent", "left")
      .setStyle("marginLeft", "0.2em");
    t.table = new TableField(tableArgs);
    t.appendChild(t.label);
    t.appendChild(t.table);
  }
  /**
   * This function is extended by subclasses to update
   * the table's contents from a model.
   * @param m Model object to update from
   */
  setStateFromModel(m){
    assert(false, "Abstract Method");
  }
}


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


class TeamStatsDisplayTable extends DisplayTable{
  constructor(){
    super("", ["--"]);
    this.setLabel(" UNNAMED TeamStatsDisplayTable")
    this.stats = []; // List of stats that this table tracks
  }

  setLabel(label){
    this.label.setText(label);
  }
  /**
   * Set the columns of this table
   * @param {Array} cols Array of Arrays of (Column name, Player stat)
   */
  setColumns(cols){
    var t = this;
    t.stats.length = 0;
    var names = [];
    for(var x = 0; x < cols.length; x++){
      t.stats[x] = cols[x][1];
      names[x] = cols[x][0];
    }
    t.table.setColumns(names);
  }

  setStateFromModel(team){

  }
}


/**
 * A TabSelector that has 10 tabs visible:
 * A named tab
 * 9 tabs numbered P1...P9
 * By default only P1...P4 are visible
 */
class PeriodTabSelector extends TabSelector{
  constructor(name){
    super();
    var t = this;
    t.addTab(name, "*");
    for(var x = 1; x < 10; x++){
      t.addTab("P<u>"+x+"</u>", ""+x);
    }
    t.setSelected("*");
    t.setMaxVisible(5);
  }
}


class TabbedViewDisplay extends UIPanel{
  constructor(model, firstTabName){
      super();
      var t = this;
      this.model = model;
      t.addClass("TabbedViewDisplay").addClass("viewDisplay");
      t.setStyle("flexDirection", "column");
      t.selector = new PeriodTabSelector(firstTabName);
      t.selector.addSelectionListener(t.onSelect.bind(t));

      t.appendChild(t.selector);
  }
  
  update(){
    this.selector.setMaxVisible(this.model.clock.period + 1);
  }

  onSelect(txt){
    console.log(txt);
  }
}


/*
TEMPLATE for new ViewDisplays

class xxxDisplay extends UIPanel{
  constructor(model){
      super();
      var t = this;
      this.model = model;
      t.addClass("xxxDisplay").addClass("viewDisplay");
      t.setStyle("flexDirection", "column");
      t.selector = new PeriodTabSelector("All");
      t.selector.addSelectionListener(t.onSelect.bind(t));

      t.appendChild(t.selector);
      // Append tables and stuff here
  }
  
  update(){
      var t = this;
      t.selector.setMaxVisible(t.model.clock.period + 1);
      // SetStateFromModel for the tables
  }
  onSelect(txt){
      console.log(txt);
  }
}
*/
