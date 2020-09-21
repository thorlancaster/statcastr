const Constants = {
  defaultStyle: [
    {numberField: {litColor: "#F81"}},
    {scoreboardHomeScore: {litColor: "#F01"}, scoreboardGuestScore: {litColor: "#F01"}, scoreboardPFPPlayerNum: {litColor: "#F01"},
    scoreboardHomeFouls: {litColor: "#F01"}, scoreboardGuestFouls: {litColor: "#F01"}, scoreboardClock: {litColor: "#FD0"},
    scoreboardPeriod: {litColor: "#FD0"}}
  ]
}

class Main{
  constructor(){
    var t = this;
    t.appRoot = DGE(APP_ROOT);
    t.views = [];
    t.NULL_VIEW = new NullView();

    t.viewSelector = t.createViewSelector();
    t.viewSelector.addSelectionListener(function(sel){ t.onViewSelected(sel); });
    t.appRoot.appendChild(t.viewSelector.element);

    t.viewContainer = DCE("div","viewContainer");
    t.viewContainer.style.flexShrink = "1";
    t.viewContainer.style.flexGrow = "1";
    t.appRoot.appendChild(t.viewContainer);


    t.model = t.createSportModel("basketball");
    t.model.dbgCreatePlayByPlay();
    t.model.updateFromPBP();
    window.MODEL = t.model;

    t.generateView("scoreboard", new ScoreboardView(t.model));
    t.generateView("playByPlay", new PlayByPlayView(t.model));
    t.generateView("teamStats", new TeamStatsView(t.model, true));
    t.setView("teamStats");
    t.update();

    // Allow the page to render before finishing
    setTimeout(function(){
      t.onResize();
      t.viewSelector.setSelected(t.selectedView);
    }, 0);

    setTimeout(function(){
      t.model.pbp.addPlay(new BasketballPBPItem(2, 470 * 1000, "24", true, BasketballPlayType.DUNK_MADE));
      t.model.updateFromPBP();
      t.update();
    }, 5000);
  }

  onViewSelected(sel){
    switch(sel){
      case "file":
      case "help":
      this.showMainDialog(sel);
      break;
      default:
      this.setView(sel);
    }
    this.getSelectedView().resize();
    this.getSelectedView().update();
  }

  createViewSelector(){
    var vs = new TabSelector();
    vs.addClass("mainTabSelector");
    vs.setStyle("flexShrink", "0");
    vs.setStyles("top", "left", "0px");
    vs.addIcon("favicon.ico");
    vs.addTab("<u>F</u>ILE", "file", true);
    vs.addTab("<u>S</u>COREBOARD", "scoreboard");
    vs.addTab("SPLIT&nbsp;<u>B</u>OX", "splitBox");
    vs.addTab("<u>T</u>EAM STATS", "teamStats");
    vs.addTab("<u>O</u>PPONENT STATS", "opponentStats");
    vs.addTab("<u>P</u>LAY-BY-PLAY", "playByPlay");
    vs.addTab("S<u>C</u>ORING", "scoring");
    vs.addTab("SHOOTIN<u>G</u>", "shooting");
    vs.addTab("<u>H</u>ELP", "help", true);
    return vs;
  }

  createSportModel(name){
    switch(name){
      case "basketball":
        return new BasketballGameModel();
      break;
      default:
        throw "Unsupported sport name: " + name;
    }
  }

  generateView(name, obj){
    this.views.push([name, obj]);
  }

  showMainDialog(dlg){
    console.log("TODO SHOW DIALOG " + dlg);
  }

  setView(vid){
    var t = this;
    t.selectedView = vid;
    CLEAR(t.viewContainer);
    var selView = null; // View that maps to given vid
    for(var x = 0; x < t.views.length; x++){
      var key = t.views[x][0];
      var val = t.views[x][1];
      if(key == vid){
        selView = val;
        break;
      }
    }
    if(selView == null)
      selView = t.NULL_VIEW;
    var h = selView.getHeaderElement();
    if(h) t.viewContainer.appendChild(h);
    t.viewContainer.appendChild(selView.getMainElement());
  }

  getSelectedView(){
    for(var v in this.views){
      if(this.views[v][0] == this.selectedView)
        return this.views[v][1];
    }
    return this.NULL_VIEW;
  }

  update(){
    this.getSelectedView().update();
  }

  onResize(){
    this.getSelectedView().resize();
    this.viewSelector.resize();
  }

  onFocus(){

  }
  onBlur(){

  }
}


