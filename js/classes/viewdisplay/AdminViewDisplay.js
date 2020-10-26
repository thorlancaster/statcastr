
class AdminViewDisplay extends ViewDisplay{
    constructor(model){
      super();
      var t = this;
      t.model = model;
      t.addClass("adminViewDisplay");
      t.pdt = new PBPDisplayTable(4);
      t.appendChild(t.pdt);
    }

    resize(){
      super.resize();
      this.pdt.resize();
    }
  
    update(){
      super.update();
      var t = this;
      t.pdt.setStateFromModel(t.model);
    }
  }