
class TabSelector extends UIPanel {
    constructor() {
        super();
        var t = this;
        t._autosel = true;
        t.addClass("tabSelector");
        t.element.style.setProperty("--ts-height", "1.5em");
        t.setElasticity(0)
            .setStyle("height", "var(--ts-height)")
            .setStyle("width", "100%")
            .setStyle("borderBottom", "0.1em solid #000")
            .setStyle("overflow", "visible");
        t.items = [];
        t.selObvs = new Set(); // Selection Observers
        t.selected = "";
        t.mobile = new TabSelectorMobile(this);
        t.appendChild(t.mobile);
        t.setMobileMode(false);
    }

    /**
     * Set whether clicking the tab automatically selects it.
     * Defaults to true
     */
    setAutoSelect(x){
        this._autosel = x;
    }

    addIcon(img) {
        var t = this;
        if (t._iconField)
            t.removeIcon();
        if (!img)
            return;
        var addend = new ImageField(img).setElasticity(0);
        addend.setStyles("marginLeft", "marginRight", "0.2em").setStyle("width", "var(--ts-height)");
        t._iconField = addend;
        t.prependChild(addend);
    }

    removeIcon() {
        var t = this;
        if (t._iconField) {
            t.removeChild(t._iconField);
            t._iconField = null;
        }
    }

    addTab(html, name, noSelect) {
        var t = this;
        var addend = new TabSelectorItem(html, name, t);
        addend.setSelectable(!noSelect);
        t.appendChild(addend);
        t.items.push(addend);
    }
    addSelectionListener(func) {
        if (typeof func == "function") this.selObvs.add(func);
    }
    removeSelectionListener(func) { this.selObvs.remove(func) }
    notifySelect(x) {
        this.selObvs.forEach(function (f) {
            f.call(null, x);
        });
    }

    setMaxVisible(num) {
        for (var x = 0; x < this.items.length; x++) {
            this.items[x].setStyle("display", x >= num ? "none" : "");
        }
    }

    setSelected(name) {
        this.onSelect(name, true);
    }
    
    onSelect(name, noUpdate) {
        var t = this;
        var i = t.getItem(name);
        if (t.selected != name) {
            if (i.selectable && t._autosel) {
                t.selected = name;
                t.setHighlighted(name);
            }
            if(!noUpdate)
                t.notifySelect(name);
        }
    }
    getItem(name) {
        for (var x = 0; x < this.items.length; x++) {
            var i = this.items[x];
            if (i.element.dataset.name == name)
                return i;
        }
    }
    setHighlighted(name) {
        for (var x = 0; x < this.items.length; x++) {
            var i = this.items[x];
            if (i.element.dataset.name == name) {
                i.setSelected(true);
                this.mobile.setLabel(i.getHtml() + " &#9660;");
            } else {
                i.setSelected(false);
            }
        }
    }

    calcSize() {
        var t = this;
        t._cWid = t.element.clientWidth;
        t._sWid = t.element.scrollWidth;
    }

    applySize() {
        this.setMobileMode(this._sWid > this._cWid + 1);
    }

    setMobileMode(mbl){
        var t = this;
        t.mobile.setStyle("display", mbl?"":"none");
        for(var x = 0; x < t.items.length; x++)
            t.items[x].element.style.visibility = mbl?"hidden":"";
    }
}

class TabSelectorMobile extends UIPanel {
    constructor(tsMain) {
        super();
        var t = this;
        t.tsMain = tsMain;
        t.setStyles("flexGrow", "flexShrink", "0")
            .setStyle("position", "relative")
            .setStyle("overflow", "visible");
        t.main = new UIPanel();
        t.main.setStyle("position", "absolute")
            .setStyle("alignItems", "baseline")
            .setStyle("flexDirection", "column");
        t.main.addClass("tabSelectorMobile");
        t.appendChild(t.main);
        t.curLbl = new TabSelectorItem("Uhh...", null, t);
        t.main.appendChild(t.curLbl);
        t.dropdown = new UIPanel()
            .setStyle("flexDirection", "column")
            .setStyle("position", "fixed")
            .setStyle("zIndex", "2")
            .setStyle("transform", "translateY(1.5em)")
            .addClass("tabSelectorMobileDD");
        t.main.appendChild(t.dropdown);
        t.element.setAttribute("tabindex", "0");
        t.element.addEventListener("focusout", t.onFocusOut.bind(t));

        if (!window.TAB)
            window.TAB = t;
    }

    setLabel(curr) {
        var c = this.curLbl;
        c.setHtml(curr);
    }

    onFocusOut(){
        this.showing = true;
        this.onSelect("null");
    }
    onSelect(name) {
        var t = this;
        t.showing = !t.showing;
        if (!t.showing) {
            t.dropdown.removeAll();
            t.dropdown.setStyle("borderTop", "");
        }
        else {
            t.dropdown.setStyle("borderTop", "1px solid #000");
            var itms = t.tsMain.items;
            for (var x = 0; x < itms.length; x++) {
                if(!itms[x].isDisplayable())
                    continue;
                var ts = new TabSelectorItem(itms[x].getHtml(), itms[x].getName(), this)
                    .setStyle("width", "100%")
                    .setStyle("justifyContent", "left")
                    .setStyles("paddingTop", "paddingBottom", "0.5em");
                if (itms[x].isSelected())
                    ts.setSelected(true);
                t.dropdown.appendChild(ts);
            }
        }
        if (name != "null") {
            t.tsMain.onSelect(name);
        }
    }
}

class TabSelectorItem extends TextField {
    constructor(str, name, parent) {
        super();
        var t = this;
        t.setHtml(str).addClass("tabSelectorItem").setElasticity(0);
        t.setStyles("paddingLeft", "paddingRight", "0.6em");
        t.setStyle("cursor", "pointer");
        t.parent = parent;
        t.element.dataset.name = name;
        t.selectable = true;
        t.element.addEventListener("mouseenter", t.enter.bind(t));
        t.element.addEventListener("mouseleave", t.leave.bind(t));
        t.element.addEventListener("click", t.click.bind(t));
    }
    getName() {
        return this.element.dataset.name;
    }
    setSelected(val) {
        if (val) this.addClass("selected");
        else this.removeClass("selected");
    }
    isSelected() {
        return this.hasClass("selected");
    }
    isDisplayable(){
        return this.element.style.display != "none";
    }
    setSelectable(val) {
        this.selectable = val;
    }
    enter(e) {
        this.setStyle("background", "var(--sel-bg)").setStyle("color", "var(--sel-fg)");
    }
    leave(e) {
        this.setStyle("background", "").setStyle("color", "");
    }
    click(e) {
        this.clickEl(e.target);
    }
    clickEl(e) {
        if (e.dataset.name)
            this.parent.onSelect(e.dataset.name);
        else
            this.clickEl(e.parentElement);
    }
}


class TabbedPane extends UIPanel {
    constructor(item) {
        super();
        var t = this;
        t.selector = new TabSelector();
        t.item = item;
        t.appendChild(selector);
        t.appendChild(item);
    }
}
