let AudioHelp = require("AudioHelp");
let WXHelp = require("WXHelp");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME)
            this.onResize();
        this.btnListen();
    },

    btnListen: function () {
        let self = this;
        this.node.getChildByName("returnBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("start");
        }, this);

        this.node.getChildByName("startBtn").on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("main");
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

    start() {
        if (window.GameData.showShare == true)
            this.createBanner();
    },

    createBanner: function () {
        this.banner = WXHelp.createBanner(window.BannerVedioId.ruleScene_banner);
    },
});
