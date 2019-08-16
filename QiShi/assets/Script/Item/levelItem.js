let AudioHelp = require("AudioHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        isLocked: cc.Node,
        enterBtn: cc.Node,
        num1: cc.Node,
        num2: cc.Node,
        num3: cc.Node,
        typeSpriteFrame: [cc.SpriteFrame],
    },

    init: function (level) {
        this.level = level;
        let number3 = level % 10;
        level = parseInt(level / 10);
        let number2 = level % 10;
        level = parseInt(level / 10);
        let number1 = level % 10;
        this.num1.getComponent(cc.Sprite).spriteFrame = this.typeSpriteFrame[number1];
        this.num2.getComponent(cc.Sprite).spriteFrame = this.typeSpriteFrame[number2];
        this.num3.getComponent(cc.Sprite).spriteFrame = this.typeSpriteFrame[number3];
        this.setColor();

        if (this.level > window.GameData.curMaxLevel) {
            this.isLocked.active = true;
        }
        else {
            this.isLocked.active = false;
            if (this.level == window.GameData.curMaxLevel) {
                this.enterBtn.active = true;
            }
            else {
                this.enterBtn.active = false;
            }
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

        let index = (this.level - 1) % colors.length;
        this.num1.color = colors[index];
        this.num2.color = colors[index];
        this.num3.color = colors[index];
    },

    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.isLocked.active)
                return;
            AudioHelp.btnClickEffect();
            window.GameData.setCurLevel(self.level);
            cc.director.loadScene("game");
        }, this);
    },

    start() {

    },
});
