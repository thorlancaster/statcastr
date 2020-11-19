class GameModel{
  constructor(team, opp, pbp){
    this.team = team;
    this.opp = opp;
    this.pbp = pbp;
  }
}

class GameClock{
  constructor(){
    this.period = 0;
    this.numPeriods = 0;
  }
}

/**
 * Class to hold a list of plays
 */
class PlayByPlay{
  constructor(){
    this.plays = [];
  }
  addPlay(p){
    throw "Abstract Method";
  }
  removePlay(x){
    throw "Abstract Method";
  }
  /**
   * Get plays from this list
   * @param {Integer} length Maximum number of plays to return
   * @param {Object} args Filter that plays must match to be returned
   * @returns an Array where the first item is an array of plays and the second item is an array of indices
   */
  getPlays(length, args){
    var t = this;
    var rtn = [];
    var idxs = [];
    if(args != null){
      var keys = Object.keys(args);
      for(var x = t.plays.length - 1; x >= 0; x--){
        var play = t.plays[x];
        var add = true;
        for(var y = 0; y < keys.length; y++){
          if(play[keys[y]] !== args[keys[y]]){
            add = false; break;
          }
        }
        if(add){
          rtn.push(play);
          idxs.push(x);
        }
        if(length > 0 && rtn.length == length)
          break;
      }
      return [rtn, idxs];
    }
    if(length > 0){
      for(var x = t.plays.length - 1; x >= 0; x--){
        rtn.push(t.plays[x]);
        idxs.push(x);
        if(rtn.length == length)
          return [rtn, idxs];
      }
    }
    idxs.length = t.plays.length;
    for(var x = 0; x < idxs.length; x++)
      idxs[x] = x;
    return [t.plays, idxs];
  }
}

class PBPItem{
  /**
  * @param period Period of in the game (Integer)
  * @param millis Milliseconds since start of Period / until end of Period (Integer)
  * @param pid Player jersey # (String), or Period (Integer), when setting time
  * @param team true if Team, false if Opponent, null if neither
  * @param linked true if this was created at the same time as the last one.
  *     Used by Admin for keeping track of undo, not serialized or stored persistently
  */
  constructor(period, millis, pid, team, linked){
    this.period = period;
    this.millis = millis;
    this.pid = pid;
    this.team = team;
    this.rTeamScore = 0; // Running team and Opponent scores after this play
    this.rOppScore = 0; // These are to be computed by sport-specific Game Models
    this.linked = (linked == true);
  }
  getTime(){
    return {
      minutes: Math.floor(this.millis / 60000),
      seconds: Math.floor((this.millis / 1000) % 60),
      millis: this.millis % 1000
    };
  }
  getTimeStr(){
    var t = this.getTime();
    return ""+t.minutes + (t.seconds < 10 ? ":0"+t.seconds : ":"+t.seconds);
  }
}


class Team{
  constructor(info){
    var t = this;
    if(info){
      t.town = info.town; // Ex. "Froid-Lake"
      t.name = info.name; // Ex. "Redhawks"
      t.abbr = info.abbr; // Ex. "FML";
      t.image = info.image; // "Ex resources/mascots/froidmedicinelake.png"
    } else {
      t.town = "--";
      t.name = "--";
      t.abbr = "--";
      t.image = "";
    }
    t.players = []; // Associative array by player #
    t.starters = []; // Array of player #s (ids) who are starters
    t.lastPlayTime = {};
    t.lastPlayTime.pd = 0;
    t.lastPlayTime.ms = 0;
  }
  addPlayer(p){
    this.players[p.id] = p;
  }
  removePlayer(p){
    this.players[p.id] = null;
  }
  copyRoster(srcTeam){
    assert(false, "Abstract Method");
  }
  /**
   * Reset the state of this team to the beginning of the game
   */
  reset(){
    for(var p in this.players){
      this.players[p].reset();
      this.players[p].onCourt = this.starters.includes(this.players[p].id);
    }
  }
  /**
   * Return how many of a stat the team has
   * @param {String} name name of stat to get
   */
  getStat(name){
    var rtn = 0;
    for(var x in this.players){
      rtn += this.players[x][name];
    }
    return rtn;
  }
  // Format: town name abbr image players[name BYTE(starting number)]
  toByteArray(){
    var t = this;
    var len = t.town.length + t.name.length + t.abbr.length + t.image.length + 8;
    var p = t.players;
    for(var x in p)
      len += (2 + p[x].name.length + 1);
    var ptr = 0;
    var rtn = new Uint8Array(len);
    ptr = PUTSTR(rtn, t.town, ptr);
    ptr = PUTSTR(rtn, t.name, ptr);
    ptr = PUTSTR(rtn, t.abbr, ptr);
    ptr = PUTSTR(rtn, t.image, ptr);
    for(var x in p){
      ptr = PUTSTR(rtn, p[x].name, ptr);
      var isStart = t.starters.includes(p[x].id);
      var ifo = (p[x].id=="00"?127:parseInt(p[x].id)) + (isStart?128:0);
      rtn[ptr++] = ifo;
    }
    return rtn;
  }
  fromByteArray(arr){
    var ptr = 0, t = this, p = t.players;
    t.town = GETSTR(arr, ptr);
    ptr += (2 + t.town.length);
    t.name = GETSTR(arr, ptr);
    ptr += (2 + t.name.length);
    t.abbr = GETSTR(arr, ptr);
    ptr += (2 + t.abbr.length);
    t.image = GETSTR(arr, ptr);
    ptr += (2 + t.image.length);

    var pids = [];
    t.starters = [];
    while(ptr < arr.length){
      var name = GETSTR(arr, ptr);
      if(name.length == 0)
        debugger;
      ptr += (2 + name.length);
      var b3 = arr[ptr++];
      var pid = b3 & 127;
      pid = pid==127?"00":""+pid;
      var start = (b3 & 128) > 0 ? true:false;
      pids[pid] = true;
      var ply = t.players[pid];
      if(ply == null){
        ply = new t.PLAYER_CLASS();
        t.players[pid] = ply;
      }
      ply.name = name;
      ply.id = pid;
      if(start)
        t.starters.push(pid);
    }
  }
}


class Player{
  constructor(number, name){
    var t = this;
    t.id = number; // Per-team Player ID. (Jersey #);
    if(name == null) t.name = "[Player]"
    else t.name = name;
    // Milliseconds of playing time
    t.playMs = 0;
    // Is the player currently playing
    t.onCourt = true;
  }

  // When extending make sure to call super.reset();
  reset(){
    this.playMs = 0;
  }

  /**
   * Return how long this player has been on the court, 
   * EXCLUDING the time that has elapsed from the most recent
   * play
   */
  getPlayTime(){
    return {
      minutes: Math.floor(this.playMs / 60000),
      seconds: Math.floor((this.playMs / 1000) % 60),
      millis: this.playMs % 1000
    };
  }
  getPlayTimeStr(){
    var t = this.getPlayTime();
    return ""+t.minutes + (t.seconds < 10 ? ":0"+t.seconds : ":"+t.seconds);
  }
}
