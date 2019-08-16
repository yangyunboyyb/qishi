let AudioHelp = require("AudioHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        isLocked: cc.Node,
        imgNode: cc.Node,
        typeSpriteFrame: [cc.SpriteFrame],
    },

    init: function (index) {
        this.index = index;
        let start = 1 + this.index * Global.levelSum;
        let end = (this.index + 1) * Global.levelSum;
        this.imgNode.getComponent(cc.Sprite).spriteFrame = this.typeSpriteFrame[this.index];
        this.setColor();

        let maxLevel = window.GameData.curMaxLevel;
        let count = parseInt(maxLevel / Global.levelSum);
        if (this.index < count) {
            this.isLocked.active = false;
        }
        else if (this.index == count) {
            if (maxLevel % Global.levelSum == 0) {
                this.isLocked.active = true;
            }
            else {
                this.isLocked.active = false;
            }
        }
        else {
            this.isLocked.active = true;
        }
    },

    setColor: function () {
        var colors = [
            cc.color(133, 194, 39, 255),
            cc.color(0, 153, 62, 255),
            cc.color(0, 147, 128, 255),
            cc.color(0, 146, 203, 255),
            cc.color(0, 103, 172, 255),
            cc.color(34, 41, 122, 255),
            cc.color(113, 28, 121, 255),
            cc.color(199, 23, 122, 255),
            cc.color(220, 30, 92, 255),
            cc.color(217, 36, 43, 255),
            cc.color(230, 120, 23, 255),
            cc.color(252, 219, 0, 255),
        ];

        let index = this.index % colors.length;
        this.imgNode.color = colors[index];
    },

    start() {

    },

    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.isLocked.active)
                return;
            AudioHelp.btnClickEffect();
            window.GameData.setSelStage(self.index);
            cc.director.loadScene("level_small");
        }, this);
    },
});
