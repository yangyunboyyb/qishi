let ModalPanel = require("modalPanel");
let WXHelp = require("WXHelp");
cc.Class({
    extends: ModalPanel,

    properties: {
        btn_effect: cc.Button,
        btn_backChat: cc.Button,
        label_id: cc.Label,

        onspr: cc.SpriteFrame,
        offspr: cc.SpriteFrame,
    },

    start() {
        this.open(this.node.getChildByName("panelBg"))

        this.btnBack = WXHelp.createFeedbackButton(this.btn_backChat.node);

        if (window.SystemInfo.serverStringId) {
            this.node.getChildByName("panelBg").getChildByName("id-kuang").active = true;
            this.label_id.string = window.SystemInfo.serverStringId;
        } else {
            this.node.getChildByName("panelBg").getChildByName("id-kuang").active = false;
        }

        if (window.GameData.getIsEffect() == 1 || window.GameData.getIsEffect() == "1") {
            this.btn_effect.node.getComponent(cc.Sprite).spriteFrame = this.onspr;
        } else {
            this.btn_effect.node.getComponent(cc.Sprite).spriteFrame = this.offspr;
        }
    },

    btnClickEffect: function () {
        if (window.GameData.isEffect == 1) {
            window.GameData.setIsEffect(0);
            this.btn_effect.node.getComponent(cc.Sprite).spriteFrame = this.offspr;
        } else {
            window.GameData.setIsEffect(1);
            this.btn_effect.node.getComponent(cc.Sprite).spriteFrame = this.onspr;
        }
    },

    btnClickBackChat: function () {
    },

    btnClickClose() {
        this.btnBack.hide();
        this.close();
    },

});

