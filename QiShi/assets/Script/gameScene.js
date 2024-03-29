let AudioHelp = require("AudioHelp");
let WXHelp = require("WXHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        linePrefab: cc.Prefab,
        cellPrefab: cc.Prefab,
        quenPrefab: cc.Prefab,
        fangPrefab: cc.Prefab,
        selePrefab: cc.Prefab,
        handPrefab: cc.Prefab,

        overLabel: cc.Label,

        backBtn: cc.Node,
        tipBtn: cc.Node,
        regretBtn: cc.Node,
        nextBtn: cc.Node,
        returnBtn: cc.Node,

        numberSpriteFrame: [cc.SpriteFrame],
    },

    onLoad: function () {
        this.curLevel = window.GameData.queenMaxLevel;
        this.showLevel(this.curLevel);
        if (cc.sys.platform == cc.sys.WECHAT_GAME)
            this.onResize();
        this.initCall();
        this.initLine();
        this.initCell();
        this.initQuen();
        this.initFang();
        this.initSele();
        this.initGame();
        this.BtnListn();
        if (this.curLevel == 1)
            this.handTeach();
        else {
            if (window.GameData.showShare == true)
                this.createBanner();
        }
    },

    handTeach: function () {
        let node = cc.instantiate(this.handPrefab);
        node.parent = this.node;
        let hand = node.getChildByName("hand");
        let posX = this.cellList[0].x;
        let posY = this.cellList[0].y - this.cellList[0].height / 2;
        hand.runAction(cc.spawn(cc.scaleTo(0.75, 0.5, 0.5), cc.moveTo(0.75, posX, posY)));

        let self = this;
        setTimeout(() => {
            hand.getChildByName("dian").active = true;
            node.getChildByName("shuoming").getComponent(cc.Label).string = "棕色遮罩区域可点击生成新娘";
        }, 750);

        setTimeout(() => {
            node.destroy();
            if (window.GameData.showShare == true)
                self.createBanner();
        }, 3000);
    },

    createBanner: function () {
        this.banner = WXHelp.createBanner(window.BannerVedioId.queenScene_banner);
    },

    showLevel: function (curLevel) {
        let num = curLevel;
        let index1 = parseInt(num / 10);
        let index2 = num % 10;
        let node = this.node.getChildByName("levelNode");
        node.getChildByName("num1").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[index1];
        node.getChildByName("num2").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[index2];
    },

    initCall: function () {
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("游戏进入后台");
            window.SystemInfo.setStartTime();
            window.GameData.saveStorage();
            window.SystemInfo.setServerTime(0);
        }, this);
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("重新返回游戏");
            window.SystemInfo.setEndTime();
            window.SystemInfo.refreshServerTime();
        }, this);
    },

    onResize: function () {
        let frameSize = cc.view.getFrameSize();
        let Height = window.wx.getSystemInfoSync().pixelRatio * frameSize.height; //分辨率
        let DeviceHeight = window.wx.getSystemInfoSync().devicePixelRatio * frameSize.height; //硬件分辨率
        if (Height == DeviceHeight) {
            let H = frameSize.height * (720 / frameSize.width);
            let sScale = 1280 / H;
            this.node.setScale(sScale);
        }
    },

    BtnListn: function () {
        let self = this;
        this.returnBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("newScene");
        }, this);

        this.node.getChildByName("resBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (self.gameResult == true) {
                self.curLevel++;
                self.showLevel(self.curLevel);
                window.GameData.setQueenCurLevel(self.curLevel);
                if (self.curLevel > window.GameData.queenMaxLevel)
                    window.GameData.setQueenMaxLevel(self.curLevel);
            }
            self.initGame();
        }, this);

        this.node.getChildByName("funBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == false)
                return;
            if (self.gameResult == true)
                WXHelp.shareGroup(-window.GameData.queenMaxLevel);
            else
                WXHelp.shareGroup(0);
        }, this);

        this.backBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.curLevel <= 1)
                return;
            AudioHelp.btnClickEffect();
            self.curLevel--;
            self.showLevel(self.curLevel);
            window.GameData.setQueenCurLevel(self.curLevel);
            self.clearAll();
            self.initGame();
        }, this);

        this.tipBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.gameResult != null || self.fangList.length > 0)
                return;
            else {
                if (self.useTip != null)
                    return;
            }
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == true) {
                WXHelp.createVideo(window.BannerVedioId.tipBtn_vedio, function () {
                    self.clearAll();
                    self.initGame();
                    self.tipQueen();
                }, function () {
                    self.shareFunc(function () {
                        self.clearAll();
                        self.initGame();
                        self.tipQueen();
                    });
                }, function () {
                });
            }
            else {
                self.clearAll();
                self.initGame();
                self.tipQueen();
            }
        }, this);

        this.regretBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.quenList.length <= Global.queenLevelData[self.curLevel - 1].diff.length ||
                self.fangList.length > 0)
                return;
            AudioHelp.btnClickEffect();
            self.regretFun();
        }, this);

        this.nextBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.curLevel >= Global.queenLevelData.length ||
                self.curLevel >= window.GameData.queenMaxLevel)
                return;
            AudioHelp.btnClickEffect();
            self.curLevel++;
            self.showLevel(self.curLevel);
            window.GameData.setQueenCurLevel(self.curLevel);
            self.clearAll();
            self.initGame();
        }, this);
    },

    regretFun: function () {
        let start = Global.queenLevelData[this.curLevel - 1].diff.length;
        let end = this.quenList.length - 1;
        var array = [];
        for (var i = start; i < end; i++) {
            let num = parseInt(this.quenList[i].name);
            array.push(num);
        }
        this.clearAll();
        this.initGame();
        for (var a of array) {
            let i = parseInt(a / 10) - 1;
            let j = a % 10 - 1;
            this.getQueen(i, j);
        }
    },

    tipQueen: function () {
        this.useTip = "use_tip";
        let answer = Global.queenLevelData[this.curLevel - 1].answer;
        for (var a of answer) {
            var flag = true;
            for (var i = 0; i < this.quenList.length; i++) {
                let num = parseInt(this.quenList[i].name);
                if (a == num) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                let i = parseInt(a / 10) - 1;
                let j = a % 10 - 1;
                this.getQueen(i, j);
                if (this.quenList.length >= Global.queenTipLimit)
                    return;
            }
        }
    },

    initLine: function () {
        this.linePool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let line = cc.instantiate(this.linePrefab); // 创建节点
            this.linePool.put(line); // 通过 put 接口放入对象池
        }
        this.lineList = [];
    },

    initCell: function () {
        this.cellPool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let cell = cc.instantiate(this.cellPrefab); // 创建节点
            this.cellPool.put(cell); // 通过 put 接口放入对象池
        }
        this.cellList = [];
    },

    initQuen: function () {
        this.quenPool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let quen = cc.instantiate(this.quenPrefab); // 创建节点
            this.quenPool.put(quen); // 通过 put 接口放入对象池
        }
        this.quenList = [];
    },

    initFang: function () {
        this.fangPool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let fang = cc.instantiate(this.fangPrefab);
            this.fangPool.put(fang);
        }
        this.fangList = [];
    },

    initSele: function () {
        this.selePool = new cc.NodePool();
        let initCount = 1;
        for (let i = 0; i < initCount; i++) {
            let sele = cc.instantiate(this.selePrefab);
            this.selePool.put(sele);
        }
        this.seleList = [];
    },

    initGame: function () {
        this.node.getChildByName("resBtn").active = false;
        this.node.getChildByName("funBtn").active = false;
        this.node.getChildByName("zhishikuang").active = false;
        this.gameResult = null;
        this.initChess();
        this.drawLines();
    },

    initChess: function () {
        this.useTip = null;
        this.chessWidth = Global.queenLevelData[this.curLevel - 1].width;
        this.chessHeight = Global.queenLevelData[this.curLevel - 1].height;
        for (var i = 0; i < this.chessWidth; i++) {
            for (var j = 0; j < this.chessHeight; j++) {
                this.getCell(i, j);
            }
        }
        for (var i = 0; i < Global.queenLevelData[this.curLevel - 1].diff.length; i++) {
            let d = Global.queenLevelData[this.curLevel - 1].diff[i];
            let x = parseInt(d / 10) - 1;
            let y = d % 10 - 1;
            this.getQueen(x, y);
        }
    },

    showQueensCnt: function (cnt) {
        this.node.getChildByName("queenCnt").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[cnt];
    },

    drawLines: function () {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < this.chessWidth + 1; j++) {
                this.drawLine(i, j);
            }
        }
    },

    drawLine: function (i, j) {
        let line = null;
        if (this.linePool.size() > 0) {
            line = this.linePool.get();
        } else {
            line = cc.instantiate(this.linePrefab);
        }
        line.parent = this.node;
        line.getComponent("line").init(this, i, j);
        this.lineList.push(line);
    },

    getCell: function (i, j) {
        let cell = null;
        if (this.cellPool.size() > 0) {
            cell = this.cellPool.get();
        }
        else {
            cell = cc.instantiate(this.cellPrefab);
        }
        cell.parent = this.node;
        cell.getComponent("cell").init(this, i, j);
        this.setPosition(cell, i, j);
        this.cellList.push(cell);
    },

    getQueen: function (i, j) {
        let quen = null;
        if (this.quenPool.size() > 0) {
            quen = this.quenPool.get();
        }
        else {
            quen = cc.instantiate(this.quenPrefab);
        }
        quen.parent = this.node;
        quen.name = ((i + 1) * 10 + j + 1).toString();
        quen.setScale(8 / this.chessWidth);
        this.setPosition(quen, i, j);
        this.setCells(i, j);
        this.quenList.push(quen);
        this.showQueensCnt(this.quenList.length);
    },

    setPosition: function (node, i, j) {
        let width = this.node.width;
        let height = this.node.height;
        node.y = -width / 2 + width / this.chessWidth * i + width / (2 * this.chessWidth);
        node.x = -height / 2 + height / this.chessHeight * j + height / (2 * this.chessHeight);
    },

    setCells: function (i, j) {
        for (var x = 0; x < this.chessWidth; x++) {
            for (var y = 0; y < this.chessHeight; y++) {
                if (i == x || j == y || (x - y) == (i - j) || (x + 1 + y + 1) == (i + 1 + j + 1)) {
                    let num = (x + 1) * 10 + y + 1;
                    for (var index = 0; index < this.cellList.length; index++) {
                        let c = this.cellList[index];
                        if (c.name == num.toString()) {
                            this.cellPool.put(c);
                            this.cellList.splice(index, 1);
                            break;
                        }
                    }
                }
            }
        }
    },

    gameOver: function () {
        let resBtn = this.node.getChildByName("resBtn");
        let funBtn = this.node.getChildByName("funBtn");
        if (this.quenList.length >= 8) {
            AudioHelp.playEffect(window.AudioName.SFX_GAME_WIN, 1);
            this.gameResult = true;
            this.overLabel.string = "胜利！";
            resBtn.getChildByName("result").getComponent(cc.Label).string = "进入下关";
            funBtn.getChildByName("functn").getComponent(cc.Label).string = "炫耀一下";
        }
        else {
            AudioHelp.playEffect(window.AudioName.SFX_GAME_LOSE, 1);
            this.gameResult = false;
            this.overLabel.string = "失败！";
            resBtn.getChildByName("result").getComponent(cc.Label).string = "再次挑战";
            funBtn.getChildByName("functn").getComponent(cc.Label).string = "求助好友";
        }
        this.clearAll();
        if (this.curLevel < Global.queenLevelData.length) {
            resBtn.active = true;
            funBtn.active = true;
            this.node.getChildByName("zhishikuang").active = true;
        }
        else {
            if (this.gameResult == false)
                resBtn.active = true;
            funBtn.active = true;
            this.node.getChildByName("zhishikuang").active = true;
        }
    },

    clearAll: function () {
        this.clearLines();
        this.clearCells();
        this.clearQueen();
        this.clearSelec();
        this.clearKuang();
    },

    clearLines: function () {
        for (var l of this.lineList) {
            this.linePool.put(l);
        }
        this.lineList = [];
    },

    clearCells: function () {
        if (this.cellList.length > 0) {
            for (var c of this.cellList) {
                this.cellPool.put(c);
            }
            this.cellList = [];
        }
    },

    clearQueen: function () {
        for (var q of this.quenList) {
            this.quenPool.put(q);
        }
        this.quenList = [];
    },

    update: function (dt) {
        if (this.curLevel <= 1)
            this.backBtn.opacity = 100;
        else
            this.backBtn.opacity = 255;
        if (this.curLevel >= window.GameData.queenMaxLevel)
            this.nextBtn.opacity = 100;
        else
            this.nextBtn.opacity = 255;
        if (this.quenList.length <= Global.queenLevelData[this.curLevel - 1].diff.length ||
            this.fangList.length > 0)
            this.regretBtn.opacity = 100;
        else
            this.regretBtn.opacity = 255;
        if (this.gameResult != null || this.fangList.length > 0)
            this.tipBtn.opacity = 100;
        else {
            if (this.useTip != null)
                this.tipBtn.opacity = 100;
            else
                this.tipBtn.opacity = 255;
        }
    },

    shareFunc: function (func) {
        let self = this;
        WXHelp.shareAppMessageDiffGroup(function () {
            window.curShareType = "InGame";
            self.timer = setInterval(function () {
                console.log("-window.SystemInfo.isSuccess-->", window.SystemInfo.isSuccess);
                if (window.SystemInfo.isSuccess != -1) {
                    clearInterval(self.timer);
                }
                if (window.SystemInfo.isSuccess == 1) {
                    window.SystemInfo.isSuccess = -1;
                    window.GameData.setShareCount(1);
                    func();
                } else if (window.SystemInfo.isSuccess == 0) {
                    window.SystemInfo.isSuccess = -1;
                    WXHelp.showWXTips("提示", "分享失败，请分享到其他群！");
                }
            }, 800);
        });
    },

    showCells: function (i, j) {
        for (var x = 0; x < this.chessWidth; x++) {
            for (var y = 0; y < this.chessHeight; y++) {
                if (i == x || j == y || (x - y) == (i - j) || (x + 1 + y + 1) == (i + 1 + j + 1)) {
                    let num = (x + 1) * 10 + y + 1;
                    for (var c of this.cellList) {
                        if (c.name == num.toString()) {
                            if (i == x && j == y)
                                this.getFang(x, y, true);
                            else
                                this.getFang(x, y, false);
                            break;
                        }
                    }
                }
            }
        }
        this.getSelect(i, j);
    },

    getSelect: function (i, j) {
        let sele = null;
        if (this.selePool.size() > 0) {
            sele = this.selePool.get();
        }
        else {
            sele = cc.instantiate(this.selePrefab);
        }
        sele.parent = this.node;
        this.setPosition(sele, i, j);
        if (i > 0)
            sele.y -= ((this.node.height / (this.chessHeight * 2)) + sele.height / 2);
        else
            sele.y += ((this.node.height / (this.chessHeight * 2)) + sele.height / 2);
        if (j == 0)
            sele.x += (sele.width / 2 - (this.node.width / (this.chessWidth * 2)));
        if (j == this.chessWidth - 1)
            sele.x -= (sele.width / 2 - (this.node.width / (this.chessWidth * 2)));
        sele.getComponent("select").init(this, i, j);
        this.seleList.push(sele);
    },

    clearSelec: function () {
        for (var s of this.seleList) {
            this.selePool.put(s);
        }
        this.seleList = [];
    },

    clearKuang: function () {
        for (var f of this.fangList) {
            this.fangPool.put(f);
        }
        this.fangList = [];
    },

    getFang: function (i, j, active) {
        let fang = null;
        if (this.fangPool.size() > 0) {
            fang = this.fangPool.get();
        }
        else {
            fang = cc.instantiate(this.fangPrefab);
        }
        fang.parent = this.node;
        this.setPosition(fang, i, j);
        fang.getChildByName("queen").active = active;
        this.fangList.push(fang);
    },

    start() {
    },
});
