module.exports = {
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
}