let HttpHelp = require("HttpHelp")
let Utils = require("Utils");


module.exports = {
    //系统信息
    wxsys_info: null,
    //游戏圈
    GameClubBtn: null,
    //登陆按钮
    LoginBtn: null,


    initThis: function () {
        this.wxsys_info = window.wx.getSystemInfoSync();
        console.log("--wxsys_info--->", this.wxsys_info);
        this.getUserInfo();

    },

    wxLogin: function () {
        let self = this;
        wx.login({
            success: function (res) {
                if (res.code) {
                    WXData.code = res.code;
                    console.log(WXData);
                    self.serverLogin();
                    if (self.LoginBtn) {
                        self.LoginBtn.hide();
                    }
                } else {
                    self.getUserInfo();
                    if (self.LoginBtn) {
                        self.LoginBtn.show();
                    }
                    console.log('登录失败！' + res.errMsg)
                }
            }
        });
    },

    serverLogin: function () {
        let self = this;
        if (!WXData.userInfo.invite || WXData.userInfo.invite == "undefined" || WXData.userInfo.invite == "null") {
            WXData.userInfo.invite = 0;
        }

        let userinfo = Utils.btoaUserInfo(WXData.userInfo);
        let md5str = Utils.setUserDataToMd5(userinfo);
        var parmes = {};
        parmes = {
            code: WXData.code,
            info: WXData.userInfo,
            platform: window.Platform,
            app: window.app,
        };
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.Oauth;

        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
                window.SystemInfo.serverToken = res.token;
                window.ServerStorage.saveStart(res.userid);
            } else {
                if (self.LoginBtn) {
                    self.LoginBtn.show();
                } else {
                    self.showWxBtn();
                }
                self.showWXTips("登录", "登录失败，请重新尝试！");
            }
        })
    },

    aboutShare: function () {
        //右上角分享显示
        wx.showShareMenu({
            withShareTicket: true
        });

        var con = this.getShareCon();
        wx.onShareAppMessage(function () { //被动转发
            return {
                title: con[0],
                query: "serverStringId=" + window.SystemInfo.serverStringId,
                imageUrl: window.SharePicUrl + con[1],
            }
        });

        //更新转发属性
        wx.updateShareMenu({
            withShareTicket: true
        });

        var res = wx.getLaunchOptionsSync();
        this.saveInvite(res);

        wx.onShow(function (res) {
            this.saveInvite(res);
        }.bind(this));
    },

    saveInvite: function (res) {
        if (res.query) {
            WXData.userInfo.invite = res.query.serverStringId;
        }
    },

    //微信提示
    showWXTips: function (_title, _content) {
        window.wx.showModal({ title: _title, content: _content, showCancel: false });
    },

    //客服
    openCustomerServiceConversation: function () {
        window.wx.openCustomerServiceConversation({});
    },

    //反馈
    createFeedbackButton: function (btnNode) {
        if (this.btn) {
            this.btn.show();
            return this.btn;
        } else {
            let btnSize = cc.size(btnNode.width + 5, btnNode.height + 5);
            let frameSize = cc.view.getFrameSize();
            let winSize = cc.winSize;
            let left = (winSize.width * 0.5 + btnNode.x - btnSize.width * 0.5) / winSize.width * frameSize.width;
            let top = (winSize.height * 0.5 - btnNode.y - btnSize.height * 0.5) / winSize.height * frameSize.height;
            let width = btnSize.width / winSize.width * frameSize.width;
            let height = btnSize.height / winSize.height * frameSize.height;
            this.btn = wx.createFeedbackButton({
                type: 'text',
                text: '',
                style: {
                    left: left,
                    top: top,
                    width: width,
                    height: height,
                    lineHeight: 40,
                    backgroundColor: '',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });
            return this.btn;
        }
    },

    //分享不同群
    shareAppMessageDiffGroup: function (callFun) {
        this.shareGroup();
        callFun();
    },

    shareGroup: function (num) {
        if (num == undefined) {
            var con = this.getShareCon();
            window.wx.shareAppMessage({
                title: con[0],
                query: "serverStringId=" + window.SystemInfo.serverStringId,
                imageUrl: window.SharePicUrl + con[1],
            });
        }
        else {
            var con = [];
            if (num > 0)
                con[0] = "西天路上我顺利完成" + num.toString() + "关，有胆来战！";
            else if (num == 0)
                con[0] = "国象经典问题改编超益智小游戏，快来一起挑战吧！";
            else {
                num = -num;
                con[0] = "古老八皇后问题我顺利完成" + num.toString() + "种摆法，你会比我更厉害吗？"
            }
            var picture = ["shareCount/01.png", "shareCount/02.png", "shareCount/03.png"];
            var rand = Math.floor(Math.random() * 3);
            con[1] = picture[rand];
            window.wx.shareAppMessage({
                title: con[0],
                query: "serverStringId=" + window.SystemInfo.serverStringId,
                imageUrl: window.SharePicUrl + con[1],
            });
        }
    },

    getShareCon: function () {
        var conArr = [["敢问路在何方？路在脚下！", "shareCount/01.png"],
        ["白龙马蹄儿朝西，驮着唐三藏跟着仨徒弟！", "shareCount/02.png"],
        ["你挑着担我牵着马，迎来日初送走晚霞！", "shareCount/03.png"],
        ];
        var index = Utils.random(2, 0);
        return conArr[index];
    },

    //游戏圈
    GameClubHide: function () {
        this.GameClubBtn.hide();
    },
    GameClubShow: function () {
        this.GameClubBtn.show();
    },

    getUserInfo: function () {
        let self = this;
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        lang: "zh_CN",
                        success: function (res) {
                            console.log(res.userInfo)
                            WXData.userInfo = self.setUserInfo(res.userInfo);
                            self.wxLogin();
                        }
                    })
                }
                else {
                    console.log("未授权" + JSON.stringify(res));
                    self.showWxBtn();
                }
            }
        })
    },

    showWxBtn: function () {
        let self = this;
        let winSize = cc.director.getWinSize();
        self.LoginBtn = wx.createUserInfoButton({
            lang: "zh_CN",
            type: 'text',
            text: "",
            style: {
                left: 0,
                top: 0,
                width: winSize.width,
                height: winSize.height,
                lineHeight: self.wxsys_info.windowWidth * 0.1,
                backgroundColor: '',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: self.wxsys_info.windowWidth * 0.05,
                borderRadius: 4
            }
        })

        self.LoginBtn.onTap(function (res) {
            if (WXData.encryptedData != null) {
                return;
            }
            console.log(res)
            if (res.userInfo) {
                console.log(`授权成功！`);
                wx.showToast({ title: "授权成功" });
                WXData.encryptedData = res.encryptedData;
                WXData.iv = res.iv;
                WXData.rawData = res.rawData;
                WXData.signature = res.signature;
                WXData.userInfo = self.setUserInfo(res.userInfo);
                self.wxLogin();
            }
            else {
                console.log(`授权失败！`)
            }
        })
    },

    setUserInfo: function (userInfo) {
        let data = {};
        data.nickname = userInfo.nickName;
        data.gender = userInfo.gender;
        data.headimageurl = userInfo.avatarUrl;
        data.city = userInfo.city;
        data.province = userInfo.province;
        data.country = userInfo.country;
        data.invite = parseInt(WXData.userInfo.invite);
        return data;
    },

    createBanner: function (unitId) {
        let bannerAd = wx.createBannerAd({
            adUnitId: unitId,
            style: {
                left: (this.wxsys_info.windowWidth - 320) / 2,
                top: this.wxsys_info.windowHeight - this.wxsys_info.windowWidth / 320 * 96,
                width: 320,
                height: this.wxsys_info.windowWidth / 320 * 96,
            }
        });
        bannerAd.show()
            .then(() => console.log('banner 广告显示'))
            .catch(err => {
                console.log("--失败-->", err);
                return null;
            });
        bannerAd.onLoad(() => {
            console.log('banner 广告加载成功')
        });

        bannerAd.onError(err => {
            console.log("--失败-->", err);
            return null;
        });
        return bannerAd;
    },

    createVideo: function (unitId, success, fail, closeFun) {
        this.success = success;
        this.fail = fail;
        this.closeFun = closeFun;
        let videoAd = wx.createRewardedVideoAd({
            adUnitId: unitId
        });
        videoAd.load().then(() => videoAd.show()).catch(err => {
            console.log(err.errCode + err.errMsg);
        });
        videoAd.onError((err) => {
            console.log(err.errCode + err.errMsg);
            if (this.fail) {
                this.fail();
                this.fail = null;
            }
        });
        videoAd.onClose(res => {
            if (res && res.isEnded || res === undefined) {
                console.log('---正常播放结束-->');// 正常播放结束
                if (this.success) {
                    this.success();
                    this.success = null;
                }
            } else {
                console.log('---退出-->');// 播放中途退出
                if (this.closeFun) {
                    this.closeFun();
                    this.closeFun = null;
                }
            }
        });
    },
};