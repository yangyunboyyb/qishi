
//模态panel

let modalPanel = cc.Class({
    extends: cc.Component,

    properties: {
    },


    open(node) {
        if (node) {
            this.child = node;
            node.scale = 0.5;
            node.opacity = 70;
            let t = 0.15;
            node.runAction(
                cc.spawn(
                    cc.scaleTo(t, 1),
                    cc.fadeTo(t, 255),
                )
            );
        }
    },

    close() {
        this.child.runAction(
            cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.2, 0.5),
                    cc.fadeOut(0.15),
                ),
                cc.callFunc(function () {
                    this.node.destroy();
                }.bind(this)),
            )
        );
    },
});

