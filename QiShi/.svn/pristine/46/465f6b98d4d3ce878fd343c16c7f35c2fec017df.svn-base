let CallBackHelp = require("CallBackHelp");
let PanelManager = require("PanelManager");
let md5 = require("md5");

module.exports = {
    random:function(max,min){
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    showMessageBox(desc,leftFunc,rightFunc,closeFunc,leftCon,rightCon){ 
        let component = PanelManager.openPanel(window.PrefabType.MessageBox);
        component.setContent(desc);
        component.setBtnContent(leftCon,rightCon);
        component.setLeftCallFunc(leftFunc);
        component.setRightCallFunc(rightFunc);
        component.setCloseCallFunc(closeFunc);
        return component;
    },
    
    showMessageBoxNoClose(desc,leftFunc,rightFunc,closeFunc,leftCon,rightCon){
        var message = this.showMessageBox(desc,leftFunc,rightFunc,closeFunc,leftCon,rightCon);
        message.node.getChildByName("panelBg").getChildByName("btnclose").active = false;
        return message;
    },

    /**
     * 个人信息数据的加密
     * @param {} resdata 
     */
    setUserDataToMd5:function(resdata){
        var str = resdata.nickname + resdata.gender + resdata.city + resdata.headimageurl;
        return md5.md5(str);
    },

    /**
     * 接口信息的加密
     */
    paramsToMd5:function(url,param){
        var arr = url.split("/");
        var str = arr[arr.length - 1];
        str = str + JSON.stringify(param) + window.secretkey;
        return md5.md5(str);
    },

    //加密名字
    btoaUserInfo:function(userinfo){
        var str = md5.encode(userinfo.nickname);
        userinfo.nickname = str;
        return userinfo;
    },

    //解密名字
    atobUserInfo:function(nickname){
        var str = md5.decode(nickname);
        return str;
    },

    createImage:function(url,node){
        let self = this;
        if(url){
            cc.loader.load({
                url: url, type: 'png'
            }, (err, texture) => {
                if(!err && self){
                    let sp = node;
                    sp.spriteFrame = new cc.SpriteFrame(texture);
                    sp.type = cc.Sprite.Type.SIMPLE;
                    sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                }
            });
        }
    },

    /**
     * 概率计算
     */
    randomDraw: function (arr1, arr2) {
        var sum = 0,
            factor = 0,
            random = Math.random();

        for (var i = arr2.length - 1; i >= 0; i--) {
            sum += arr2[i]; // 统计概率总和
        };

        random *= sum; // 生成概率随机数

        for (var i = arr2.length - 1; i >= 0; i--) {
            factor += arr2[i];
            if (random <= factor) {
                return arr1[i];
            }
        }
        return null;
    },

    judgeTime:function(timestamp,curTime) {
        timestamp = parseInt(timestamp);
        if(!timestamp) return false;
        var date = new Date(timestamp *1000); 
        var curdate = new Date(curTime *1000);
        if((date.getFullYear() ==  curdate.getFullYear()) && (date.getMonth()+1 == curdate.getMonth()+1) && (date.getDate() == curdate.getDate())){
            return true;
        }
        return false;
    },

};