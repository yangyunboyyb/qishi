let HttpHelp = require("HttpHelp");
let Utils = require("Utils");
let WXHelp = require("WXHelp");
let AudioHelp = require("AudioHelp");
cc.Class({
    extends: cc.Component,

    properties: {
        rankingView: cc.Sprite,//显示好友排行榜
        btnFriend: cc.Button,
        btnWorld: cc.Button,
        worldRankingView: cc.Node,
        rankScrollView: cc.ScrollView,
        scrollViewContent: cc.Node,
        gameOverRankForMe: cc.Node,
        loadingLabel: cc.Label,
        rankItemPrefab: cc.Prefab,

        indexImg: [cc.SpriteFrame],

        rankItem: 95,
        spawnCount: 0,
        totalCount: 0,
        spacing: 0,
    },

    onLoad: function () {
        let tiaozhanNode = this.node.getChildByName("panelBg").getChildByName("wenzi_faqitiaozhan");
        tiaozhanNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.75, 1.1, 1.1), cc.scaleTo(0.75, 1, 1))));
        tiaozhanNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == false)
                return;
            WXHelp.shareGroup(window.GameData.curMaxLevel);
        }, this);
    },

    start() {
        this.btnFriend.interactable = true;
        this.btnWorld.interactable = false;
        this.curBtn = this.btnWorld.node;
        this.initBtn(false, this.btnFriend.node);
        this.initBtn(true, this.btnWorld.node);
        this.showListContent();
    },

    initBtn: function (isSelect, btnnode) {
        if (isSelect) {
            btnnode.getChildByName("icon").color = cc.color(31, 104, 122);
        } else {
            btnnode.getChildByName("icon").color = cc.color(255, 255, 204);
        }
    },

    getWorldData: function () {
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.WorldTop;
        var parmes = {
            userid: window.SystemInfo.serverStringId,
            token: window.SystemInfo.serverToken,
            rankname: window.RankName,
            app: window.app,
            limit: 50
        };
        let self = this;
        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
                self.loadingLabel.node.active = false;
                self.data = res.data;
                self.initScrollView();
            } else {
                self.loadingLabel.string = "加载失败...";
                require("WXHelp").showWXTips("提示", "网络异常，请稍后重试！");
            }
        });
    },

    showListContent() {
        this.rankingView.node.active = false;
        this.worldRankingView.active = false;
        this.scrollViewContent.removeAllChildren();
        if (this.curBtn == this.btnFriend.node) {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                this.rankingView.node.active = true;
                this.tex = new cc.Texture2D();
                var openDataContext = wx.getOpenDataContext();
                this.sharedCanvas = openDataContext.canvas;
                this.sharedCanvas.width = 555;
                this.sharedCanvas.height = 800;
                wx.postMessage({
                    messageType: 2,
                    MAIN_MENU_NUM: "userGameRank",
                });
            }
        } else {
            this.worldRankingView.active = true;
            this.gameOverRankForMe.active = false;
            this.loadingLabel.node.active = true;
            this.loadingLabel.string = "加载中...";
            if (this.data) {
                this.loadingLabel.node.active = false;
                this.initScrollView();
            } else {
                this.getWorldData();
            }
        }
    },

    btnClosePanelClick: function () {
        AudioHelp.btnClickEffect();
        this.rankingView.node.enabled = false;
        this.scrollViewContent.removeAllChildren();
        this.node.destroy();
    },

    btnTopTypeClick: function (event) {
        if (event.currentTarget == this.curBtn) return;
        this.updateCurBtn(event.currentTarget);
        this.showListContent();
    },

    updateCurBtn: function (btn) {
        this.curBtn.getComponent(cc.Button).interactable = true;
        btn.getComponent(cc.Button).interactable = false;
        this.initBtn(true, btn);
        this.initBtn(false, this.curBtn);
        this.curBtn = btn;
    },


    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (this.sharedCanvas != undefined) {
            this.tex.initWithElement(this.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.rankingView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    },

    initScrollView: function () {
        this.totalCount = this.data.length;
        if (this.totalCount >= 7) {
            this.spawnCount = 7;
        } else {
            this.spawnCount = this.totalCount;
        }
        this.content = this.scrollViewContent;
        this.content.removeAllChildren();
        this.items = []; // 存储实际创建的项数组
        this.initialize();
        this.showMeRank();
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        // 使用这个变量来判断滚动操作是向上还是向下
        this.lastContentPosY = 0;
        // 设定缓冲矩形的大小为实际创建项的高度累加，当某项超出缓冲矩形时，则更新该项的显示内容
        this.bufferZone = this.spawnCount * (this.rankItem + this.spacing) / 2;
    },

    setNodeFotData: function (node, data) {
        var url = data.headimageurl;
        Utils.createImage(url, node.getChildByName("headSpr").getComponent(cc.Sprite));
        node.getChildByName("labelname").getComponent(cc.Label).string = Utils.atobUserInfo(data.nickname);
        node.getChildByName("label").getComponent(cc.Label).string = "第" + data.rankvalue + "关";

        let imgrank = node.getChildByName("imgrank").getComponent(cc.Sprite);
        let labelrank = node.getChildByName("labelrank").getComponent(cc.Label);
        if (data.ranknum < 4) {
            labelrank.node.active = false;
            imgrank.node.active = true;
            imgrank.spriteFrame = this.indexImg[(data.ranknum) - 1]
        } else {
            imgrank.node.active = false;
            labelrank.node.active = true;
            labelrank.string = data.ranknum;
        }
    },

    showMeRank: function () {
        this.gameOverRankForMe.active = true;
        let isMe = false;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].userid == window.SystemInfo.serverStringId) {
                isMe = true;
                this.setNodeFotData(this.gameOverRankForMe, this.data[i]);
            }
        }
        if (!isMe) {
            let data = WXData.userInfo;
            var url = data.headimageurl;
            Utils.createImage(url, this.gameOverRankForMe.getChildByName("headSpr").getComponent(cc.Sprite));
            this.gameOverRankForMe.getChildByName("labelname").getComponent(cc.Label).string = Utils.atobUserInfo(data.nickname);
            this.gameOverRankForMe.getChildByName("label").getComponent(cc.Label).string = "第" + window.GameData.curMaxLevel + "关";
            this.gameOverRankForMe.getChildByName("labelrank").getComponent(cc.Label).string = "50+";
            this.gameOverRankForMe.getChildByName("imgrank").active = false;
        }
    },

    // 列表初始化
    initialize: function () {
        // 获取整个列表的高度
        this.scrollViewContent.height = this.data.length * this.rankItem;
        var worlddata = this.data;
        for (let i = 0; i < this.spawnCount; ++i) {
            var playerInfo = worlddata[i];
            var component = cc.instantiate(this.rankItemPrefab);
            component.position = cc.v2(0, - (component.height + 10) * (0.5 + i));   //- this.spacing * (i + 1)
            component.getComponent("RankItem").init(playerInfo, i, this.indexImg);
            this.items.push(component);
            this.scrollViewContent.addChild(component);
        }
    },

    // 返回item在ScrollView空间的坐标值
    getPositionInView: function (item) {
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.rankScrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    update(dt) {
        if (this.curBtn == this.btnFriend.node) {
            this._updateSubDomainCanvas();
        }
        if (this.scrollViewContent.childrenCount > 0) {
            this.updateTimer += dt;
            if (this.updateTimer < this.updateInterval) {
                return; // we don't need to do the math every frame
            }
            this.updateTimer = 0;
            let items = this.items;
            // 如果当前content的y坐标小于上次记录值，则代表往下滚动，否则往上。
            let isDown = this.rankScrollView.content.y < this.lastContentPosY;
            // 实际创建项占了多高（即它们的高度累加）
            let offset = this.rankItem * items.length;
            let newY = 0;

            // 遍历数组，更新item的位置和显示
            for (let i = 0; i < items.length; ++i) {
                let viewPos = this.getPositionInView(items[i]);
                if (isDown) {
                    // 提前计算出该item的新的y坐标
                    newY = items[i].y + offset;
                    // 如果往下滚动时item已经超出缓冲矩形，且newY未超出content上边界，
                    // 则更新item的坐标（即上移了一个offset的位置），同时更新item的显示内容
                    if (viewPos.y < -this.bufferZone && newY < 0) {
                        items[i].y = (newY);
                        let item = items[i].getComponent('RankItem');
                        let itemId = item.itemID - items.length; // update item id
                        item.init(this.data[itemId], itemId, this.indexImg);
                    }
                } else {
                    // 提前计算出该item的新的y坐标
                    newY = items[i].y - offset;
                    // 如果往上滚动时item已经超出缓冲矩形，且newY未超出content下边界，
                    // 则更新item的坐标（即下移了一个offset的位置），同时更新item的显示内容
                    if (viewPos.y > this.bufferZone && newY > -this.scrollViewContent.height) {
                        items[i].y = (newY);
                        let item = items[i].getComponent('RankItem');
                        let itemId = item.itemID + items.length;
                        item.init(this.data[itemId], itemId, this.indexImg);
                    }
                }
            }
            // 更新lastContentPosY和总项数显示
            this.lastContentPosY = this.scrollViewContent.y;
        }
    },
});