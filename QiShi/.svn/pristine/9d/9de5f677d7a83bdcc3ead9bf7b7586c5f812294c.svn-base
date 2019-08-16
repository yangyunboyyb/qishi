let AudioHelp = require("AudioHelp");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    init: function (controller, i, j) {
        this.controller = controller;
        this.row = i;
        this.col = j;
        this.node.name = ((i + 1) * 10 + j + 1).toString();
        this.node.setScale(8 / this.controller.chessWidth);
    },

    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.controller.fangList.length > 0)
                return;
            AudioHelp.btnClickEffect();
            self.controller.showCells(self.row, self.col);
        }, this);
    },

    start() {

    },
});
