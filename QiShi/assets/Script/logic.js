var M = {};
M.curIndex = 0;
M.indexList = [];
M.stepList = [];
M.stepCnt = 1;

M.posJudge = function (x1, y1, x2, y2) {
    if (x1 - x2 == -1 && y1 - y2 == 2)
        return true;
    if (x1 - x2 == 1 && y1 - y2 == 2)
        return true;
    if (x1 - x2 == -2 && y1 - y2 == 1)
        return true;
    if (x1 - x2 == 2 && y1 - y2 == 1)
        return true;
    if (x1 - x2 == -2 && y1 - y2 == -1)
        return true;
    if (x1 - x2 == 2 && y1 - y2 == -1)
        return true;
    if (x1 - x2 == -1 && y1 - y2 == -2)
        return true;
    if (x1 - x2 == 1 && y1 - y2 == -2)
        return true;
    return false;
}

M.init = function (width) {
    this.curIndex = 0;
    this.indexList = [];
    this.stepList = [];
    for (var i = 1; i < width * width; i++)
        this.indexList.push(i);
    this.stepList.push(this.curIndex);
}

M.findPath = function (width, need) {
    var cnt = 0;
    while (true) {
        var rand = Math.floor(Math.random() * this.indexList.length);
        var step = this.indexList[rand];
        var x1 = parseInt(step / width);
        var y1 = step % width;
        var x2 = parseInt(this.curIndex / width);
        var y2 = this.curIndex % width;
        cnt++;
        if (cnt == 50000) {
            break;
        }
        if (this.posJudge(x1, y1, x2, y2)) {
            this.curIndex = step;
            this.indexList.splice(rand, 1);
            this.stepList.push(this.curIndex);
            this.stepCnt++;
            if (this.stepCnt == need) {
                console.log(`stepList:${this.stepList}`);
                console.log(`indexList: ${this.indexList}`);
                return;
            }
        }
    }
}

module.exports = M;