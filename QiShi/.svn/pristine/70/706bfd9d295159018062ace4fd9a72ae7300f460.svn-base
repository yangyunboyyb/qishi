var M = {};
M.chess = [];
M.line = [];
M.cnt = 0;

M.init = function (n) {
    this.chess = [];
    this.line = [];
    this.cnt = n;
    this.queen(0);
    console.log(`${n}皇后问题共有${this.chess.length}种摆法：`);
    for (var i = 0; i < this.chess.length; i++) {
        var str = `第${i + 1}种摆法：`;
        for (var j = 0; j < this.cnt; j++) {
            if (j == 0)
                str += `${j + 1}${this.chess[i][j]}`;
            else
                str += `,${j + 1}${this.chess[i][j]}`;
        }
        console.log(str);
    }
}

M.queen = function (n) {
    if (n == this.cnt) {
        var arr = [];
        for (var i = 0; i < this.cnt; i++)
            arr.push(this.line[i] + 1);
        this.chess.push(arr);
        return;
    }
    for (var i = 0; i < this.cnt; i++) {
        var j = 0;
        for (j = 0; j < n; j++) {
            if (this.line[j] == i || j - n == this.line[j] - i || n - j == this.line[j] - i)
                break;
        }
        if (j == n) {
            this.line[n] = i;
            this.queen(n + 1);
        }
    }
}

module.exports = M;