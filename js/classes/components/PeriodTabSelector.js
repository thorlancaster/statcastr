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