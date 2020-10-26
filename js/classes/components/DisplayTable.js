/**
 * Parent class for Tables that display a variety of stats.
 * This element includes a Label and a TableField.
 */
class DisplayTable extends UIPanel{
    /**
     * @param {String} title Title for the DisplayTable
     * @param {Array} tableArgs array of names for the table's columns
     */
    constructor(title, tableArgs){
      super();
      var t = this;
      t.setStyle("flexDirection", "column");
      t.label = new TextField(title);
      t.label.setElasticity(0);
      t.label.setStyle("fontSize", "1.5em").setStyle("justifyContent", "left")
        .setStyle("marginLeft", "0.2em");
      t.table = new TableField(tableArgs);
      t.appendChild(t.label);
      t.appendChild(t.table);
    }
    /**
     * This function is extended by subclasses to update
     * the table's contents from a model.
     * @param m Model object to update from
     */
    setStateFromModel(m){
      assert(false, "Abstract Method");
    }

    resize(){
      super.resize();
      this.label.setStyle("justifyContent", MAIN.mobile?"center":"left");
    }
  }