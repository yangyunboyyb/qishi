
let Utils = require("Utils");
let CallBackHelp = require("CallBackHelp");
window.SystemInfo = {
    isLoaded: false,
    serverStringId: null,
    serverToken: null,
    storageVersion:1,
   

    startTime :0,//切后台的时间
    isSuccess:-1, //分享是否成功

    serverTime: 0,
    serverInterval: null,
    getServerTime:function(){
        return this.serverTime;
    },
    setServerTime:function(num){
        this.serverTime = num;
    },

    refreshServerTime:function(){
        console.log("更新时间");
        let self = this;
        let url = window.ServerFuncUrl.Base + window.ServerFuncUrl.ServerTime;
        var parmes = {};
        
        require("HttpHelp").httpPost(url,parmes,function(res){
            if(res && parseInt(res.time) > 0){
                self.serverTime = parseInt(res.time);
                CallBackHelp.callFunc(window.CallBackMsg.CheckNewDay, null);
            }
            else{
                self.refreshServerTime();
            }
        })

        if(!self.serverInterval){
            self.serverInterval = setInterval(function(){
                if(self.serverTime > 0){
                    self.serverTime += 500;
                }
            },500);
        }
    },

    setStorageVersion: function (num) {
        this.storageVersion += num;
        cc.sys.localStorage.setItem(window.StorageKey.StorageVersion,this.storageVersion);
    },

    setStartTime:function(){
        this.startTime = Date.now();
    },

    setEndTime :function(){
        if(window.curShareType == ""){
            return;
        }
        var end = Date.now();
        console.log('---sharetime-->',end - this.startTime);
        console.log('---sharetime-->',window.GameData.shareTime);
        let sharetime = parseInt(window.GameData.shareTime) * 1000;
        let json = window.GameData.shareChance;
        if(end - this.startTime < sharetime){
            this.isSuccess = 0;
        }else if(end - this.startTime >= sharetime){
            let chance = this.getChanceForCount(json);
            if(window.GameData.lastShareSuc == 0){
                chance = 100;
            }
            console.log("--window.GameData.lastShareSuc->",window.GameData.lastShareSuc);
            console.log("--chance->",chance);
            if(chance == 100){
                this.isSuccess = 1;
            }else if(chance == 0){
                this.isSuccess = 0;
            }else{
                var change = chance/100;
                var arr1 = [0 ,1];
                var arr2 = [1 - change , change];
                var random = Utils.randomDraw(arr1,arr2);
                this.isSuccess = random;
            }
            window.GameData.setLastShareSuc(this.isSuccess);
        }
    },

    getChanceForCount:function(json){
        if(window.curShareType == "StartTenBall"){
            window.curShareType = "";
            return 100;
        }else{
            window.curShareType = "";
            let count = window.GameData.shareCount;
            for(var i = 0; i < json.length; i++){
                if(count >= json[i]["count"]){
                    return json[i]["chance"]
                }
            }
            return 100;
        }
       
    },
};