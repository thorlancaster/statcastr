class EventListViewDisplay extends ViewDisplay {
    constructor(bus) {
        super();
        var t = this;
        t._bus = bus;
        var lbl = new TextField("Loading...").setStyle("fontSize", "1.5em");
        var tbl = new TableField(["ID", "Type", "Team", "Opponent", "Location", "Time", "Info"]);
        t.lbl = lbl;
        t.tbl = tbl;
        t.setStyle("flexDirection", "column");
        t.appendChild(lbl);
        t.appendChild(tbl);
        // tbl.setColumns();

        tbl.enableClickListener(function (row) {
            // tbl.clearHighlights();
            // tbl.setHighlight(row, true);
            var eventId = tbl.getCell(0, row, false);
            var eventTeam = tbl.getCell(2, row, false);
            var eventOpp = tbl.getCell(3, row, false);
            t._bus.publish(new MBMessage("req", "event", eventId));
            t._bus.publish(new MBMessage("updreq", "synchronizr", "reconnect"));
            // t.showMainDialog("loadingStatsFeed", t.eventTeam, t.eventOpp);
        });
    }

    // Update the event selection table in the event selection dialog,
    // given a response from Synchronizr
    updateEvtSelTbl(arr) {
        var t = this;
        var tbl = t.tbl;
        t.lbl.setText("Live Stats Feeds");
        if (tbl) {
            tbl.setLength(arr.length);
            for (var x = 0; x < arr.length; x++) {
                var arrx = arr[x];
                var r = Synchronizr.parseSingleEventListing(arrx);
                // console.log(id, type, {hTown, hMascot, hAbbr}, {gTown, gMascot, gAbbr}, location, comments, startTime, gender);
                tbl.setCell(0, x, "<span class='link'>" + r.id + "</a>", true);
                tbl.setCell(1, x, r.gender + " " + r.type);
                tbl.setCell(2, x, r.hAbbr + " " + r.hMascot);
                tbl.setCell(3, x, r.gAbbr + " " + r.gMascot);
                tbl.setCell(4, x, r.location);
                tbl.setCell(5, x, r.startTime);
                tbl.setCell(6, x, r.comments.length ? r.comments : "--");
            }
        }
    }
}