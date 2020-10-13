class ReliableTransportChannel{
    constructor(){
        
    }
    send(){throw "Abstract Method";}
    setReceiveCallback(cb){
        this.rxCallback = cb;
    }
    setTarget(targ){
        this.connTarget = targ;
        this.disconnect();
        this.connect();
    }
    isConnected(){throw "Abstract Method";}
    connect(){throw "Abstract Method";}
    disconnect(){throw "Abstract Method";}
}

class WebsocketReliableTransportChannel extends ReliableTransportChannel(){
    constructor(){
        
    }
}