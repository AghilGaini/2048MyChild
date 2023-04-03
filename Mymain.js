
/**
     * listener for when key down
*/
document.addEventListener('keydown', (event) => {
    //var name = event.key;
    //var code = event.code;
    var charCode = event.keyCode;
    //alert(`Key pressed ${name} \r\n Key code value: ${code} \r\n char code  : ${charCode}`);

    if (charCode == Keys.W || charCode == Keys.UpArrow) {
        event.preventDefault(); //to pervent  default behavior of keys
        if (My2048Instance.CheckEnd() == true)
            return;
        My2048Instance.Move('U');
    }
    else if (charCode == Keys.S || charCode == Keys.DownArrow) {
        event.preventDefault(); //to pervent  default behavior of keys
        if (My2048Instance.CheckEnd() == true)
            return;
        My2048Instance.Move('D');
    }
    else if (charCode == Keys.A || charCode == Keys.LeftArrow) {
        event.preventDefault(); //to pervent  default behavior of keys
        if (My2048Instance.CheckEnd() == true)
            return;
        My2048Instance.Move('L');
    }
    else if (charCode == Keys.D || charCode == Keys.RightArrow) {
        event.preventDefault(); //to pervent  default behavior of keys
        if (My2048Instance.CheckEnd() == true)
            return;
        My2048Instance.Move('R');
    }
    else if (charCode == Keys.U || charCode == Keys.Q) {
        event.preventDefault(); //to pervent  default behavior of keys
        My2048Instance.Undo();
        My2048Instance.Show();
    }

}, false);

/**
    * this hold the key codes
*/
const Keys = {
    'UpArrow': 38,
    'W': 87, //up
    'DownArrow': 40,
    'S': 83, //down
    'LeftArrow': 37,
    'A': 65, //left
    'RightArrow': 39,
    'D': 68, //right
    'U': 85, //U char for undo
    'Q': 81, //Q char for undo
}

/**
    * this hold different times in milliSeconds
*/
const TimesInMilliSeconds =
{
    'Seconds': 1000,
    'Minutes': 60000,//1000*60
    'Hours': 3600000,//60000*60
    'Days': 86400000,//3600000 *24
    'Years': 31536000000,//86400000 *365
}

class Utils {

    /**
         * generate random 2 or 4
    */
    static GenerateRandom2or4() {
        return Math.random() < 0.3 ? 4 : 2;
    }


    /**
         * generate random number between 0 and max 
    */
    static GenerateRandomWithMax(max) {
        return Math.floor(Math.random() * max);
    }


    /**
         * compare two array
    */
    static CompareTwoArraya(a, b) {

        if (a.length === b.length &&
            a.every((v, i) => v === b[i])) {
            return true;
        }
        return false;
    }

    /**
         * get color based on entry number
    */
    static GetColor(number) {
        switch (number) {
            case 2:
                return '#ed4090';
                break;
            case 4:
                return '#f17575';
                break;
            case 8:
                return '#ff5200';
                break;
            case 16:
                return '#f170e7';
                break;
            case 32:
                return '#ff8d00';
                break;
            case 64:
                return '#ffb65c';
                break;
            case 128:
                return '#f1c904';
                break;
            case 256:
                return '#e9d46a';
                break;
            case 512:
                return '#ccff00';
                break;
            case 1024:
                return '#bbd162';
                break;
            case 2048:
                return '#90fd00';
                break;
            case 4096:
                return '#8db756';
                break;
            case 8192:
                return '#02ff8a';
                break;
            case 16384:
                return '#57b589';
                break;
            case 32768:
                return '#68b3ff';
                break;
            case 65536:
                return '#3980c7';
                break;
            case 131072:
                return '#798104';
                break;
        }
    }

    /**
         * covnert entry time to year,day,hours,minutes,seconds,milliSeconds
         * entryTime must be in milliSeconds
    */
    static ConvertTime(entryTime) {
        var info = {};

        var remind = 0

        info.years = Math.floor(entryTime / TimesInMilliSeconds.Years);
        remind = entryTime % TimesInMilliSeconds.Years;

        info.days = Math.floor(remind / TimesInMilliSeconds.Days);
        remind = remind % TimesInMilliSeconds.Days;

        info.hours = Math.floor(remind / TimesInMilliSeconds.Hours);
        remind = remind % TimesInMilliSeconds.Hours;

        info.minutes = Math.floor(remind / TimesInMilliSeconds.Minutes);
        remind = remind % TimesInMilliSeconds.Minutes;

        info.seconds = Math.floor(remind / TimesInMilliSeconds.Seconds);
        remind = remind % TimesInMilliSeconds.Seconds;

        info.milliSeconds = remind;

        return info;
    }

}

