module.exports = {
    playEffect: function (audiosPath,num) {
        if(window.GameData.getIsEffect() == 0 || window.GameData.getIsEffect() == "0"){
            return;
        }
        cc.audioEngine.play(cc.url.raw("resources/Audio/"+audiosPath), false, num);
    },

    //短震动
    vibrateShort:function(){
        if(window.GameData.getIsVibrate() == 0 || window.GameData.getIsVibrate() == "0"){
            return;
        }
        wx.vibrateShort();
    },

    //长震动
    vibrateLong:function(){
        if(window.GameData.getIsVibrate() == 0 || window.GameData.getIsVibrate() == "0"){
            return;
        }
        wx.vibrateLong();
    },

    btnClickEffect:function(){
        this.playEffect(window.AudioName.BTN_CLICK,0.7);
    },

    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },

    resumeAll:function(){
        cc.audioEngine.resumeAll();
    },

    stopAll:function(){
        cc.audioEngine.stopAll();
        cc.isMusicPlaying = false;
    },
};