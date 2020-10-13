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
    if(type != null)
      assert(BasketballPlayType.isValid(type), "Invalid Play Type");
    this.type = type;
  }
  // The following functions are required for Synchronizr serialization / deserialization
  // Binary format (byte-wise) period  millis[MSB] millis[NSB] millis[LSB]  pid  byte(team, type)  RESERVED
  toByteArray(){
    var t = this;
    var a = new Uint8Array(7);
    var tflag = t.team==true?128:(t.team==false?64:0)
    a[0] = t.period;
    a[1] = t.millis >> 16;
    a[2] = t.millis >> 8;
    a[3] = t.millis;
    a[4] = t.pid == "00" ? "255" : parseInt(t.pid);
    a[5] = tflag + (t.type&63);
    a[6] = 0;
    return a;
  }
  fromByteArray(a){
    assert(a.length == 7, "Illegal Array Length");
    var t = this;
    t.period = a[0];
    t.millis = a[1] * 65536 + a[2] * 256 + a[3];
    t.pid = a[4] == 255 ? "00" : "" + a[4];
    t.type = a[5] & 63;
    var tflag = a[5] & 192;
    t.team = tflag==128?true:(tflag==64?false:null);
    return this;
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
