class GameModel{
  constructor(){
  }
}

class GameClock{
  constructor(){
    this.period = 0;
    this.numPeriods = 0;
  }
}

class BasketballGameModel extends GameModel{
  constructor(){
    super();
    this.clock = new BasketballGameClock();
    this.team = new TestBBTeam();
    this.opp = new TestBBTeam();
  }
}

class BasketballGameClock extends GameClock{
  constructor(){
    super();
    this.numPeriods = 4;
    this.millisLeft = 8 * 60 * 1000;
  }
}

class Team{
  constructor(){
    var t = this;
    t.players = []; // Associative array by player #
  }
}

class TestBBTeam extends Team{
  constructor(){
    super();
    var t = this;
    var p1 = new BasketballPlayer(3, "Javonne Nesbit");
    var p2 = new BasketballPlayer(21, "Colt Miller");
    var p3 = new BasketballPlayer(24, "Mason Dethman");
    var p4 = new BasketballPlayer(1, "Isaac Johnson");
    var p5 = new BasketballPlayer(44, "Bode Miller");
    t.addPlayer(p1);
    t.addPlayer(p2);
    t.addPlayer(p3);
    t.addPlayer(p4);
    t.addPlayer(p5);
    p1.ftMade = 2;
    p1.p3Miss = 1;
    p1.pFouls = 1;
    p1.offReb = 1;
    p1.turnovers = 1;
    p1.steals = 2;
  }
  addPlayer(p){
    this.players[p.id] = p;
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

class BasketballPlayer extends Player{
  constructor(number, name){
    super(number, name);
    var t = this;

    t.pFouls = 0;
    t.tFouls = 0;

    t.ftMade = 0;
    t.ftMiss = 0;
    t.p2Made = 0;
    t.p2Miss = 0;
    t.p3Made = 0;
    t.p3Miss = 0;

    t.offReb = 0;
    t.defReb = 0;
    t.unkReb = 0;
    t.assists = 0;
    t.blocks = 0;
    t.steals = 0;
    t.turnovers = 0;
  }
  get points(){return this.ftMade + this.p2Made * 2 + this.p3Made * 3}
  get fouls(){return this.pFouls + this.tFouls}
  get rebounds(){return this.offReb + this.defReb + this.unkReb}
  get fgMade(){return this.p2Made + this.p3Made}
  get fgMiss(){return this.p2Miss + this.p3Miss}
  get fgTotal(){return this.fgMade + this.fgMiss}
  get shotsMade(){return this.ftMade + this.fgMade}
  get shotsMiss(){return this.ftMiss + this.fgMiss}
  get shotsTotal(){return this.shotsMade + this.shotsMiss}
  get fgPercentage(){return this.fgMade / this.fgTotal * 100}
  get ftPercentage(){return this.ftMade / this.ftTotal * 100}
  get nbaEfficiency(){
    var t = this;
    return t.points + t.rebounds + t.assists + t.steals + t.blocks - (t.fgMiss + t.ftMiss + t.turnovers);
  }
}

var tGame = new BasketballGameModel();
console.log(tGame);
