/**
 * Table to display stats from a team, per-player
 */
class TeamStatsDisplayTable extends DisplayTable{
    constructor(){
      super("", ["--"]);
      this.stats = []; // List of stats that this table tracks
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
      var t = this;
      // console.log(team);
      var row = 0;
      for(var x in team.players){
        var ply = team.players[x];
        // console.log(ply);
        for(var y = 0; y < t.stats.length; y++){
          var stat = t.stats[y];
          if(typeof stat == "function")
            t.table.setCell(y, row, stat.call(null, ply));
          else
            t.table.setCell(y, row, ply[stat], y == 0);
        }
        // t.table.setCell(0, row, ply.id);
        row++;
      }
    }
  }