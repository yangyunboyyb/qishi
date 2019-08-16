let CallBackHelp = require("CallBackHelp");

window.GameData = {
    share: 0,            //邀请人数
    shareCount: 0,       //分享次数

    saveTime: 0,       //保存时间

    //配置表中的初始数据
    "showShare": false,
    "shareChance": [{ "count": 8, "chance": 50 }, { "count": 7, "chance": 60 }, { "count": 6, "chance": 70 }, { "count": 5, "chance": 80 }, { "count": 4, "chance": 90 }, { "count": 0, "chance": 100 }],
    "config": [0],         //暂时未用到
    "shareTime": 2,        //分享的时间

    lastShareSuc: 0,

    isEffect: 1,
    isVibrate: 1,

    isFirst: true,

    curMaxLevel: 1,
    goldCoin: 100,
    curLevel: 1,
    selStage: null,
    regretCnt: 80,
    resetCnt: 20,

    dataUpdated: false,

    queenCurLevel: 1,
    queenMaxLevel: 1,

    setLastShareSuc: function (num) {
        this.lastShareSuc = num;
    },

    setShare: function (num) {
        this.share = num;
        this.saveStorage();
    },

    setShareCount: function (num) {
        this.shareCount = num;
        cc.sys.localStorage.setItem(window.StorageKey.ShareCount, this.shareCount);
    },

    setIsFirstJudge: function (isFirst) {
        this.isFirst = isFirst;
        this.saveStorage();
    },

    setCurMaxLevel: function (num) {
        if (this.curMaxLevel < num) {
            this.curMaxLevel = num;
            window.ServerStorage.rankingUpdate(num);
            this.saveStorage();
        }
    },

    setGoldCoin: function (num) {
        if (this.goldCoin != num) {
            this.goldCoin = num;
            this.saveStorage();
        }
    },

    setCurLevel: function (num) {
        if (this.curLevel != num) {
            this.curLevel = num;
            this.saveStorage();
        }
    },

    setSelStage: function (num) {
        if (this.selStage != num) {
            this.selStage = num;
            this.saveStorage();
        }
    },

    setRegretCnt: function (num) {
        if (this.regretCnt != num) {
            this.regretCnt = num;
            this.saveStorage();
        }
    },

    setResetCnt: function (num) {
        if (this.resetCnt != num) {
            this.resetCnt = num;
            this.saveStorage();
        }
    },

    setQueenCurLevel: function (num) {
        if (this.queenCurLevel != num) {
            this.queenCurLevel = num;
            this.saveStorage();
        }
    },

    setQueenMaxLevel: function (num) {
        if (this.queenMaxLevel < num) {
            this.queenMaxLevel = num;
            this.saveStorage();
        }
    },

    getIsEffect: function () {
        var effect = cc.sys.localStorage.getItem(window.StorageKey.IsEffect);
        if (effect == "1" || effect == '0') {
            this.isEffect = effect;
            return this.isEffect;
        }
        return 1;
    },

    getIsVibrate: function () {
        var isVibrate = cc.sys.localStorage.getItem(window.StorageKey.IsVibrate);
        if (isVibrate == "1" || isVibrate == "0") {
            this.isVibrate = isVibrate;
            return this.isVibrate;
        }
        return 1;
    },

    setIsVibrate: function (num) {
        this.isVibrate = num;
        cc.sys.localStorage.setItem(window.StorageKey.IsVibrate, num);
    },

    setIsEffect: function (num) {
        this.isEffect = num;
        cc.sys.localStorage.setItem(window.StorageKey.IsEffect, num);
    },

    //读取本地数据到内存
    initStorage: function () {
        this.share = 0;
        this.saveTime = 0;
        this.isFirst = true;
        this.curMaxLevel = 1;
        this.goldCoin = 100;
        this.curLevel = 1;
        this.selStage = null;
        this.regretCnt = 80;
        this.resetCnt = 20;

        this.queenCurLevel = 1;
        this.queenMaxLevel = 1;

        let storage = cc.sys.localStorage.getItem(window.StorageKey.GameData);
        console.log(`storage: ${storage}`);
        if (storage) {
            let data = JSON.parse(storage);
            if (data.share != null)
                this.share = data.share;
            if (data.saveTime != null)
                this.saveTime = parseInt(data.saveTime);
            if (data.isFirst != null)
                this.isFirst = data.isFirst;
            if (data.curMaxLevel != null)
                this.curMaxLevel = data.curMaxLevel;
            if (data.goldCoin != null)
                this.goldCoin = data.goldCoin;
            if (data.curLevel != null)
                this.curLevel = data.curLevel;
            if (data.selStage != null)
                this.selStage = data.selStage;
            if (data.regretCnt != null)
                this.regretCnt = data.regretCnt;
            if (data.resetCnt != null)
                this.resetCnt = data.resetCnt;
            if (data.queenCurLevel != null)
                this.queenCurLevel = data.queenCurLevel;
            if (data.queenMaxLevel != null)
                this.queenMaxLevel = data.queenMaxLevel;
        }
        this.dataUpdated = true;
    },

    //获取内存数据
    getStorage: function () {
        let data = {};
        data.share = this.share;
        data.saveTime = this.saveTime.toString();
        data.isFirst = this.isFirst;
        data.curMaxLevel = this.curMaxLevel;
        data.goldCoin = this.goldCoin;
        data.curLevel = this.curLevel;
        data.selStage = this.selStage;
        data.regretCnt = this.regretCnt;
        data.resetCnt = this.resetCnt;

        data.queenCurLevel = this.queenCurLevel;
        data.queenMaxLevel = this.queenMaxLevel;

        data.storageVersion = window.SystemInfo.storageVersion;
        console.log('获取内存数据', data);
        return data;
    },

    //保存数据到本地
    saveStorage: function () {
        console.log('保存到本地')
        let data = this.getStorage();
        let storage = JSON.stringify(data);
        cc.sys.localStorage.setItem(window.StorageKey.GameData, storage);
        window.ServerStorage.saveServerStorage();
    },

};