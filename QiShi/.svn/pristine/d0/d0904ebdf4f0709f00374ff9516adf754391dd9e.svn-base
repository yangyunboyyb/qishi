let AudioHelp = require("AudioHelp");

cc.Class({
    extends: cc.Component,

    properties: {
        scrollViewContent: cc.Node,
        returnBtn: cc.Node,
        stageItem: cc.Prefab,
    },

    start() {
        this.scrollViewContent.removeAllChildren();
        for (var i = 0; i < Global.gameStage.length; i++) {
            let item = cc.instantiate(this.stageItem);
            item.getComponent("stageItem").init(i);
            this.scrollViewContent.addChild(item);
        }
    },

    onLoad: function () {
        this.onResize(); //屏幕适配
        this.returnBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            cc.director.loadScene("start");
        }, this);
    },

    onResize: function () {
        let frameSize = cc.view.getFrameSize();
        let Height = window.wx.getSystemInfoSync().pixelRatio * frameSize.height; //分辨率
        let DeviceHeight = window.wx.getSystemInfoSync().devicePixelRatio * frameSize.height; //硬件分辨率
        if (Height == DeviceHeight) {
            let H = frameSize.height * (760 / frameSize.width);
            let sScale = 1280 / H;
            this.node.getChildByName("panelBg").setScale(sScale);
        }
    },
});