battegorize("0, 2950 .......... 0, 3000 .......... 0, 3010 .......... 0, 3030 .......... 0, 3040 .......... 0, 3050 .......... 0, 3070 .......... 0, 3110 .......... 0, 3110 .......... 0, 3120 .......... 0, 3125 .......... 0, 3130 .......... 10, 3159 .......... 20, 3224 .......... 30, 3197 .......... 40, 3228 .......... 50, 3211 .......... 60, 3264 .......... 70, 3285 .......... 80, 3261 .......... 90, 3332 .......... 100, 3340 .......... 110, 3374 .......... 120, 3382 .......... 130, 3346 .......... 140, 3398 .......... 150, 3340 .......... 160, 3393 .......... 170, 3325 .......... 180, 3408 .......... 190, 3387 .......... 200, 3371 .......... 210, 3406 .......... 220, 3393 .......... 230, 3389 .......... 240, 3408 .......... 250, 3415 .......... 260, 3404 .......... 270, 3399 .......... 280, 3395 .......... 290, 3395 .......... 300, 3400 .......... 310, 3413 .......... 320, 3425 .......... 330, 3402 .......... 340, 3400 .......... 350, 3423 .......... 360, 3436 .......... 370, 3427 .......... 380, 3433 .......... 390, 3453 .......... 400, 3440 .......... 410, 3458 .......... 420, 3448 .......... 430, 3463 .......... 440, 3447 .......... 450, 3470 .......... 460, 3459 .......... 470, 3479 .......... 480, 3475 .......... 490, 3475 .......... 500, 3475 .......... 510, 3485 .......... 520, 3489 .......... 530, 3502 .......... 540, 3494 .......... 550, 3490 .......... 560, 3496 .......... 570, 3502 .......... 580, 3517 .......... 590, 3509 .......... 600, 3508 .......... 610, 3518 .......... 620, 3523 .......... 630, 3528 .......... 640, 3543 .......... 650, 3524 .......... 660, 3540 .......... 670, 3534 .......... 680, 3544 .......... 690, 3552 .......... 700, 3542 .......... 710, 3554 .......... 720, 3560 .......... 730, 3561 .......... 740, 3560 .......... 750, 3546 .......... 760, 3557 .......... 770, 3556 .......... 780, 3557 .......... 790, 3573 .......... 800, 3571 .......... 810, 3572 .......... 820, 3566 .......... 830, 3569 .......... 840, 3567 .......... 850, 3575 .......... 860, 3574 .......... 870, 3590 .......... 880, 3590 .......... 890, 3577 .......... 900, 3597 .......... 910, 3580 .......... 920, 3576 .......... 930, 3582 .......... 940, 3567 .......... 950, 3600 .......... 960, 3591 .......... 970, 3607 .......... 980, 3591 .......... 990, 3583 .......... 1000, 3590 .......... 1010, 3588 .......... 1020, 3599 .......... 1030, 3611 .......... 1040, 3595 .......... 1050, 3611 .......... 1060, 3603 .......... 1070, 3601 .......... 1080, 3603 .......... 1090, 3622 .......... 1100, 3602 .......... 1110, 3624 .......... 1120, 3625 .......... 1130, 3636 .......... 1140, 3628 .......... 1150, 3630 .......... 1160, 3620 .......... 1170, 3614 .......... 1180, 3624 .......... 1190, 3619 .......... 1200, 3624 .......... 1210, 3640 .......... 1220, 3640 .......... 1230, 3640 .......... 1240, 3617 .......... 1250, 3635 .......... 1260, 3643 .......... 1270, 3636 .......... 1280, 3641 .......... 1290, 3646 .......... 1300, 3645 .......... 1310, 3656 .......... 1320, 3661 .......... 1330, 3672 .......... 1340, 3652 .......... 1350, 3669 .......... 1360, 3678 .......... 1370, 3665 .......... 1380, 3660 .......... 1390, 3664 .......... 1400, 3682 .......... 1410, 3672 .......... 1420, 3672 .......... 1430, 3691 .......... 1440, 3676 .......... 1450, 3683 .......... 1460, 3679 .......... 1470, 3691 .......... 1480, 3695 .......... 1490, 3682 .......... 1500, 3690 .......... 1510, 3694 .......... 1520, 3700 .......... 1530, 3712 .......... 1540, 3707 .......... 1550, 3703 .......... 1560, 3700 .......... 1570, 3735 .......... 1580, 3727 .......... 1590, 3724 .......... 1600, 3723 .......... 1610, 3724 .......... 1620, 3724 .......... 1630, 3744 .......... 1640, 3754 .......... 1650, 3761 .......... 1660, 3761 .......... 1670, 3779 .......... 1680, 3776 .......... 1690, 3774 .......... 1700, 3759 .......... 1710, 3784 .......... 1720, 3794 .......... 1730, 3778 .......... 1740, 3795 .......... 1750, 3787 .......... 1760, 3789 .......... 1770, 3803 .......... 1780, 3791 .......... 1790, 3793 .......... 1800, 3808 .......... 1810, 3799 .......... 1820, 3808 .......... 1830, 3809 .......... 1840, 3810 .......... 1850, 3833 .......... 1860, 3822 .......... 1870, 3813 .......... 1880, 3836 .......... 1890, 3843 .......... 1900, 3842 .......... 1910, 3839 .......... 1920, 3852 .......... 1930, 3856 .......... 1940, 3840 .......... 1950, 3853 .......... 1960, 3869 .......... 1970, 3863 .......... 1980, 3855 .......... 1990, 3861 .......... 2000, 3846 .......... 2010, 3860 .......... 2020, 3870 .......... 2030, 3860 .......... 2040, 3871 .......... 2050, 3880 .......... 2060, 3896 .......... 2070, 3886 .......... 2080, 3887 .......... 2090, 3893 .......... 2100, 3900 .......... 2110, 3880 .......... 2120, 3906 .......... 2130, 3893 .......... 2140, 3910 .......... 2150, 3900 .......... 2160, 3919 .......... 2170, 3901 .......... 2180, 3929 .......... 2190, 3919 .......... 2200, 3906 .......... 2210, 3913 .......... 2220, 3927 .......... 2230, 3911 .......... 2240, 3924 .......... 2250, 3939 .......... 2260, 3940 .......... 2270, 3927 .......... 2280, 3934 .......... 2290, 3941 .......... 2300, 3947 .......... 2310, 3950 .......... 2320, 3943 .......... 2330, 3938 .......... 2340, 3965 .......... 2350, 3957 .......... 2360, 3951 .......... 2370, 3960 .......... 2380, 3972 .......... 2390, 3976 .......... 2400, 3974 .......... 2410, 3983 .......... 2420, 3983 .......... 2430, 3997 .......... 2440, 3996 .......... 2450, 4002 .......... 2460, 3978 .......... 2470, 4008 .......... 2480, 4009 .......... 2490, 4005 .......... 2500, 4011 .......... 2510, 4021 .......... 2520, 4007 .......... 2530, 4023 .......... 2540, 4036 .......... 2550, 4014 .......... 2560, 4034 .......... 2570, 4054 .......... 2580, 4044 .......... 2590, 4052 .......... 2600, 4043 .......... 2610, 4045 .......... 2620, 4056 .......... 2630, 4064 .......... 2640, 4063 .......... 2650, 4056 .......... 2660, 4049 .......... 2670, 4073 .......... 2680, 4077 .......... 2690, 4065 .......... 2700, 4068 .......... 2710, 4068 .......... 2720, 4068 .......... 2730, 4078 .......... 2740, 4071 .......... 2750, 4064 .......... 2760, 4074 .......... 2770, 4088 .......... 2780, 4085 .......... 2790, 4070 .......... 2800, 4066 .......... 2810, 4087 .......... 2820, 4075 .......... 2830, 4076 .......... 2840, 4080 .......... 2850, 4088 ......");
var testBattMah = 3000;
function battegorize(str){
  var split = str.split("..........");
  var arr = [];
  for(var x = 0; x < split.length; x++){
    var s = split[x].split(",");
    // var mah = parseInt(s[0]);
    var mv = parseInt(s[1]);
    arr.push(mv);
  }
  arr.sort((a, b) => a - b);
  // At this point arr is an array where each element is voltage after 10 mv
  var arr2 = [];
  // Smooth it
  for(var x = 0; x < arr.length; x++){
    var ksize = 4;
    var avg = 0;
    var num = 0;
    for(var y = -ksize; y <= ksize; y++){
      if(arr[x+y]){
        num++;
        avg += arr[x + y];
      }
    }
    avg /= num;
    arr2[x] = Math.round(avg);
    arr2[x] = avg;
  }
  var arr3 = [];
  for(var x = 0; x < arr2.length; x++){
    arr3[x] = {mah: x*10, mv: arr2[x]}
  }
  // console.log(arr3);
  window.battArr = arr3;
}

function getMah(voltage){
  for(var x = 0; x < battArr.length; x++){
    var mah = battArr[x].mah;
    var mv = battArr[x].mv;
    if(voltage < mv){
      var lastMah = battArr[x-1].mah;
      var lastMv = battArr[x-1].mv;
      var thisDist = mv - voltage;
      var lastDist = voltage - lastMv;
      var totalDist = thisDist + lastDist;
      var result = mah*(lastDist/totalDist) + lastMah*(thisDist/totalDist);
      return Math.round(result*10) / 10;
    }
  }
}

function getActualCapacity(startVoltage, endVoltage, actualMah){
  var calcMah = getMah(endVoltage) - getMah(startVoltage);
  var rtn = testBattMah * (actualMah / calcMah);
  return Math.round(rtn);
}