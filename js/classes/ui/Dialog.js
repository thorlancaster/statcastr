class Dialog{
    constructor(name){
        // console.log("Dialog " + name);
        var t = this;
        t.panel = new UIPanel().addClass("dialog"); // Covers the page
        t.panel.setStyle("position", "fixed").setStyles("width", "height", "100%")
            .setStyle("fontSize", "1.0em")
            .setStyle("background", "var(--semitransparent-bg)")
            .setStyle("display", "flex")
            .setStyles("align-items", "justify-content", "center");
        t.box = new UIPanel().addClass("dialogBox")
            .setStyle("minWidth", "16em")
            .setStyle("minHeight", "8em")
            .setStyle("maxHeight",  "95%")
            .setStyle("background", "var(--main-bg2)")
            .setStyle("position", "absolute")
            .setStyle("flex-direction", "column");
        t.panel.appendChild(t.box);
        t.titleHolder = new UIPanel().setStyle("height", "1.2em")
            .setStyle("border-bottom", "1px solid var(--main-bg1)")
            .setStyles("flex-grow", "flex-shrink", "0")
            .setStyle("fontSize", "1.5em");
        t.titleBar = new TextField(name, true);
        t.titleHolder.appendChild(t.titleBar);
        t.closeBtn = new ButtonField("X").setStyle("flexGrow", "0")
            .setBgColor("#F00").setBorder("0px");
        t.titleHolder.appendChild(t.closeBtn);
        t.box.appendChild(t.titleHolder);
        t.body = new UIPanel().setStyle("overflow", "visible")
            .setStyle("padding", "0.5em").setStyle("flexDirection", "column")
            .setStyle("height", "-moz-fit-content").setStyle("height", "fit-content")
            .setStyle("height", "-webkit-fit-content");
        var hldr = new UIPanel().setStyle("overflow", "auto");
        hldr.appendChild(t.body);
        t.box.appendChild(hldr);

        t.closeBtn.addClickListener(function(){
            t.close();
        });
    }
    setId(id){
        this.panel.element.id = id;
    }
    close(){
        var t = this;
        var res = t.onClose ? t.onClose() : null;
        if(res !== false)
            t.remove();
    }
    setTitle(str){
        this.titleBar.setText(str);
    }
    show(){
        var t = this;
        setTimeout(function(){
            t.panel.addClass("showing");
        }, 0);
        document.body.appendChild(t.panel.element);
    }
    remove(){
        var t = this;
        t.panel.removeClass("showing");
        setTimeout(function(){
            t.panel.element.parentElement.removeChild(t.panel.element);
        }, 150);
    }
    static isOpen(){
        return document.getElementsByClassName("dialogBox").length;
    }
    static removeById(str){
        // console.log("RemoveDlg" + str);
        var el = DGE(str);
        if(el){
            el.classList.remove("showing");
            setTimeout(function(){el.parentElement.removeChild(el)}, 150);
        }
    }
}