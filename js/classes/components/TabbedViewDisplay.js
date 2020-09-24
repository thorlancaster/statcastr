/**
 * UI Component to display content with a TabSelector above it
 */
class TabbedViewDisplay extends UIPanel{
    constructor(model, firstTabName){
      super();
      var t = this;
      this.model = model;
      t.addClass("TabbedViewDisplay").addClass("viewDisplay");
      t.setStyle("flexDirection", "column");
      t.selector = new PeriodTabSelector(firstTabName);
      t.selector.addSelectionListener(t.onSelect.bind(t));
      t.appendChild(t.selector);
    }
    
    update(){
      super.update();
      this.selector.setMaxVisible(this.model.clock.period + 1);
    }
  
    /**
     * Called when the user clicks/taps a tab
     * @param {*} txt label of tab selected.
     * This function should be overridden without super()
     */
    onSelect(txt){
      console.log(txt);
    }
  }