class My2048 {

    #mainArr; //for store main array info
    #emptyCells; //this store empty cells(0) indexes
    #rows; //rows of main array
    #cols; //cols of main array 
    #initializeValue; //initialize first value when object created
    #initializeRandomCount; //initialize first count for generate random number
    #score; //store score
    #hasMoved; //if in each move has any change this would be true else false
    #undoJson;//store all undo info as a json array
    #mainTableId; //store mainTable element id
    #scoreId; //store score element id
    #undoId; //store undo element id
    #totalMovesId; //store totalMoves element id 
    #totalMoves;//store total move counts(without undo counts)
    #startTotalTime;//store start time of the game
    #totalUndoUsed;//store total times that undo used
    #gameOver;//true if gameOver !

    constructor(count, initializeValue, initializeRandomCount) {
        this.score = 0;
        this.totalMoves = 0;
        this.hasMoved = false;
        this.rows = count;
        this.cols = count;
        this.initializeValue = initializeValue;
        this.initializeRandomCount = initializeRandomCount;
        this.mainArr = new Array(this.rows).fill(initializeValue).map(() => new Array(this.cols).fill(initializeValue))
        this.emptyCells = [];
        this.undoJson = [];
        this.totalUndoUsed = 0;
        this.startTotalTime = new Date();
        this.gameOver = false;
        this.mainTableId = "mainTbl";
        this.scoreId = "score";
        this.undoId = "undo";
        this.totalMovesId = "totalMoves";

        this.ComputeEmptyCells();
        this.InitializeRandom();
    }

    // #region Methods


    /**
     * this method fill an empty cell(find randomlly) and fill it with random value
     * and return its value (of random index)
     */
    FillAnEmptyCellWithRandomValue() {
        var emptyIndex = this.FindAnEmptyCellIndex();

        if (emptyIndex == -1)
            return; //ToDo

        var emptyValues = this.emptyCells[emptyIndex];
        var randomNumber = Utils.GenerateRandom2or4();

        this.mainArr[emptyValues[0]][emptyValues[1]] = randomNumber;
        this.RemoveFromEmptyCells(emptyIndex);

        return emptyValues;
    }

    /**
     * this method remove passed index from emptyCells array
     *
     * @param {Int32} index the coordinate to start search.
     */
    RemoveFromEmptyCells(index) {
        this.emptyCells.splice(index, 1);
    }

    /**
     * this method return an index of empty cell (returned index is based on emptyCells array)
     */
    FindAnEmptyCellIndex() {
        if (this.emptyCells.length <= 0)
            return -1;

        var randomCellNumber = Utils.GenerateRandomWithMax(this.emptyCells.length);

        return randomCellNumber;
    }

