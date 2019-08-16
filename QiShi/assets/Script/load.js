
let CallBackHelp = require("CallBackHelp");
let JsonConfig = require("JsonConfig");
let WXHelp = require("WXHelp");
let LoadManager = require("LoadManager");
cc.Class({
    extends: cc.Component,

    properties: {
        progressNode: cc.ProgressBar,
        labelNode: cc.Label,
    },

    start() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            WXHelp.aboutShare();
        }
        this.progressNode.node.active = false;
        this.loadConfig();
        this.loadConfigForServer();
    },

    loadConfig: function () {
        let self = this;
        this.progressNode.node.active = true;
        CallBackHelp.addCall(window.CallBackMsg.JsonConfigLoadProgress, function (param) {
            self.progressNode.progress = param;
            self.labelNode.string = "正在加载配置表" + Math.floor(param * 100) + "%";
            if (param == 1) {
                self.loadImages();
            }
        }, this);
        JsonConfig.loadAll();
    },

    loadImages: function () {
        let self = this;
        CallBackHelp.addCall(window.CallBackMsg.ImageLoadProgress, function (param) {
            self.progressNode.progress = param;
            self.labelNode.string = "正在加载资源" + Math.floor(param * 100) + "%";
            if (param == 1) {
                self.loadEnd();
            }
        }, this);
        LoadManager.loadAll();
    },

    loadConfigForServer: function () {
        cc.loader.load(window.ConfigUrl + window.gameversion + "/config.json", (err, res) => {
            console.log('--share-->', res);
            if (!err) {
                window.GameData.showShare = res.showShare;
                window.GameData.shareChance = res.shareChance;
                window.GameData.config = res.config;
                window.GameData.shareTime = res.shareTime;
            }
            else {
                this.loadConfigForServer();
            }
        });
    },

    loadEnd: function () {
        cc.director.preloadScene("start", function () {
            cc.director.loadScene("start");
            window.SystemInfo.isLoaded = true;
        });
    },

    onDisable: function () {
        CallBackHelp.removeCallByTarget(this);
    },

});
