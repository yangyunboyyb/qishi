let Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
        userHead: cc.Sprite,
        userName: cc.Label,
        rankLabel: cc.Label,
        rankimg: cc.Sprite,
        userScore: cc.Label,
    },

    init(rank, data, indexImg) {
        this.userName.string = data.nickname;
        var imgheadurl = data.avatarUrl;
        Utils.createImage(imgheadurl, this.userHead);

        let grade = "0";
        if (data.KVDataList && JSON.stringify(data.KVDataList) != '{}') {
            grade = data.KVDataList[0].value;
        }
        this.userScore.string = "第" + grade + "关";

        if (rank < 3) {
            this.rankLabel.node.active = false;
            this.rankimg.node.active = true;
            this.rankimg.spriteFrame = indexImg[rank]
        } else {
            this.rankimg.node.active = false;
            this.rankLabel.node.active = true;
            this.rankLabel.string = (rank + 1) + "";
        }
    },

});