    /**
     * this method is for find empty cells and fill emptyCells property
     */
    ComputeEmptyCells() {
        this.emptyCells = [];
        var i;
        var j;
        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.cols; j++) {
                if (this.mainArr[i][j] == 0)
                    this.emptyCells.push([i, j]);
            }
        }
    }

    /**
     * this method is for fill random cells at first
     */
    InitializeRandom() {
        var i;
        for (i = 0; i < this.initializeRandomCount; i++) {
            this.FillAnEmptyCellWithRandomValue();
        }
    }

    /**
     * this method is for calculate elapsed time from start game
     */
    GetTotalTime() {
        var end = new Date();

        var timeInMilliSeconds = end - this.startTotalTime;

        var timeInfo = Utils.ConvertTime(timeInMilliSeconds);

        return timeInfo;

    }

    /**
     * get some log 
     */
    get info() //for log
    {
        console.log('rows : ' + this.rows
            + '   / cols : ' + this.cols
            + '   / initial value : ' + this.initializeValue
            + '   / initial random count : ' + this.initializeRandomCount);
    }

    /**
     * root method for move 
     */
    Move(direction) {

        var entity = {};
        entity.mainArr = this.mainArr;
        entity.score = this.score;
        entity.totalMoves = this.totalMoves;
        entity.gameOver = this.gameOver;

        entity = JSON.stringify(entity);

        switch (direction) {
            case 'R':
                this.MoveRight();
                break;
            case 'L':
                this.MoveLeft();
                break;
            case 'U':
                this.MoveUp();
                break;
            case 'D':
                this.MoveDown();
                break;
        }

        var randomCellId = "";

        this.ComputeEmptyCells();

        if (this.hasMoved == true) {
            this.totalMoves++;
            var randomCell = this.FillAnEmptyCellWithRandomValue();
            randomCellId = this.GetTileId(randomCell);

            this.undoJson.unshift(entity);

            if (this.undoJson.length >= 6) {
                this.undoJson.pop();
            }
        }

        this.hasMoved = false;
        this.Show();
        this.ShowUI();

        //generate animation class for random cell
        if (randomCellId != "") {
            $("#" + randomCellId).addClass("randomCellAnime");
        }

        if (this.CheckEnd() == true) {
            alert("ridi dg");
        }

    }

    /**
     * this methis is for swap two element in mainArr
     * @param {Array} source the coordinate of source .
     * @param {Array} destination the coordinate of destionation.
     */
    swap(source, destination) {
        var temp = this.mainArr[source[0]][source[1]];
        this.mainArr[source[0]][source[1]] = this.mainArr[destination[0]][destination[1]];
        this.mainArr[destination[0]][destination[1]] = temp;
    }

    /**
     * find first none zero value in given direction
     *
     * @param {Array} source the coordinate to start search from it.
     * @param {string} direction the direction to search.
     * @return {Array} if find any none zero return it else return [-1,-1].
     */
    FindFirstNoneZero(source, direction) {
        var row = source[0];
        var col = source[1];;//start after zero vlaue that passed to method

        switch (direction) {
            case 'R': //start from right to left 
                {
                    col -= 1;
                    while (col >= 0) {
                        if (this.mainArr[row][col] != 0) {
                            return [row, col];
                        }
                        col--;
                    }
                    return [-1, -1];
                    break;
                }
            case 'L': //start from left to right
                {
                    col += 1;
                    while (col < this.cols) {
                        if (this.mainArr[row][col] != 0) {
                            return [row, col];
                        }
                        col++;
                    }
                    return [-1, -1];
                    break;
                }
            case 'U': //start from up to down
                {
                    row += 1;
                    while (row < this.rows) {
                        if (this.mainArr[row][col] != 0) {
                            return [row, col];
                        }
                        row++;
                    }
                    return [-1, -1];
                    break;
                }
            case 'D': //start from down to up
                {
                    row -= 1;
                    while (row >= 0) {
                        if (this.mainArr[row][col] != 0) {
                            return [row, col];
                        }
                        row--;
                    }
                    return [-1, -1];
                    break;
                }
        }

    }

    /**
     * increase score
     *
     * @param {Int32} point value to increase.
     */
    IncreaseScore(point) {
        this.score += point;
    }

    /**
     * decrease score
     *
     * @param {Int32} point value to decrease.
     */
    DecreaseScore(point) {
        this.score -= point;
    }

    /**
     * method to undo
     *
     */
    Undo() {
        if (this.undoJson.length <= 0)
            return;

        this.totalUndoUsed++;

        var info = JSON.parse(this.undoJson.shift());
        this.mainArr = info.mainArr;
        this.score = info.score;
        this.totalMoves = info.totalMoves;
        this.gameOver = info.gameOver;
        this.ShowUI();
    }

    /**
     * method to show mainArr in table element in page
     *
     * @param {string} tableId table id to show mainArr.
     */
    ShowUI() {
        var mainTbl = $("#" + this.mainTableId);
        mainTbl.text(null);

        var row, col;

        var rowInfos = [];

        for (row = 0; row < this.rows; row++) {
            var rowInfo = $("<tr></tr>");
            var colInfos = [];
            for (col = 0; col < this.cols; col++) {
                var tdInfo = "";
                var id = this.GetTileId([row, col]);
                if (this.mainArr[row][col] != 0) {
                    var color = Utils.GetColor(this.mainArr[row][col]);
                    tdInfo = $("<td class='gridCell' id=" + id + " style='background-color:" + color + "'></td>").text(this.mainArr[row][col]);
                }
                else
                    tdInfo = $("<td class='gridCell' id=" + id + "></td>").text(' ');
                colInfos.push(tdInfo);
            }

            rowInfo.append(colInfos);

            rowInfos.push(rowInfo);
        }

        mainTbl.append(rowInfos);

        $("#" + this.scoreId).text(this.score);
        $("#" + this.undoId).text(this.undoJson.length);
        $("#" + this.totalMovesId).text(this.totalMoves);
    }

    /**
     * method to return the id of cells
     * @param {Array} tileIndex index to get its id.
     * 
     */
    GetTileId(tileIndex) {
        var id = 'tile' + tileIndex[0] + '' + tileIndex[1];
        return id;
    }

    /**
     * method check that game has any move
     *
     */
    CheckEnd() {

        if (this.gameOver == true)
            return true;

        if (this.emptyCells.length > 0)
            return false;

        var row, col;

        //check left and right
        for (row = 0; row < this.rows; row++) {
            for (col = 0; col < this.cols - 1; col++) {
                if (this.mainArr[row][col] == this.mainArr[row][col + 1])
                    return false;
            }
        }

        //check up and down
        for (row = 0; row < this.rows - 1; row++) {
            for (col = 0; col < this.cols; col++) {
                if (this.mainArr[row][col] == this.mainArr[row + 1][col])
                    return false;
            }
        }

        this.gameOver = true;
        return true;

    }

    // #endregion

    // #region Move Right

    /**
     * method for move right
     */
    MoveRight() {
        this.ShiftRight();
        this.CollapseRight();
    }

    /**
     * method to shift right the mainArr
     */
    ShiftRight() {
        var row, col;

        for (row = 0; row < this.rows; row++)//from start row
        {
            for (col = this.cols - 1; col >= 0; col--) //from last(right) col
            {
                if (this.mainArr[row][col] == 0)
                    continue;

                var res = {};
                res.success = false;
                var tempCol = col - 1;
                while (tempCol >= 0) {

                    if (this.mainArr[row][tempCol] != 0) {
                        if (this.mainArr[row][col] == this.mainArr[row][tempCol]) {
                            res.success = true;
                            res.source = [row, col];
                            res.destination = [row, tempCol];
                            break;
                        }
                        else {
                            res.success = false;
                            break;
                        }
                    }

                    tempCol--;
                }

                if (res.success == true) {
                    this.hasMoved = true;
                    this.IncreaseScore(this.mainArr[res.source[0]][res.source[1]] * 2);
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }

            }
        }

    }

    /**
     * the method that after shift,pull all 0 values to end of left
     */
    CollapseRight() {
        var row, col;

        for (row = 0; row < this.rows; row++) {
            for (col = this.cols - 1; col >= 0; col--) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'R');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
                        this.hasMoved = true;
                    }
                    else { //in this case all ot elements is 0! so got to next row !
                        col = 0;
                    }
                }
            }
        }
    }

    // #endregion

    // #region Move Left

    /**
     * method for move left
     */
    MoveLeft() {
        this.ShiftLeft();
        this.CollapseLeft();
    }

    /**
     * method to shift left the mainArr
     */
    ShiftLeft() {
        var row, col;

        for (row = 0; row < this.rows; row++)//from start row
        {
            for (col = 0; col < this.cols; col++) //from last(Left) col
            {
                if (this.mainArr[row][col] == 0)
                    continue;

                var res = {};
                res.success = false;
                var tempCol = col + 1;
                while (tempCol < this.cols) {

                    if (this.mainArr[row][tempCol] != 0) {
                        if (this.mainArr[row][col] == this.mainArr[row][tempCol]) {
                            res.success = true;
                            res.source = [row, col];
                            res.destination = [row, tempCol];
                            break;
                        }
                        else {
                            res.success = false;
                            break;
                        }
                    }

                    tempCol++;
                }

                if (res.success == true) {
                    this.hasMoved = true;
                    this.IncreaseScore(this.mainArr[res.source[0]][res.source[1]] * 2);
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }

            }
        }

    }

    /**
     * the method that after shift,pull all 0 values to end of right
     */
    CollapseLeft() {
        var row, col;
        for (row = 0; row < this.rows; row++) {
            for (col = 0; col < this.cols; col++) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'L');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
                        this.hasMoved = true;
                    }
                    else { //in this case all ot elements is 0! so got to next row !
                        col = this.cols;
                    }
                }
            }
        }
    }

    // #endregion

    // #region Move Up

    /**
     * method for move Up
     */
    MoveUp() {
        this.ShiftUp();
        this.CollapseUp();
    }

    /**
     * method to shift up the mainArr
     */
    ShiftUp() {
        var col, row;

        for (col = 0; col < this.cols; col++) {
            for (row = 0; row < this.rows; row++) {
                if (this.mainArr[row][col] == 0)
                    continue;

                var res = {};
                res.success = false;
                var tempRow = row + 1;

                while (tempRow < this.rows) {

                    if (this.mainArr[tempRow][col] != 0) {
                        if (this.mainArr[row][col] == this.mainArr[tempRow][col]) {
                            res.success = true;
                            res.source = [row, col];
                            res.destination = [tempRow, col];
                            break;
                        }
                        else {
                            res.success = false;
                            break;
                        }
                    }


                    tempRow++;
                }

                if (res.success == true) {
                    this.hasMoved = true;
                    this.IncreaseScore(this.mainArr[res.source[0]][res.source[1]] * 2);
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }
            }
        }
    }

    /**
     * the method that after shift,pull all 0 values to end of down
     */
    CollapseUp() {
        var col, row;
        for (col = 0; col < this.cols; col++) {
            for (row = 0; row < this.cols; row++) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'U');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
                        this.hasMoved = true;
                    }
                    else { //in this case all ot elements is 0! so got to next row !
                        row = this.rows;
                    }
                }
            }
        }
    }

    // #endregion

    // #region Move Down

    /**
     * method for move Down
     */
    MoveDown() {
        this.ShiftDown();
        this.CollapseDown();
    }

    /**
     * method to shift down the mainArr
     */
    ShiftDown() {
        var col, row;

        for (col = 0; col < this.cols; col++) {
            for (row = this.rows - 1; row >= 0; row--) {
                if (this.mainArr[row][col] == 0)
                    continue;

                var res = {};
                res.success = false;
                var tempRow = row - 1;

                while (tempRow >= 0) {

                    if (this.mainArr[tempRow][col] != 0) {
                        if (this.mainArr[row][col] == this.mainArr[tempRow][col]) {
                            res.success = true;
                            res.source = [row, col];
                            res.destination = [tempRow, col];
                            break;
                        }
                        else {
                            res.success = false;
                            break;
                        }
                    }


                    tempRow--;
                }

                if (res.success == true) {
                    this.hasMoved = true;
                    this.IncreaseScore(this.mainArr[res.source[0]][res.source[1]] * 2);
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }
            }
        }
    }

    /**
     * the method that after shift,pull all 0 values to end of up
     */
    CollapseDown() {
        var col, row;
        for (col = 0; col < this.cols; col++) {
            for (row = this.rows - 1; row >= 0; row--) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'D');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
                        this.hasMoved = true;
                    }
                    else { //in this case all ot elements is 0! so got to next row !
                        row = 0;
                    }
                }
            }
        }
    }

    // #endregion

    // #region for test

    /**
     * the method is for set mainArr to test!
     */
    CustomInitial() {
        this.mainArr =
            //[
            //    [65536, 32768, 16384, 8192],
            //    [4096, 2048, 1024, 512],
            //    [256, 128, 64, 32],
            //    [16, 8, 4, 2]
            //];

            [
                [0, 2, 4, 2],
                [2, 4, 4, 2],
                [4, 4, 2, 4],
                [0, 2, 4, 4]
            ];
    }

    /**
     * show main array and score
     */
    Show() {
        console.table(this.mainArr);
        console.log('score : ' + this.score);
    }

    // #endregion
}

