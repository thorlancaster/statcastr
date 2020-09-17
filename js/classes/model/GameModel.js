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
}

class PBPItem{
  /**
  * @param period Period of in the game (Integer)
  * @param millis Milliseconds since start of Period / until end of Period (Integer)
  * @param pid Player jersey # (String), or Period (Integer), when setting time
  * @param team true if Team, false if Opponent, null if neither
  */
  constructor(period, millis, pid, team){
    this.period = period;
    this.millis = millis;
    this.pid = pid;
    this.team = team;
  }
}


class Team{
  constructor(){
    var t = this;
    t.players = []; // Associative array by player #
  }
  addPlayer(p){
    this.players[p.id] = p;
  }
  removePlayer(p){
    this.players[p.id] = null;
  }
  reset(){
    for(var p in this.players)
      this.players[p].reset();
  }
  getStat(name){
    var rtn = 0;
    for(var x in this.players){
      rtn += this.players[x][name];
    }
    return rtn;
  }
}


class Player{
  constructor(number, name){
    var t = this;
    t.id = number; // Per-team Player ID. (Jersey #);
    if(name == null) t.name = "[Player]"
    else t.name = name;
    t.secondsPlayed = 0;
  }
}
