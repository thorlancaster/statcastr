/**
 * UI component that holds a Table
 */
class TableField extends UIPanel{
    constructor(columns){
      super();
      var t = this;
      t.addClass("tableField");
      t.table = DCE("table");
      var ts = t.table.style;
      ts.width = "100%";
      t.appendChild(t.table);
      t.setColumns(columns);
    }

    /**
     * Sets the columns of this table by name.
     * NOTE: This also clears the contents of the table,
     * and anything it the <colgroup>
     * @param {Array} columns array of column names
     */
    setColumns(columns){
      var t = this;
      t.columns = columns;
      CLEAR(t.table);
      t.colgroup = DCE("colgroup");
      t.table.appendChild(t.colgroup);
      t.thead = t.createRow(t.columns, true);
      t.thead.style.fontSize = "1.2em";
      t.table.appendChild(t.thead);
    }

    /**
     * Add a given number of rows to the table
     * @param {Integer} num Number of rows to add
     */
    createRows(num){
      for(var x = 0; x < num; x++){
        this.table.appendChild(this.createRow(this.columns.length));
      }
    }
    /**
     * Create and return a table row.
     * This function does not append to the table's DOM.
     * @param {Integer} cols Number of columns
     * @param {Boolean} head True to create a <th>, false for a <td>
     */
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
    /**
     * Set the contents of a table cell
     * @param {Integer} x x-coordinate of cell to set
     * @param {Integer} y y-coordinate of cell to set
     * @param {String} text contents of the cell
     * @param {Boolean} useHTML True to interpret contents of the cell as HTML. Use false if possible.
     */
    setCell(x, y, text, useHTML){
        var t = this;
        t.ensureLength(y);
        if(useHTML)t.table.children[y+2].children[x].innerHTML = text;
        else t.table.children[y+2].children[x].innerText = text;
    }

    /**
     * Set a row of the table to an array of Strings
     * HTML is not parsed.
     * @param {Integer} y 
     * @param {String[]} texts 
     */
    setRow(y, texts){
        var t = this;
        t.ensureLength(y);
        var ch = t.table.children[y+2].children;
        for(var x = 0; x < ch.length; x++)
            ch[x].textContent = texts[x];
    }
    /**
     * Return the number of rows in the table, excluding the header
     */
    getLength(){
        return this.table.childElementCount - 2;
    }
    /**
     * Set the number of rows in the table, excluding the header
     * @param {Integer} l length to set the table to
     */
    setLength(l){
        this.ensureLength(l);
        this.truncate(l);
    }
    /** Same as setLength(), but only adds */
    ensureLength(l){
        var t = this;
        if(l+1 > t.getLength()) t.createRows(l+1 - t.getLength());
    }
    /** Same as setLength(), but only removes */
    truncate(l){
        var t = this.table;
        while(this.getLength() > l){
            t.removeChild(t.lastChild);
        }
    }
  }