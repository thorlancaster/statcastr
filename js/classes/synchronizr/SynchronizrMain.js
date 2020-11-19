class SynchronizrMain{
    constructor(){
        var t = this;
        t.synchronizr = new Synchronizr();
    }
    init(){
        var t = this;
        var s = t.synchronizr;
        t.channel = new WebsocketReliableChannel();
        t.channel.setTarget("ws://localhost", 1234);
        t.channel.connect();
        console.log("SynchronizrMain: Channel started");
        s.setChannel(t.channel);
        window.CHANNEL = t.channel;
    }
}