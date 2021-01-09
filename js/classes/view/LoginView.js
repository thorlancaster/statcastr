class LoginView extends View{
    constructor(bus){
        super();
        var t = this;
        t.viewDisp = new LoginViewDisplay(bus);
    }
    reset(){
        this.viewDisp.reset();
    }
}