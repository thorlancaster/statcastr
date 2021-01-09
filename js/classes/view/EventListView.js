class EventListView extends View{
    constructor(bus){
        super();
        var t = this;
        t.viewDisp = new EventListViewDisplay(bus);
    }
    updateEvtSelTbl(arr) {
        this.viewDisp.updateEvtSelTbl(arr);
    }
}