
cc.Class({
    extends: cc.Component,

    properties: {
        typeSpriteFrame: [cc.SpriteFrame],
        nameSpriteFrame: [cc.SpriteFrame],
        nameNode: cc.Node,
    },

    init: function (controller, i, j) {
        this.row = i;
        this.col = j;
        this.controller = controller;
        let width = this.controller.node.width - Global.gap;
        let height = this.controller.node.height - Global.gap;
        this.node.y = -width / 2 + width / this.controller.chessWidth * this.row + width / (2 * this.controller.chessWidth);
        this.node.x = -height / 2 + height / this.controller.chessHeight * this.col + height / (2 * this.controller.chessHeight);
        this.node.setScale(8 / this.controller.chessWidth);

        this.getComponent(cc.Sprite).spriteFrame = this.typeSpriteFrame[i];
        this.nameNode.getComponent(cc.Sprite).spriteFrame = this.nameSpriteFrame[i];
    },

    start() {

    },
});