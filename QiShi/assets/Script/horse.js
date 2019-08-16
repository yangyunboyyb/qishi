let AudioHelp = require("AudioHelp");

cc.Class({
    extends: cc.Component,

    properties: {
        touchArea: cc.Node,
    },

    init: function (controller, i, j, opacity) {
        this.row = i;
        this.col = j;
        this.controller = controller;
        this.node.opacity = opacity;
        let sScale = 8 / this.controller.chessWidth
        let rScale = sScale * 0.9;
        let width = this.controller.node.width - Global.gap;
        let height = this.controller.node.height - Global.gap;
        this.node.y = -width / 2 + width / this.controller.chessWidth * this.row + width / (2 * this.controller.chessWidth);
        this.node.x = -height / 2 + height / this.controller.chessHeight * this.col + height / (2 * this.controller.chessHeight);
        this.node.setScale(sScale);
        if (opacity < 255) {
            this.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, rScale, rScale), cc.scaleTo(1, sScale, sScale))));
        }
    },

    onLoad: function () {
        this.touchListen();
    },

    touchListen: function () {
        let self = this;
        this.touchArea.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.node.opacity == 255)
                return;
            AudioHelp.btnClickEffect();
            self.controller.power++;
            self.controller.resetHorse(self.row, self.col);
        }, this);
    },

    start() {

    },
});