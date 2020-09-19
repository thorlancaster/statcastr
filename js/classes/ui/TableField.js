class TableField extends UIPanel{
    constructor(columns){
      super();
      var t = this;
      t.columns = columns;
      t.addClass("tableField");
      t.table = DCE("table");
      var ts = t.table.style;
      ts.width = "100%";
      t.colgroup = DCE("colgroup");
      t.thead = t.createRow(t.columns, true);
      t.thead.style.fontSize = "1.2em";
      t.table.appendChild(t.colgroup);
      t.table.appendChild(t.thead);
      t.appendChild(t.table);
    }
    createRows(num){
      for(var x = 0; x < num; x++){
        this.table.appendChild(this.createRow(this.columns.length));
      }
    }
    createRow(cols, head){
      var el = DCE("tr");
      var colsIsNum = (typeof cols == "number");
      var len = colsIsNum ? cols : cols.length;
      for(var x = 0; x < len; x++){
        var itm = head ? DCE("th") : DCE("td");
        if(!colsIsNum)
         itm.textContent = cols[x];
        el.appendChild(itm);
      }
      return el;
    }
    // Setting element textContent is much faster than creating a new set
    // of DOM nodes every time the table needs resized.
    setCell(x, y, text, useHTML){
        var t = this;
        t.ensureLength(y);
        if(useHTML)t.table.children[y+2].children[x].innerHTML = text;
        else t.table.children[y+2].children[x].innerText = text;
    }
    setRow(y, texts){
        var t = this;
        t.ensureLength(y);
        var ch = t.table.children[y+2].children;
        for(var x = 0; x < ch.length; x++)
            ch[x].textContent = texts[x];
    }
    getLength(){
        return this.table.childElementCount - 2;
    }
    setLength(l){
        this.ensureLength(l);
        this.truncate(l);
    }
    ensureLength(l){
        var t = this;
        if(l+1 > t.getLength()) t.createRows(l+1 - t.getLength());
    }
    truncate(l){
        var t = this.table;
        while(this.getLength() > l){
            t.removeChild(t.lastChild);
        }
    }
  }