let Utils = require("Utils");
let PanelManager = require("PanelManager");
let AudioHelp = require("AudioHelp");
let WXHelp = require("WXHelp");
let CallBackHelp = require("CallBackHelp");
let JsonConfig = require("JsonConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        linePrefab: cc.Prefab,
        horsePrefab: cc.Prefab,
        stepPrefab: cc.Prefab,
        obstaclePrefab: cc.Prefab,
        handPrefab: cc.Prefab,

        overLabel: cc.Label,
        curLocationLabel: cc.Label,

        returnBtn: cc.Node,
        backBtn: cc.Node,
        tipBtn: cc.Node,
        regretBtn: cc.Node,
        resetBtn: cc.Node,
        nextBtn: cc.Node,
        shareBtn: cc.Node,
        awardBtn: cc.Node,
        moreBtn: cc.Node,
        goldCoin: cc.Node,
        stageImg: cc.Node,
        levelImg: cc.Node,
        percentOne: cc.Node,
        percentTwo: cc.Node,

        stageSpriteFrame: [cc.SpriteFrame],
        numberSpriteFrame: [cc.SpriteFrame],

        progressOne: cc.ProgressBar,
        progressTwo: cc.ProgressBar,
    },

    onLoad: function () {
        this.regretCnt = window.GameData.regretCnt;
        this.resetCnt = window.GameData.resetCnt;
        if (this.regretCnt > 0)
            this.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + this.regretCnt.toString() + " 次";
        else
            this.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "点击+" + Global.regretCnt.toString() + "次";
        if (this.resetCnt > 0)
            this.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + this.resetCnt.toString() + " 次";
        else
            this.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "点击+" + Global.resetCnt.toString() + "次";

        this.initCall();
        this.onResize(); //屏幕适配
        this.initHorse();
        this.initStep();
        this.initLine();
        this.initObstacle();
        this.initGoldCoin();

        this.reset();
        this.gameBtnListen();

        if (this.levelIndex == 0)
            this.handTeach();
        else {
            if (window.GameData.showShare == true) {
                this.createBanner();
            }
        }
    },

    createBanner: function () {
        this.banner = WXHelp.createBanner(window.BannerVedioId.horseScene_banner);
    },

    handTeach: function () {
        let node = cc.instantiate(this.handPrefab);
        node.parent = this.node;
        let hand = node.getChildByName("hand");
        let pos = {};
        for (var h of this.horseList) {
            if (h.opacity < 255) {
                pos = h.position;
                break;
            }
        }
        let posX = pos.x;
        let posY = pos.y - this.horseList[0].height / 2;
        hand.runAction(cc.spawn(cc.scaleTo(0.75, 0.75, 0.75), cc.moveTo(0.75, posX, posY)));

        let self = this;
        setTimeout(() => {
            hand.getChildByName("dian").active = true;
            node.getChildByName("shuoming").getComponent(cc.Label).string = "点击透明棋子至下一步!\n\n（下一步有时不唯一）"
        }, 750);

        setTimeout(() => {
            node.destroy();
            if (window.GameData.showShare == true)
                self.createBanner();
        }, 3000);
    },

    initCall: function () {
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("游戏进入后台");
            window.SystemInfo.setStartTime();
            window.GameData.saveStorage();
            window.SystemInfo.setServerTime(0);
        }, this);
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("重新返回游戏");
            window.SystemInfo.setEndTime();
            window.SystemInfo.refreshServerTime();
        }, this);
    },

    onResize: function () {
        let frameSize = cc.view.getFrameSize();
        let Height = window.wx.getSystemInfoSync().pixelRatio * frameSize.height; //分辨率
        let DeviceHeight = window.wx.getSystemInfoSync().devicePixelRatio * frameSize.height; //硬件分辨率
        if (Height == DeviceHeight) {
            let H = frameSize.height * (760 / frameSize.width);
            let sScale = 1280 / H;
            this.node.setScale(sScale);
        }
    },

    gameBtnListen: function () {
        let self = this;
        this.returnBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.banner)
                self.banner.destroy();
            AudioHelp.btnClickEffect();
            cc.director.loadScene("level_small");
        }, this);

        this.backBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.levelIndex <= 0 || self.gameResult == true) //levelIndex是从0开始的，对应第1关
                return;
            AudioHelp.btnClickEffect();
            self.stepCnt = null;
            self.levelIndex--;
            self.clearAll();
            self.reset();
        }, this);

        if (this.answerBtn != null) {
            this.answerBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                let cost = Global.levelData[self.levelIndex].tipCost;
                if (self.coinCount < cost || self.gameResult != null)
                    return;
                AudioHelp.btnClickEffect();
                self.costCoin(cost);
                self.clearAll();
                self.reset();
                self.showCorrectPath();
            }, this);
        }

        this.tipBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            let cost = Global.levelData[self.levelIndex].tipCost;
            if (self.coinCount < cost || self.gameResult != null)
                return;
            if (self.stepCnt != null) {
                if (1 + self.stepCnt + Global.tipStepCnt >= Global.levelData[self.levelIndex].answer.length)
                    return;
            }
            AudioHelp.btnClickEffect();
            self.costCoin(cost);
            self.clearAll();
            self.reset();
            if (self.stepCnt == null) {
                self.stepCnt = Global.tipStepCnt;
            }
            else {
                self.stepCnt += Global.tipStepCnt;
            }
            self.showNextPath();
        }, this);

        this.regretBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if ((self.power <= 1 && self.regretCnt > 0) || self.gameResult != null)
                return;
            AudioHelp.btnClickEffect();
            if (self.regretCnt <= 0) {
                if (window.GameData.showShare == true) {
                    WXHelp.createVideo(window.BannerVedioId.regretBtn_vedio, function () {
                        self.regretCnt = Global.regretCnt;
                        window.GameData.setRegretCnt(self.regretCnt);
                        self.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.regretCnt.toString() + " 次";
                    }, function () {
                        self.shareFunc(function () {
                            self.regretCnt = Global.regretCnt;
                            window.GameData.setRegretCnt(self.regretCnt);
                            self.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.regretCnt.toString() + " 次";
                        });
                    }, function () {
                    });
                }
                else {
                    self.regretCnt = Global.regretCnt;
                    window.GameData.setRegretCnt(self.regretCnt);
                    self.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.regretCnt.toString() + " 次";
                }
                return;
            }
            else {
                self.regretCnt--;
                window.GameData.setRegretCnt(self.regretCnt);
                if (self.regretCnt > 0)
                    self.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.regretCnt.toString() + " 次";
                else
                    self.regretBtn.getChildByName("Label").getComponent(cc.Label).string = "点击+" + Global.regretCnt.toString() + "次";
            }
            let i = -1;
            let j = -1;
            let width = this.node.width - Global.gap;
            let height = this.node.height - Global.gap;
            for (var h of self.horseList) {
                if (h.name == self.power.toString()) {
                    i = (h.y + width / 2 - width / (2 * self.chessWidth)) / (width / self.chessWidth);
                    j = (h.x + height / 2 - height / (2 * self.chessHeight)) / (height / self.chessHeight);
                    i = Math.round(i);
                    j = Math.round(j);
                    self.chess[i][j] = 0;
                    break;
                }
            }
            for (var s of self.stepList) {
                if (s.name == (self.power - 1).toString()) {
                    i = (s.y + width / 2 - width / (2 * self.chessWidth)) / (width / self.chessWidth);
                    j = (s.x + height / 2 - height / (2 * self.chessHeight)) / (height / self.chessHeight);
                    i = Math.round(i);
                    j = Math.round(j);
                    self.stepPool.put(s);
                    self.power--;
                    self.preRow = null;
                    self.preCol = null;
                    break;
                }
            }
            self.resetHorse(i, j);
        }, this);

        this.resetBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.gameResult == true || (self.power <= 1 && self.resetCnt > 0))
                return;
            AudioHelp.btnClickEffect();
            if (self.resetCnt <= 0) {
                if (window.GameData.showShare == true) {
                    WXHelp.createVideo(window.BannerVedioId.resetBtn_vedio, function () {
                        self.resetCnt = Global.resetCnt;
                        window.GameData.setResetCnt(self.resetCnt);
                        self.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.resetCnt.toString() + " 次";
                    }, function () {
                        self.shareFunc(function () {
                            self.resetCnt = Global.resetCnt;
                            window.GameData.setResetCnt(self.resetCnt);
                            self.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.resetCnt.toString() + " 次";
                        });
                    }, function () {
                    });
                }
                else {
                    self.resetCnt = Global.resetCnt;
                    window.GameData.setResetCnt(self.resetCnt);
                    self.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.resetCnt.toString() + " 次";
                }
                return;
            }
            else {
                self.resetCnt--;
                window.GameData.setResetCnt(self.resetCnt);
                if (self.resetCnt > 0)
                    self.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "×" + self.resetCnt.toString() + " 次";
                else
                    self.resetBtn.getChildByName("Label").getComponent(cc.Label).string = "点击+" + Global.resetCnt.toString() + "次";
            }
            self.stepCnt = null;
            self.clearAll();
            self.reset();
        }, this);

        if (this.coinBtn != null) {
            this.coinBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                AudioHelp.btnClickEffect();
                if (window.GameData.showShare == true) {
                    self.shareFunc(function () {
                        self.getAward(Global.coinAward);
                    });
                }
                else {
                    self.getAward(Global.coinAward);
                }
            }, this);
        }

        this.nextBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.levelIndex + 1 >= window.GameData.curMaxLevel || self.gameResult == true)
                return;
            AudioHelp.btnClickEffect();
            self.stepCnt = null;
            self.levelIndex++;
            self.clearAll();
            self.reset();
        }, this);

        this.shareBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == true) {
                self.shareFunc(function () {
                    self.getAward(Global.levelData[self.levelIndex].award * Global.multiCoin);
                    self.levelIndex++;
                    if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                        window.GameData.setCurMaxLevel(self.levelIndex + 1)
                    self.reset();
                });
            }
            else {
                self.getAward(Global.levelData[self.levelIndex].award * Global.multiCoin);
                self.levelIndex++;
                if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                    window.GameData.setCurMaxLevel(self.levelIndex + 1)
                self.reset();
            }
        }, this);

        this.awardBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            self.getAward(Global.levelData[self.levelIndex].award);
            self.levelIndex++;
            if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                window.GameData.setCurMaxLevel(self.levelIndex + 1)
            self.reset();
        }, this);

        this.moreBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == true) {
                WXHelp.createVideo(window.BannerVedioId.awardBtn_vedio, function () {
                    self.getAward(Global.levelData[self.levelIndex].award * Global.coinMulti);
                    self.levelIndex++;
                    if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                        window.GameData.setCurMaxLevel(self.levelIndex + 1)
                    self.reset();
                }, function () {
                    self.shareFunc(function () {
                        self.getAward(Global.levelData[self.levelIndex].award * Global.coinMulti);
                        self.levelIndex++;
                        if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                            window.GameData.setCurMaxLevel(self.levelIndex + 1)
                        self.reset();
                    });
                }, function () {
                });
            }
            else {
                self.getAward(Global.levelData[self.levelIndex].award * Global.coinMulti);
                self.levelIndex++;
                if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                    window.GameData.setCurMaxLevel(self.levelIndex + 1)
                self.reset();
            }
        }, this);

        this.node.getChildByName("wenzi_xuanyaoyixia").on(cc.Node.EventType.TOUCH_END, function (event) {
            AudioHelp.btnClickEffect();
            if (window.GameData.showShare == false)
                return;
            if (window.GameData.curLevel > window.GameData.curMaxLevel)
                WXHelp.shareGroup(window.GameData.curLevel);
            else
                WXHelp.shareGroup(window.GameData.curMaxLevel);
        }, this);

        if (this.ignoreBtn != null) {
            this.ignoreBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
                AudioHelp.btnClickEffect();
                self.levelIndex++;
                if (self.levelIndex + 1 > window.GameData.curMaxLevel)
                    window.GameData.setCurMaxLevel(self.levelIndex + 1)
                self.reset();
            }, this);
        }
    },

    getAward: function (award) {
        this.coinCount += award;
        window.GameData.setGoldCoin(this.coinCount);
        let coinLabel = this.goldCoin.getChildByName("New Label");
        coinLabel.getComponent(cc.Label).string = this.coinCount.toString();
    },

    costCoin: function (cost) {
        this.coinCount -= cost;
        window.GameData.setGoldCoin(this.coinCount);
        let coinLabel = this.goldCoin.getChildByName("New Label");
        coinLabel.getComponent(cc.Label).string = this.coinCount.toString();
    },

    showNextPath: function () {
        for (var i = 1; i < Global.levelData[this.levelIndex].answer.length; i++) {
            if (i > this.stepCnt)
                break;
            let answer = Global.levelData[this.levelIndex].answer[i];
            let x = parseInt(answer / this.chessWidth);
            let y = answer % this.chessWidth;
            this.showStep(x, y, i + 1);
            if (i <= this.stepCnt - Global.tipStepCnt) {
                this.power++;
                this.resetHorse(x, y);
            }
        }
    },

    showCorrectPath: function () {
        for (var i = 0; i < Global.levelData[this.levelIndex].answer.length; i++) {
            let answer = Global.levelData[this.levelIndex].answer[i];
            let x = parseInt(answer / this.chessWidth);
            let y = answer % this.chessWidth;
            this.showStep(x, y, i + 1);
        }
    },

    initHorse: function () {
        this.horsePool = new cc.NodePool();
        let initCount = 10;
        for (let i = 0; i < initCount; i++) {
            let horse = cc.instantiate(this.horsePrefab); // 创建节点
            this.horsePool.put(horse); // 通过 put 接口放入对象池
        }
        this.horseList = [];
    },

    initStep: function () {
        this.stepPool = new cc.NodePool();
        let initCount = 64;
        for (let i = 0; i < initCount; i++) {
            let step = cc.instantiate(this.stepPrefab); // 创建节点
            this.stepPool.put(step); // 通过 put 接口放入对象池
        }
        this.stepList = [];
    },

    initLine: function () {
        this.linePool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let line = cc.instantiate(this.linePrefab); // 创建节点
            this.linePool.put(line); // 通过 put 接口放入对象池
        }
        this.lineList = [];
    },

    initObstacle: function () {
        this.obstaclePool = new cc.NodePool();
        let initCount = 20;
        for (let i = 0; i < initCount; i++) {
            let obstacle = cc.instantiate(this.obstaclePrefab); // 创建节点
            this.obstaclePool.put(obstacle); // 通过 put 接口放入对象池
        }
        this.obstacleList = [];
    },

    initGoldCoin: function () {
        if (this.coinCount == null) {
            this.coinCount = window.GameData.goldCoin;
        }
        this.goldCoin.getChildByName("New Label").getComponent(cc.Label).string = this.coinCount.toString();
    },

    reset: function () {
        this.initDifficulty();
        this.initChess();
        this.power = 1;
        this.gameResult = null;
        this.drawLines();

        this.preRow = Global.startX;
        this.preCol = Global.startY;
        this.setHorse(this.preRow, this.preCol);

        this.overLabel.node.active = false;
        this.shareBtn.active = false;
        this.awardBtn.active = false;
        this.moreBtn.active = false;
        let xuanyaoNode = this.node.getChildByName("wenzi_xuanyaoyixia");
        xuanyaoNode.stopAllActions();
        xuanyaoNode.active = false;
    },

    initDifficulty: function () {
        if (this.levelIndex == null)
            this.levelIndex = window.GameData.curLevel - 1;
        var curLevel = this.levelIndex + 1;
        window.GameData.setCurLevel(curLevel);
        this.tipBtn.getChildByName("Label").getComponent(cc.Label).string = "-" + Global.levelData[this.levelIndex].tipCost + " 金币";
        this.levelProgress();
        this.chessWidth = Global.levelData[this.levelIndex].width;
        this.chessHeight = Global.levelData[this.levelIndex].height;
    },

    initChess: function () {
        this.chess = [];
        for (var i = 0; i < this.chessWidth; i++) {
            this.chess[i] = [];
            for (var j = 0; j < this.chessHeight; j++) {
                this.chess[i][j] = 0;
            }
        }
        for (var d of Global.levelData[this.levelIndex].difficulty) {
            let x = parseInt(d / this.chessWidth);
            let y = d % this.chessWidth;
            this.chess[x][y] = 9999;
            this.getObstacle(x, y);
        }
    },

    start() {
    },

    drawLines: function () {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < this.chessWidth + 1; j++) {
                this.drawLine(i, j);
            }
        }
    },

    drawLine: function (i, j) {
        let line = null;
        if (this.linePool.size() > 0) {
            line = this.linePool.get();
        } else {
            line = cc.instantiate(this.linePrefab);
        }
        line.parent = this.node;
        line.getComponent("line").init(this, i, j);
        this.lineList.push(line);
    },

    setHorse: function (i, j) {
        this.curLocationLabel.string = this.power.toString();
        var horse = this.getHorse();
        horse.name = this.power.toString();
        this.chess[i][j] = this.power;
        horse.getComponent("horse").init(this, i, j, 255);
        this.findPath(i, j);
    },

    getHorse: function (i) {
        let horse = null;
        if (this.horsePool.size() > 0) {
            horse = this.horsePool.get();
        } else {
            horse = cc.instantiate(this.horsePrefab);
        }
        horse.parent = this.node;
        this.horseList.push(horse);
        return horse;
    },

    getObstacle: function (i, j) {
        let obstacle = null;
        if (this.obstaclePool.size() > 0) {
            obstacle = this.obstaclePool.get();
        } else {
            obstacle = cc.instantiate(this.obstaclePrefab);
        }
        obstacle.parent = this.node;
        obstacle.getComponent("obstacle").init(this, i, j);
        this.obstacleList.push(obstacle);
    },

    findPath: function (i, j) {
        var gameOver = true;
        let self = this;
        if (i + 2 <= this.chessWidth - 1 && j + 1 <= this.chessHeight - 1 && this.chess[i + 2][j + 1] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i + 2, j + 1, 100);
        }

        if (i + 2 <= this.chessWidth - 1 && j - 1 >= 0 && this.chess[i + 2][j - 1] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i + 2, j - 1, 100);
        }

        if (i + 1 <= this.chessWidth - 1 && j + 2 <= this.chessHeight - 1 && this.chess[i + 1][j + 2] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i + 1, j + 2, 100);
        }

        if (i + 1 <= this.chessWidth - 1 && j - 2 >= 0 && this.chess[i + 1][j - 2] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i + 1, j - 2, 100);
        }

        if (i - 2 >= 0 && j + 1 <= this.chessHeight - 1 && this.chess[i - 2][j + 1] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i - 2, j + 1, 100);
        }

        if (i - 2 >= 0 && j - 1 >= 0 && this.chess[i - 2][j - 1] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i - 2, j - 1, 100);
        }

        if (i - 1 >= 0 && j + 2 <= this.chessHeight - 1 && this.chess[i - 1][j + 2] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i - 1, j + 2, 100);
        }

        if (i - 1 >= 0 && j - 2 >= 0 && this.chess[i - 1][j - 2] == 0) {
            gameOver = false;
            var horse = this.getHorse();
            horse.getComponent("horse").init(this, i - 1, j - 2, 100);
        }

        if (this.power >= this.chessWidth * this.chessHeight - Global.levelData[this.levelIndex].difficulty.length) {
            this.gameOver(true);
        }
        else {
            if (gameOver) {
                this.gameOver(false);
            }
        }
    },

    gameOver: function (isWin) {
        if (isWin) {
            AudioHelp.playEffect(window.AudioName.SFX_GAME_WIN, 1);
        }
        else {
            AudioHelp.playEffect(window.AudioName.SFX_GAME_LOSE, 1);
        }
        this.stepCnt = null;
        this.gameResult = isWin; //游戏结果
        let self = this;
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                self.node.getChildByName(self.power.toString()).setAnchorPoint(Global.anchorX[i], Global.anchorY[i]);
            }, 50 * (i + 1));
        }

        setTimeout(() => {
            self.clearAll();
            self.overLabel.node.active = true;
            if (isWin) {
                if (window.GameData.curLevel % Global.levelSum == 0) {
                    let index = window.GameData.curLevel / Global.levelSum - 1;
                    self.overLabel.string = Global.gameStage[index].success;
                }
                else {
                    self.overLabel.string = "恭喜闯关成功";
                }
                if (window.GameData.curLevel < Global.gameStage.length * Global.levelSum) {
                    let award = Global.levelData[this.levelIndex].award;
                    self.shareBtn.active = true;
                    self.shareBtn.getChildByName("New Label").getComponent(cc.Label).string = "+" + (award * Global.multiCoin).toString() + "金币";
                    self.awardBtn.active = true;
                    self.awardBtn.getChildByName("New Label").getComponent(cc.Label).string = "+" + award.toString() + " 金币";
                    self.moreBtn.active = true;
                    self.moreBtn.getChildByName("New Label").getComponent(cc.Label).string = "+" + (award * Global.coinMulti).toString() + " 金币";
                    let xuanyaoNode = self.node.getChildByName("wenzi_xuanyaoyixia");
                    self.showXuanyao(xuanyaoNode);
                }
            }
            else {
                self.overLabel.string = "无路可走\n\n" + "点击重置再次挑战";
            }
        }, 500);
    },

    showXuanyao: function (node) {
        node.active = true;
        node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.75, 1.1, 1.1), cc.scaleTo(0.75, 1, 1))));
    },

    clearAll: function () {
        this.clearHorse();
        this.clearStep();
        this.clearLine();
        this.clearObstacle();
    },

    resetHorse: function (i, j) {
        this.clearHorse();
        this.setHorse(i, j);
        if (this.preRow != null && this.preCol != null)
            this.showStep(this.preRow, this.preCol);
        this.preRow = i;
        this.preCol = j;
    },

    clearHorse: function () {
        for (var h of this.horseList) {
            h.stopAllActions();
            h.name = null;
            this.horsePool.put(h);
        }
        this.horseList = [];
    },

    clearStep: function () {
        for (var s of this.stepList) {
            s.name = null;
            this.stepPool.put(s);
        }
        this.stepList = [];
    },

    clearLine: function () {
        for (var l of this.lineList) {
            this.linePool.put(l);
        }
        this.lineList = [];
    },

    clearObstacle: function () {
        for (var o of this.obstacleList) {
            this.obstaclePool.put(o);
        }
        this.obstacleList = [];
    },

    showStep: function (i, j, num) {
        let step = null;
        if (this.stepPool.size() > 0) {
            step = this.stepPool.get();
        } else {
            step = cc.instantiate(this.stepPrefab);
        }
        step.parent = this.node;
        step.setScale(Global.stepScale * 8 / this.chessWidth);
        this.stepList.push(step);
        let width = this.node.width - Global.gap;
        let height = this.node.height - Global.gap;
        let stepLabel = step.getChildByName("New Label");
        stepLabel.color = new cc.color(255, 255, 0, 255);
        step.getChildByName("node").active = true;
        if (num != undefined) {
            stepLabel.color = new cc.color(255, 255, 255, 255);
            step.getChildByName("node").active = false;
            stepLabel.getComponent(cc.Label).string = num.toString();
        }
        else {
            stepLabel.getComponent(cc.Label).string = (this.power - 1).toString();
            step.name = (this.power - 1).toString();
        }
        step.y = -width / 2 + width / this.chessWidth * i + width / (2 * this.chessWidth);
        step.x = -height / 2 + height / this.chessHeight * j + height / (2 * this.chessHeight);
    },

    update: function () {
        if (this.gameResult == null) {
            if (this.levelIndex <= 0)
                this.backBtn.opacity = 100;
            else
                this.backBtn.opacity = 255;
            if (this.levelIndex + 1 < window.GameData.curMaxLevel)
                this.nextBtn.opacity = 255;
            else
                this.nextBtn.opacity = 100;
            if (this.stepCnt == null) {
                if (this.coinCount >= Global.levelData[this.levelIndex].tipCost)
                    this.tipBtn.opacity = 255;
                else
                    this.tipBtn.opacity = 100;
            }
            else {
                if (1 + this.stepCnt + Global.tipStepCnt >= Global.levelData[this.levelIndex].answer.length)
                    this.tipBtn.opacity = 100;
                else {
                    if (this.coinCount >= Global.levelData[this.levelIndex].tipCost)
                        this.tipBtn.opacity = 255;
                    else
                        this.tipBtn.opacity = 100;
                }
            }
            if (this.power > 1) {
                this.resetBtn.opacity = 255;
                this.regretBtn.opacity = 255;
            }
            else {
                if (this.resetCnt > 0)
                    this.resetBtn.opacity = 100;
                else
                    this.resetBtn.opacity = 255;
                if (this.regretCnt > 0)
                    this.regretBtn.opacity = 100;
                else
                    this.regretBtn.opacity = 255;
            }
        }
        else {
            this.regretBtn.opacity = 100;
            this.tipBtn.opacity = 100;
            if (this.gameResult == true) {
                this.backBtn.opacity = 100;
                this.nextBtn.opacity = 100;
                this.resetBtn.opacity = 100;
            }
        }
    },

    shareFunc: function (func) {
        let self = this;
        WXHelp.shareAppMessageDiffGroup(function () {
            window.curShareType = "InGame";
            self.timer = setInterval(function () {
                console.log("-window.SystemInfo.isSuccess-->", window.SystemInfo.isSuccess);
                if (window.SystemInfo.isSuccess != -1) {
                    clearInterval(self.timer);
                }
                if (window.SystemInfo.isSuccess == 1) {
                    window.SystemInfo.isSuccess = -1;
                    window.GameData.setShareCount(1);
                    func();
                } else if (window.SystemInfo.isSuccess == 0) {
                    window.SystemInfo.isSuccess = -1;
                    WXHelp.showWXTips("提示", "分享失败，请分享到其他群！");
                }
            }, 800);
        });
    },

    levelProgress: function () {
        let curLevel = window.GameData.curLevel;
        let count = parseInt(curLevel / Global.levelSum);
        if (curLevel % Global.levelSum == 0) {
            count--;
            if (count < 0)
                count = 0;
        }
        this.stageImg.getComponent(cc.Sprite).spriteFrame = this.stageSpriteFrame[count];
        let per1 = curLevel % Global.levelSum;
        if (per1 == 0) {
            per1 = Global.levelSum;
        }
        per1 = (per1 - 1) / Global.levelSum;
        this.progressOne.progress = per1;
        let One1 = this.percentOne.getChildByName("num1");
        let One2 = this.percentOne.getChildByName("num2");
        let One3 = this.percentOne.getChildByName("num3");
        let percent1 = parseInt(per1 * 100);
        let p1_3 = percent1 % 10;
        percent1 = parseInt(percent1 / 10);
        let p1_2 = percent1 % 10;
        percent1 = parseInt(percent1 / 10);
        let p1_1 = percent1 % 10;
        One1.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p1_1];
        One2.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p1_2];
        One3.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p1_3];
        if (p1_1 > 0)
            One1.active = true;
        else
            One1.active = false;
        if (p1_1 <= 0 && p1_2 <= 0)
            One2.active = false;
        else
            One2.active = true;

        let number = curLevel;
        let num3 = number % 10;
        number = parseInt(number / 10);
        let num2 = number % 10;
        number = parseInt(number / 10);
        let num1 = number % 10;
        this.levelImg.getChildByName("num1").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[num1];
        this.levelImg.getChildByName("num2").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[num2];
        this.levelImg.getChildByName("num3").getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[num3];
        let per2 = curLevel;
        per2 = (per2 - 1) / (Global.levelSum * Global.gameStage.length);
        this.progressTwo.progress = per2;
        let Two1 = this.percentTwo.getChildByName("num1");
        let Two2 = this.percentTwo.getChildByName("num2");
        let Two3 = this.percentTwo.getChildByName("num3");
        let percent2 = parseInt(per2 * 100);
        let p2_3 = percent2 % 10;
        percent2 = parseInt(percent2 / 10);
        let p2_2 = percent2 % 10;
        percent2 = parseInt(percent2 / 10);
        let p2_1 = percent2 % 10;
        Two1.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p2_1];
        Two2.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p2_2];
        Two3.getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[p2_3];
        if (p2_1 > 0)
            Two1.active = true;
        else
            Two1.active = false;
        if (p2_1 <= 0 && p2_2 <= 0)
            Two2.active = false;
        else
            Two2.active = true;
    },

    levelDesc: function () {
        var str = "";
        let curLevel = window.GameData.curLevel;
        let count = parseInt(curLevel / Global.levelSum);
        if (curLevel % Global.levelSum == 0) {
            count--;
            if (count < 0)
                count = 0;
        }
        str += Global.gameStage[count].dist + "阶段\n";
        let per = curLevel % Global.levelSum;
        if (per == 0) {
            per = Global.levelSum;
        }
        per = parseInt((per - 1) / Global.levelSum * 100);
        str += "第" + curLevel.toString() + "关";
        return str;
    },
});
