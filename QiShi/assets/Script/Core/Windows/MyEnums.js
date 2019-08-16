window.CallBackMsg= {
    JsonConfigLoadProgress : "JsonConfigLoadProgress",
    ImageLoadProgress : "ImageLoadProgress",
    GetUserInfo : "GetUserInfo",

    CheckNewDay : "CheckNewDay",

    ChoseItemForSkin : "ChoseItemForSkin",
    ChangeUserBallId : "ChangeUserBallId",
    ChangeUserRoleId : "ChangeUserRoleId",
};
    
window.StorageKey = {
    StorageVersion : "StorageVersion",
    ServerStringId : "ServerStringId",
    GameData : "GameData",
    Md5UserInfo : "Md5UserInfo",
    IsEffect : "IsEffect",
    IsVibrate : "IsVibrate",
    
    ShareCount : "ShareCount",
};

window.PrefabType = {
    MessageBox :101,
    Rank :102,
    Setting :103,
    Skin :104,

};

window.MessageBoxStr = {
    BackStart :0,
    Sure :1,
    Cancel :2,
    ContinueGame:3,
    GameAgain:4
};

window.AudioName = {
    SFX_GAME_LOSE: "gameOver.mp3",
    BTN_CLICK: "btnclick.mp3",
    ENTER_LABBY: "enterLabby.mp3",
    SFX_GAME_WIN: "gameWin.mp3",
};


window.ServerFuncUrl = {
    // Base: "https://lgd.52guandan.com:32105/", //测试
    Base: "https://mini.51v.cn:32105/", //正式
    
    Oauth: "GameQiShi/LORAccount",
    SaveStorage: "GameQiShi/SaveData",
    ServerTime: "GameQiShi/GetSysTime", 
    GetStorage: "GameQiShi/ReadData",
    WorldTop: "GameQiShi/GetRankingList", 
    RankingUpdate: "GameQiShi/RankingUpdate", 
    ReadSetting: "GameQiShi/ReadSetting", 

    GetAccountInfo: "GameQiShi/GetAccountInfo",
    RecordUserBehavior: "GameQiShi/RecordUserBehavior", 
};

window.BannerVedioId = {
    startScene_banner: "adunit-2e325eac8faea99c",
    ruleScene_banner: "adunit-29357fe2239eb6b5",
    queenScene_banner: "adunit-cfe9876f923a34ca",
    horseScene_banner: "adunit-82f11f8d7921e8a3",

    resetBtn_vedio: "adunit-6b4a071bab4bd63e",
    regretBtn_vedio: "adunit-a25bd60a4792553b",
    tipBtn_vedio: "adunit-0b3d391a2a99262e",
    awardBtn_vedio: "adunit-07c7087c414aa876",
}

window.curShareType = "";

window.secretkey = "620r88jlL6482zNZ";
window.Platform  =  "wechat_mini";  //平台信息
window.app  =  "qishi";  //appname
window.RankName  =  "qishiWorldData";  
window.GameDataName  =  "GameData";  

window.SharePicUrl = "https://down.51v.cn/MiniGames/qishi/" //分享图片的url

// window.ConfigUrl = "https://down.51v.cn/MiniGames/qishi/test/" //测试配置表url
window.ConfigUrl = "https://down.51v.cn/MiniGames/qishi/formal/" //正式配置表url

// window.ResUrl = "https://down.51v.cn/MiniGames/qishi/test/res/" //测试图片资源url
window.ResUrl = "https://down.51v.cn/MiniGames/qishi/formal/res/" //正式图片资源url

window.gameversion = "2.0.2"

window.isLog = 1;  //保存数据中的日志

window.gameToLobby = false;  //是否是从游戏进入大厅
