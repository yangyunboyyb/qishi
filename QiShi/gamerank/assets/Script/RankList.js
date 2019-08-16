let Utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {
        rankItemNode: cc.Node,
        scrollView: cc.ScrollView,
        labelLoading: cc.Label,
        rankItemPre: cc.Prefab,
        indexImg: [cc.SpriteFrame],

        gameOver: cc.Node,
        friendNode: cc.Node,
    },

    start() {
        wx.onMessage(data => {
            if (data.messageType == 2) {
                this.gameOver.active = false;
                this.friendNode.active = true;
                this.fetchFriendData(data.MAIN_MENU_NUM);
            } else if(data.messageType == 1){
                this.gameOver.active = true;
                this.friendNode.active = false;
                this.gameOverData(data);
            }
        });
    },

    removeChild: function () {
        this.scrollView.content.removeAllChildren();
        this.rankItemNode.active = false;
        this.labelLoading.node.active = true;
        this.labelLoading.string = "加载中...";
    },

    fetchFriendData: function (MAIN_MENU_NUM) {
        this.removeChild();
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (userRes) => {
                this.labelLoading.node.active = false;
                let userdata = userRes.data[0];
                wx.getFriendCloudStorage({
                    keyList: [MAIN_MENU_NUM],
                    success: (res) => {
                        this.labelLoading.node.active = false;
                        console.log("-------success getFriendCloudStorage----->", res);
                        let data = res.data;
                        data.sort((a, b) => {
                            if (!a) {
                                return 1;
                            }
                            if (!b) {
                                return -1;
                            }
                            if (!a.KVDataList) {
                                return 1;
                            }
                            if (!b.KVDataList) {
                                return -1;
                            }
                            if (a.KVDataList.length == 0) {
                                return 1;
                            }
                            if (b.KVDataList.length == 0) {
                                return -1;
                            }
                            if (a.KVDataList.length == 0 || b.KVDataList.length == 0) {
                                return 0;
                            }

                            return b.KVDataList[0].value - a.KVDataList[0].value;
                        });
                        let index_ = 0;
                        for (let i in data) {
                            var playerInfo = data[i];
                            if (!playerInfo) {
                                continue;
                            }
                            if (playerInfo.KVDataList.length == 0) {
                                continue;
                            }
                            if (userdata.avatarUrl == playerInfo.avatarUrl) {
                                this.showMeRank(playerInfo, index_);
                            }
                            var item = cc.instantiate(this.rankItemPre);
                            item.getComponent('RankItem').init(index_, playerInfo, this.indexImg);
                            this.scrollView.content.addChild(item);

                            index_++;
                        }
                    },
                    fail: (res) => {
                        this.labelLoading.active = true;
                        this.labelLoading.string = "加载失败...";
                    },
                });
            },
            fail: (res) => {
                this.labelLoading.active = true;
                this.labelLoading.string = "加载失败...";
            },
        });
    },

    showMeRank: function (data, index) {
        this.rankItemNode.active = true;
        var labelName = this.rankItemNode.getChildByName("nickname").getComponent(cc.Label);
        var labelRank = this.rankItemNode.getChildByName("ranklabel").getComponent(cc.Label);
        var imgrank = this.rankItemNode.getChildByName("imgrank").getComponent(cc.Sprite);
        var labelmoney = this.rankItemNode.getChildByName("labelscore").getComponent(cc.Label);

        labelName.string = data.nickname;
        var imgheadurl = data.avatarUrl;
        Utils.createImage(imgheadurl, this.rankItemNode.getChildByName("headspr").getComponent(cc.Sprite));

        let grade = "0";
        if (data.KVDataList && JSON.stringify(data.KVDataList) != '{}') {
            grade = data.KVDataList[0].value;
        }
        labelmoney.string = "第" + grade + "关";

        if (index < 3) {
            labelRank.node.active = false;
            imgrank.node.active = true;
            imgrank.spriteFrame = this.indexImg[index]
        } else {
            imgrank.node.active = false;
            labelRank.node.active = true;
            labelRank.string = index + 1;
        }
    },

    //游戏结束
    gameOverData: function (msg) {  //curScore
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (userRes) => {
                this.gameOver.active = true;
                let userdata = userRes.data[0];
                wx.getFriendCloudStorage({
                    keyList: [msg.MAIN_MENU_NUM],
                    success: (res) => {
                        this.gameOver.active = true;
                        console.log("-------success getFriendCloudStorage----->", res);
                        let data = res.data;
                        for (let i in data) {
                            if (userdata.avatarUrl ==  data[i].avatarUrl) {
                                data[i].KVDataList[0].value = msg.curScore;
                            }
                        }
                        data.sort((a, b) => {
                            if (!a) {
                                return 1;
                            }
                            if (!b) {
                                return -1;
                            }
                            if (!a.KVDataList) {
                                return 1;
                            }
                            if (!b.KVDataList) {
                                return -1;
                            }
                            if (a.KVDataList.length == 0) {
                                return 1;
                            }
                            if (b.KVDataList.length == 0) {
                                return -1;
                            }
                            if (a.KVDataList.length == 0 || b.KVDataList.length == 0) {
                                return 0;
                            }
                            return b.KVDataList[0].value - a.KVDataList[0].value;
                        });
                        let index_ = 0;
                        for (let i in data) {
                            if (userdata.avatarUrl ==  data[i].avatarUrl) {
                                break;
                            }
                            index_ ++;
                        }
                       
                        this.showOtherScore(this.gameOver.getChildByName("smallnode"),data[index_+1]);
                        this.showOtherScore(this.gameOver.getChildByName("bignode"),data[index_-1]);
                    },
                    fail: (res) => {
                        this.gameOver.active = false;
                    },
                });
            },
            fail: (res) => {
                this.gameOver.active = false;
            },
        });
    },

    showOtherScore:function(node,data){
        if(data){
            var imgheadurl = data.avatarUrl;
            var head = node.getChildByName("userhead").getChildByName("mask").getChildByName("headspr").getComponent(cc.Sprite);
            Utils.createImage(imgheadurl, head);
            var label = node.getChildByName("labelscore").getComponent(cc.Label);
            let grade = "0";
            if (data.KVDataList && JSON.stringify(data.KVDataList) != '{}') {
                grade = data.KVDataList[0].value;
            }
            label.string = grade;
        }else{
            node.active = false;
        }
    },
});
