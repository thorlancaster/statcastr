class SynchronizrMain{
    constructor(){
        return;
        var t = this;
        t.synchronizr = new Synchronizr();
        var s = t.synchronizr;
        s.connect("ws://localhost:1234");
        s.startTimer();
    }
}