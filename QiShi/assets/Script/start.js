let Utils = require("Utils");
let WXHelp = require("WXHelp");
let CallBackHelp = require("CallBackHelp");
let PanelManager = require("PanelManager");
let AudioHelp = require("AudioHelp");
let HttpHelp = require("HttpHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        imghead: cc.Sprite,
        labelname: cc.Label,
        labelscore: cc.Label,

        ui_top: cc.Node,
        introducePrefab: cc.Prefab,

        startBtn: cc.Node,
        readyNode: cc.Node,
        moreBtn: cc.Node,
    },

    initCallBack() {
        let self = this;
        CallBackHelp.addCall(window.CallBackMsg.GetUserInfo, function (param) {
            self.setUiTop();
        }, this);
        CallBackHelp.addCall(window.CallBackMsg.CheckNewDay, function (param) {
            self.checkNewDay();
        }, this);

        window.SystemInfo.refreshServerTime();
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("游戏进入后台");
            self.hasClick = false;
            window.SystemInfo.setStartTime();
            window.GameData.saveStorage();
            window.SystemInfo.setServerTime(0);
        }, this);
        cc.game.on(cc.game.EVENT_SHOW, function () {
            self.hasClick = false;
            console.log("重新返回游戏");
            window.SystemInfo.setEndTime();
            window.SystemInfo.refreshServerTime();
        }, this);
    },

    onLoad: function () {
        let self = this;
        setTimeout(() => {
            self.startGame = true;
        }, 500);
    },

    createBanner: function () {
        this.banner = WXHelp.createBanner(window.BannerVedioId.startScene_banner);
        this.haveBanner = true;
    },

    showBanner: function () {
        if (this.banner != null) {
            this.banner.show();
            this.haveBanner = true;
        }
    },

    hideBanner: function () {
        if (this.banner != null) {
            this.banner.hide();
            this.haveBanner = false;
        }
    },

    start() {
        let self = this;
        if (window.SystemInfo.isLoaded == false) {
            cc.director.loadScene('load');
            return;
        }
        AudioHelp.playEffect(window.AudioName.ENTER_LABBY, 1);
        if (cc.sys.platform == cc.sys.WECHAT_GAME && window.gameToLobby == false) {
            //微信平台
            WXHelp.initThis();
        }
        window.gameToLobby = false;
        this.setUiTop();
        this.initCallBack();
        this.setDataToWX();

        this.startBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (window.GameData.dataUpdated == false)
                return;
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("level_small");
        }, this);

        this.node.getChildByName("rank").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            self.setDataToWX();
            PanelManager.openPanel(window.PrefabType.Rank);
        }, this);

        this.node.getChildByName("share").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == false)
                return;
            WXHelp.shareGroup();
        }, this);

        this.node.getChildByName("set").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            PanelManager.openPanel(window.PrefabType.Setting);
        }, this);

        this.node.getChildByName("rule").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            self.createRulePanel();
        }, this);

        this.moreBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (window.GameData.dataUpdated == false)
                return;
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("newScene");
        }, this);

        if (window.GameData.showShare == true)
            this.createBanner();
    },

    createRulePanel: function () {
        let panel = cc.instantiate(this.introducePrefab);
        panel.name = "gui_ze";
        panel.parent = this.node;
        let yaoqingNode = panel.getChildByName("wenzi_yaoqinghaoyou");
        yaoqingNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.75, 1.1, 1.1), cc.scaleTo(0.75, 1, 1))));
        yaoqingNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == false)
                return;
            WXHelp.shareGroup(0);
        }, this);
        let btn = panel.getChildByName("btn_close");
        btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            panel.destroy();
        }, this);
    },

    btnClickShare: function () {
        AudioHelp.btnClickEffect();
        WXHelp.shareGroup();
    },

    update: function (dt) {
        if (window.GameData.showShare == true) {
            if (this.node.getChildByName("pai_hang") ||
                this.node.getChildByName("gui_ze")) {
                if (this.haveBanner == true)
                    this.hideBanner();
            }
            else {
                if (this.haveBanner == false)
                    this.showBanner();
            }
        }

        if (window.WXData.userInfo.nickname != null) {
            if (window.GameData.dataUpdated == false) {
                if (this.startBtn.active == true) {
                    this.startBtn.active = false;
                    this.moreBtn.active = false;
                    this.readyNode.active = true;
                }
            }
            else {
                if (this.startBtn.active == false) {
                    this.startBtn.active = true;
                    this.moreBtn.active = true;
                    this.readyNode.active = false;
                }
            }
        }
        else {
            if (this.startGame != null) {
                if (this.readyNode.active == true) {
                    this.readyNode.active = false;
                    this.startBtn.active = true;
                    this.moreBtn.active = true;
                }
            }
            else {
                if (this.readyNode.active == false) {
                    this.readyNode.active = true;
                    this.startBtn.active = false;
                    this.moreBtn.active = false;
                }
            }
        }
    },

    /**
     * 设置ui_top
     */
    setUiTop: function () {
        if (window.WXData.userInfo.nickname != null) {
            this.ui_top.active = true;
            let data = WXData.userInfo;
            var url = data.headimageurl;
            Utils.createImage(url, this.imghead);
            this.labelname.string = Utils.atobUserInfo(data.nickname);
            let score = window.GameData.curMaxLevel;
            this.labelscore.string = "第" + score.toString() + "关";
        } else {
            this.ui_top.active = false;
        }
    },

    checkNewDay: function () {
        let curTime = window.SystemInfo.getServerTime();
        curTime = Math.floor(curTime / 1000);
        var isToday = Utils.judgeTime(window.GameData.saveTime, curTime);
        if (!isToday) {
            window.GameData.shareCount = 0;
        }
        window.GameData.saveTime = curTime;
    },

    setDataToWX: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            window.wx.setUserCloudStorage({
                KVDataList: [{ key: "userGameRank", value: window.GameData.curMaxLevel + "" }],
                success: function (res) {
                    console.log('setUserCloudStorage', 'success', res)
                },
                fail: function (res) {
                    console.log('setUserCloudStorage', 'fail')
                },
                complete: function (res) {
                    console.log('setUserCloudStorage', 'ok')
                }
            });
        }
    },

    shareFunc: function (func) {
        console.log("_--分享次数--?", window.GameData.shareCount);
        let self = this;
        WXHelp.shareAppMessageDiffGroup(function () {
            window.curShareType = "StartTenBall";
            self.timer = setInterval(function () {
                if (window.SystemInfo.isSuccess != -1) {
                    clearInterval(self.timer);
                }
                if (window.SystemInfo.isSuccess == 1) {
                    window.SystemInfo.isSuccess = -1;
                    window.GameData.setShareCount(1);
                    func();
                } else if (window.SystemInfo.isSuccess == 0) {
                    window.SystemInfo.isSuccess = -1;
                    self.hasClick = false;
                    WXHelp.showWXTips("提示", "分享失败，请分享到其他群！");
                }
            }, 800);
        });
    },

    onDisable: function () {
        this.hasClick = false;
        CallBackHelp.removeCallByTarget(this);
    },

    getShareCount: function () {
        if (window.SystemInfo.serverStringId == null || window.SystemInfo.serverToken == null) {
            return;
        }
        let self = this;
        var parmes = {
            userid: window.SystemInfo.serverStringId,
            token: window.SystemInfo.serverToken,
        };
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.GetAccountInfo;

        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
                window.GameData.setShare(res.invitecount);
            }
        })
    },
});