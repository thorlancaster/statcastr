class LoadingFeedViewDisplay extends ViewDisplay {
    constructor(bus) {
        super();
        var t = this;
        t._bus = bus;
        t.setStyle("height", "calc(100% - (2 * var(--margin)))").setStyle("flexDirection", "column");
        t.reset();
    }

    reset(lastWrong){
        var t = this;
        t.removeAll();

        var fc = new UIPanel().setStyle("flexDirection", "column").setStyle("height", "11em")
            .setStyle("margin", "auto").setStyle("flexGrow", "0").setStyle("padding", "1em").setStyle("border", "1px solid #000");
        t.formContainer = fc;
        var label = new TextField("Loading stats feed").setStyle("fontSize", "1.3em").setStyle("fontWeight", "bold");
        var label2 = new TextField("One moment please...");
        var ld = new LoadingField();
        fc.appendChild(label);
        fc.appendChild(label2);
        fc.appendChild(ld);
        t.appendChild(fc);
    }
}