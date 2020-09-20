
class TabSelector extends UIPanel{
    constructor(){
        super();
        var t = this;
        t.addClass("tabSelector");
        t.setStyle("width", "100%");
        t.element.style.setProperty("--ts-height", "1.5em");
        t.setStyle("height", "var(--ts-height)").setElasticity(0);
        t.setStyle("borderBottom", "0.1em solid #000");
        t.items = [];
        t.selObvs = new Set(); // Selection Observers
        t.selected = "";
    }
    addIcon(img){
        var t = this;
        var addend = new ImageField(img).setElasticity(0);
        addend.setStyles("marginLeft", "marginRight", "0.2em").setStyle("width", "var(--ts-height)");
        t.appendChild(addend);
    }
    addTab(html, name, noSelect){
        var t = this;
        var addend = new TabSelectorItem(html, name, t);
        addend.setSelectable(!noSelect);
        t.appendChild(addend);
        t.items.push(addend);
    }
    addSelectionListener(func){
        if(typeof func == "function") this.selObvs.add(func);}
    removeSelectionListener(func){this.selObvs.remove(func)}
    notifySelect(x){
        this.selObvs.forEach(function(f){
        f.call(null, x);
        });
    }

    setMaxVisible(num){
        for(var x = 0; x < this.items.length; x++){
        this.items[x].setStyle("display", x >= num ? "none" : "");
        }
    }

    setSelected(name){
        this.onSelect(name);
    }
    onSelect(name){
        var t = this;
        var i = t.getItem(name);
        if(t.selected != name){
        if(i.selectable){
            t.selected = name;
            t.setHighlighted(name);
        }
        t.notifySelect(name);
        }
    }
    getItem(name){
        for(var x = 0; x < this.items.length; x++){
        var i = this.items[x];
        if(i.element.dataset.name == name)
            return i;
        }
    }
    setHighlighted(name){
        for(var x = 0; x < this.items.length; x++){
            var i = this.items[x];
            if(i.element.dataset.name == name){
                i.addClass("selected");
            } else {
                i.removeClass("selected");
            }
        }
    }
}
  
class TabSelectorItem extends TextField{
    constructor(str, name, parent){
        super();
        var t = this;
        t.setHTML(str).addClass("tabSelectorItem").setElasticity(0);
        t.setStyles("paddingLeft", "paddingRight", "0.6em");
        t.setStyle("cursor", "pointer");
        t.parent = parent;
        t.element.dataset.name = name;
        t.selectable = true;
        t.element.addEventListener("mouseenter", t.enter.bind(t));
        t.element.addEventListener("mouseleave", t.leave.bind(t));
        t.element.addEventListener("click", t.click.bind(t));
    }
    setSelectable(val){this.selectable = val;}
    enter(e){
        this.setStyle("background", "var(--sel-bg)").setStyle("color", "var(--sel-fg)");
    }
    leave(e){
        this.setStyle("background", "").setStyle("color", "");
    }
    click(e){
        this.clickEl(e.target);
    }
    clickEl(e){
        if(e.dataset.name)
        this.parent.onSelect(e.dataset.name);
        else
        this.clickEl(e.parentElement);
    }
}


class TabbedPane extends UIPanel{
    constructor(item){
        super();
        var t = this;
        t.selector = new TabSelector();
        t.item = item;
        t.appendChild(selector);
        t.appendChild(item);
    }
}
  