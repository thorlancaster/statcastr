class PreferencesClass {
    constructor(name) {
        var t = this;
        t._name = name;
    }
    renameFn(str){
        switch(str){
            case "playersAreColored": return "Highlight player names";
            case "useAbbrsOnMobile": return "Abbreviate entries on small screens";
            case "defaultView": return null;
        }
        return str;
    }
    getSaveName() {
        return this._name + ".preferences";
    }
    toJSON() {
        var result = {};
        for (var x in this)
            if (x !== "_name")
                result[x] = this[x];
        return JSON.stringify(result);
    }
    save() {
        localStorage.setItem(this.getSaveName(), this.toJSON());
    }
    delete() {
        localStorage.removeItem(this.getSaveName());
    }
    load() {
        var o = null;
        try {
            o = JSON.parse(localStorage.getItem(this.getSaveName()));
        } catch (e) {
            console.warn("Preferences failed to load", e);
        }
        this.setFrom(o);
    }
    /**
     * For all values in a given object, apply them to this Preferences object
     * @param {Object} obj 
     */
    setFrom(obj){
        if (obj != null) {
            for(var x in obj){
                this[x] = obj[x];
            }
        }
    }
    defaults(){
        var p1 = new PreferencesClass();
        for(var x in this){
            if(x !== "_name")
            delete this[x];
        }
        for(var x in p1){
            if(x !== "_name")
            this[x] = p1[x];
        }
    }
}

class MainPreferencesClass extends PreferencesClass{
    constructor(name){
        super(name);
        var t = this;
        t.playersAreColored = true;
        t.useAbbrsOnMobile = true;
        t.defaultView = "scoreboard";
    }
}

class CredentialsPreferencesClass extends PreferencesClass{
    constructor(name){
        super(name);
        var t = this;
        t.username = "";
        t.password = "";
    }
}