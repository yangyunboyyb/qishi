let AudioHelp = require("AudioHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        duiNode: cc.Node,
        cuoNode: cc.Node,
    },

    init: function (controller, i, j) {
        this.controller = controller;
        this.row = i;
        this.col = j;
    },

    onLoad: function () {
        let self = this;
        this.duiNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            self.controller.clearKuang();
            self.controller.getQueen(self.row, self.col);
            if (self.controller.cellList.length == 0) {
                self.controller.gameOver();
            }
            self.controller.clearSelec();
        }, this);

        this.cuoNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            self.controller.clearKuang();
            self.controller.clearSelec();
        }, this);
    },
});
