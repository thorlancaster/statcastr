class ProgressBarField extends TextField{
    constructor(txt){
        super(txt);
        var t = this;
        t.addClass("progressBarField");
    }
    setColors(col1, col2){
        this.color1 = col1;
        this.color2 = col2;
        this.style();
    }
    setProgress(pct){
        this.progress = pct;
        this.style();
    }
    style(){
        this.setStyle("background", "linear-gradient(90deg, "+this.color1+" "+
        (this.progress-0.5)+"%, "+this.color2+" "+(this.progress+0.5)+"%)");
    }

  }