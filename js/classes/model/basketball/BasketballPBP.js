class BasketballPBPItem extends PBPItem{
    /**
    * @param period see PBPItem
    * @param millis see PBPItem
    * @param pid see PBPItem
    * @param team see PBPItem
    * @param type a valid play type (from BasketballPlayType)
    */
    constructor(period, millis, pid, team, type){
      super(period, millis, pid, team);
      assert(BasketballPlayType.isValid(type), "Invalid Play Type");
      this.type = type;
    }
  }
  
  class BasketballPlayByPlay extends PlayByPlay{
    constructor(){
      super();
    }
    addPlay(p){
      assert(p.constructor.name == "BasketballPBPItem");
      this.plays.push(p);
    }
    removePlay(x){
      this.plays.remove(x);
    }
  }