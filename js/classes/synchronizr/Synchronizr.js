function SYNCHRONIZR_OPCODES(){
    var op = {};
    // General
    op.NULL = " ";
    op.EOF = "@";
    // Preconfiguration (Client sends these before sync)
    op.SET_ID = "$";
    op.SET_HASH = "#";
    op.BEGIN_SYNC = "!";
    // List selection
    op.SELECT_STATIC = "S";
    op.SELECT_DYNAMIC = "D";
    op.SELECT_EVENT = "E";
    op.SET_ITEM = "s";
    op.SET_RANGE = "r";
    return op;
}

/**
 * Class to keep two sets of lists synchronized over a reliable transport channel
 * There are three lists: Static, Dynamic, and Event
 *  Static is used for information that won't change often, such as team names
 *  Dynamic is used for information that can change almost constantly, such as clock status
 *  Event is used for primarily append-only information, often just the play-by-play
 */
class Synchronizr{
    CONSTANTS(){
        var t = this;
        t.op = SYNCHRONIZR_OPCODES();
    }

    constructor(){
        var t = this;
        t.CONSTANTS();
        t.setLocalData(null, null, null);
        t.setLocalDataClasses(null, null, null);
        t.setChannel(null);
        t.setEventId(null);
    }

    // Set the ReliableChannel to use
    setChannel(c){
        var t = this;
        t.channel = c;
        if(c){
            c.setReceiveCallback(t.onChannelReceive.bind(t));
            c.setCloseCallback(t.onChannelClose.bind(t));
            c.setOpenCallback(t.onChannelOpen.bind(t));
        }
    }

    // Event handlers
    onChannelReceive(){
        while(this.channel.available()){
            this.onChannelMessage(this.channel.read())
        }
    }
    onChannelMessage(txt){
        var t = this;
    }
    onChannelClose(){
        var t = this;
    }
    onChannelOpen(){
        var t = this;
        if(t.setEventIdPending){
            t.setEventIdPending = false;
            t.channel.write(t.op.SET_ID + t.toStr(t.eventId==null?"":t.eventId) + t.op.BEGIN_SYNC);
        }
    }

    // Set the sources for the Static, Dynamic, and Event lists
    setLocalData(s, d, e){
        this.staticData = s;
        this.dynamicData = d;
        this.eventData = e;
    }

    // Set the deserialization Classes for the Static, Dynamic, and Event lists
    setLocalDataClasses(s, d, e){
        this.staticDataClass = s;
        this.dynamicDataClass = d;
        this.eventDataClass = e;
    }

    // Set the function that will be called when we have new data
    setUpdateCallback(f){
        this.updCbFn = f;
    }

    
    // Set the eventID to use (or NULL for a list) and begin synchronization
    setEventId(id){
        var t = this;
        t.eventId = id;
        if(!t.channel || !t.channel.isConnected())
            t.setEventIdPending = true;
        else
            t.channel.write(t.op.SET_ID + t.toStr(id==null?"":id) + t.op.BEGIN_SYNC);
    }

    
    // Utility Functions
    // Convert a String into a length-prefixed string for sending
    toStr(s){
        var l = s.length;
        if(l > 65533) throw "Input string too long"
        return String.fromCharCode(l>>8) + String.fromCharCode(l & 0xFF) + s;
    }
}