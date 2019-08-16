
cc.Class({
    extends: cc.Component,

    properties: {
    },

    init: function (controller, i, j) {
        this.controller = controller;
        let width = this.controller.node.width - Global.gap;
        let height = this.controller.node.height - Global.gap;
        if (i == 1) {
            this.node.rotation = 90;
            this.node.x = -width / 2 + width / this.controller.chessWidth * j
            this.node.y = 0; //初始化
        }
        else {
            this.node.rotation = 0;
            this.node.y = -height / 2 + height / this.controller.chessHeight * j;
            this.node.x = 0; //初始化
        }
        this.node.height = 3; //初始化
        this.node.height *= (8 / this.controller.chessWidth);
        this.node.width = this.controller.node.width - Global.gap;
    },

    start() {

    },
});
