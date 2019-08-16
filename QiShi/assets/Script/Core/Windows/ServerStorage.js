let HttpHelp = require("HttpHelp");
let CallBackHelp = require("CallBackHelp");

window.ServerStorage = {
    localStorageVersion: cc.sys.localStorage.getItem(window.StorageKey.StorageVersion),
    localServerStringId: cc.sys.localStorage.getItem(window.StorageKey.ServerStringId),

    saveStart: function (serverStringId) {
        //检测数据保存的版本
        window.SystemInfo.serverStringId = serverStringId;
        cc.sys.localStorage.setItem(window.StorageKey.ServerStringId, serverStringId);
        this.getServerStorage();
    },

    //保存到服务器
    saveServerStorage: function () {
		console.log('保存服务器');
        window.SystemInfo.setStorageVersion(1);
        if( window.SystemInfo.serverStringId == null || window.SystemInfo.serverToken == null ){
            return;
        }
        
        let data = window.GameData.getStorage();
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.SaveStorage;
        let parmes = {
            userid: window.SystemInfo.serverStringId,
            token: window.SystemInfo.serverToken,
            key: window.GameDataName,
            value: data,
            islog: window.isLog,
        };
        HttpHelp.httpPost(url, parmes, function (res) {
            console.log(res);
        });
    },

    //获取服务器数据
    getServerStorage: function () {
        let self = this;
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.GetStorage;
        let parmes = {
            userid: window.SystemInfo.serverStringId,
            token: window.SystemInfo.serverToken,
            key: window.GameDataName
        };
        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
                if(self.localStorageVersion <= JSON.parse(res.data).storageVersion){
                    cc.sys.localStorage.setItem(window.StorageKey.GameData,res.data);
                }else{
                    self.saveServerStorage();
                }
            }else if(res.errcode == -202 || res.errcode == 202){
                self.saveServerStorage();
            }
            window.GameData.initStorage();
            self.rankingUpdate(window.GameData.curMaxLevel);
            CallBackHelp.callFunc(window.CallBackMsg.GetUserInfo, null);
        });
    },


    /**
     * 返回个人信息的md5是否改变
     * @param {} md5str 
     */
    getUserInfoDif: function (md5str) {
        let localMd5UserInfo = cc.sys.localStorage.getItem(window.StorageKey.Md5UserInfo);
        if (md5str == localMd5UserInfo) {
            return true;
        }
        cc.sys.localStorage.setItem(window.StorageKey.Md5UserInfo, md5str);
        return false;
    },

    /**
     * 上传个人战绩
     * @param {} rankvalue 
     */
    rankingUpdate: function (rankvalue) {
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.RankingUpdate;
        var parmes = {
            userid: window.SystemInfo.serverStringId,
            token: window.SystemInfo.serverToken,
            rankvalue: rankvalue,
            rankname: window.RankName,
            app: window.app,
            extravalue: "",

        };
        HttpHelp.httpPost(url, parmes, function (res) {
        });
    },

    /**
     * 读取线上配置
     */
    readSetting: function () {
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.ReadSetting;
        var parmes = {
            key: window.app,//TODO
            app: window.app,
            platform: window.Platform,
        };
        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
            }
        });
    },

    /**
     * 记录用户游戏行为
     */
    recordUserBehavior: function (Behavior) {
        var url = window.ServerFuncUrl.Base + window.ServerFuncUrl.RecordUserBehavior;
        var parmes = {
            userid: window.SystemInfo.serverStringId,
            behavior: Behavior,
        };
        HttpHelp.httpPost(url, parmes, function (res) {
            if (res && res.errcode == 0) {
                console.log(res);
            }
        });
    },
};