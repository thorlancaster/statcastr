class LoadingFeedView extends View{
    constructor(bus){
        super();
        var t = this;
        t.viewDisp = new LoadingFeedViewDisplay(bus);
    }
}