const count = 4;
const initializeValue = 0;
const initializeRandomCount = 4;
const My2048Instance = new My2048(count, initializeValue, initializeRandomCount);


$(document).ready(function () {
    My2048Instance.CustomInitial();
    My2048Instance.ShowUI();
});

/**
     * function that assigned to Undo btn 
*/
function UndoClick() {
    My2048Instance.Undo();
}


function ShowStatistics() {

    var time = My2048Instance.GetTotalTime();
    var years = time.years;
    var days = time.days.toString().padStart(2, '0');
    var hours = time.hours.toString().padStart(2, '0');
    var minutes = time.minutes.toString().padStart(2, '0');
    var seconds = time.seconds.toString().padStart(2, '0');
    var milliSeconds = time.milliSeconds.toString().padStart(3, '0');

    var effectiveMoves = My2048Instance.totalMoves + My2048Instance.totalUndoUsed;

    $("#stTotalEffectiveMoves").text(effectiveMoves);
    $("#stTotalMoves").text(My2048Instance.totalMoves);
    $("#stRemaindUndo").text(My2048Instance.undoJson.length);
    $("#stTotalTime").text(years + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + "." + milliSeconds + '    (Y-DD HH:mm:ss.sss) ');
    $("#stUsedUndo").text(My2048Instance.totalUndoUsed);
    $('#StatisticsModal').modal('show');
}

