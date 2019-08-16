let Utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {
        labelname: cc.Label,
        labelscore: cc.Label,
        labelrank: cc.Label,
        imghead: cc.Sprite,
        imgrank: cc.Sprite,
    },

    init(data, itemId, indexImg) {
        this.itemID = itemId;

        var url = data.headimageurl;
        Utils.createImage(url, this.imghead);
        this.labelname.string = Utils.atobUserInfo(data.nickname);
        this.labelscore.string = "第" + data.rankvalue + "关";

        if (data.ranknum < 4) {
            this.labelrank.node.active = false;
            this.imgrank.node.active = true;
            this.imgrank.spriteFrame = indexImg[(data.ranknum) - 1]
        } else {
            this.imgrank.node.active = false;
            this.labelrank.node.active = true;
            this.labelrank.string = data.ranknum;
        }
    },

});