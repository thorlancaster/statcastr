class LoginViewDisplay extends ViewDisplay {
    constructor(bus) {
        super();
        var t = this;
        t._bus = bus;
        t.setStyle("height", "calc(100% - (2 * var(--margin)))").setStyle("flexDirection", "column");
        t.reset();
    }

    reset(lastWrong){
        var t = this;
        t.removeAll();

        var formContainer = new UIPanel().setStyle("flexDirection", "column").setStyle("height", "11em")
            .setStyle("margin", "auto").setStyle("flexGrow", "0").setStyle("padding", "1em").setStyle("border", "1px solid #000");
        t.formContainer = formContainer;
        var label = new TextField("Credentials Required");
        if(lastWrong)
            label.setHtml("<span style='color: #F40'>Incorrect credentials</span");
        formContainer.appendChild(label);
        var form = new PreferencesField(Credentials, Credentials.renameFn);
        form.setStyle("margin", "auto");
        formContainer.appendChild(form);
        var submitBtn = new ButtonField("Submit");
        submitBtn.addClickListener(function () {
            if (!form.isValid()) {
                new Toast("Invalid values");
                return;
            }
            submitBtn.setEnabled(false);
            label.setText("Verifying...");
            form.prependChild(new LoadingField());
            // d.close();
            var creds = form.getState();
            if(creds.username != "KJ7SDL"){ // TODO XXX actually do something
                t.reset(true);
                return;
            }

            Credentials.username = creds.username; // TODO handle credentials on PubSub bus
            Credentials.password = creds.password;
            Credentials.admin = true;

            Credentials.save();

            // TODO actually verify credentials
            t._bus.publish(new MBMessage("req", "admin", true));
            t._bus.publish(new MBMessage("updreq", "synchronizr", "reconnect"));
            t._bus.publish(new MBMessage("req", "selView", "admin"));
        });
        formContainer.appendChild(submitBtn);
        t.appendChild(formContainer);
        var ovrBtn = new ButtonField("Override Login").setStyle("flexGrow", 0).setStyle("justifyContent", "flex-end");
        ovrBtn.btn.title = "Event will not go live without valid credentials";
        t.appendChild(ovrBtn);
    }
}