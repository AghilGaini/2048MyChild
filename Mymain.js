
/**
     * listener for when key down
*/
document.addEventListener('keydown', (event) => {
    //var name = event.key;
    //var code = event.code;
    var charCode = event.keyCode;
    //alert(`Key pressed ${name} \r\n Key code value: ${code} \r\n char code  : ${charCode}`);

    if (charCode == Keys.W || charCode == Keys.UpArrow) {
        My2048Instance.Move('U');
    }
    else if (charCode == Keys.S || charCode == Keys.DownArrow) {
        My2048Instance.Move('D');
    }
    else if (charCode == Keys.A || charCode == Keys.LeftArrow) {
        My2048Instance.Move('L');
    }
    else if (charCode == Keys.D || charCode == Keys.RightArrow) {
        My2048Instance.Move('R');
    }
    else if (charCode == Keys.U) {
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
    'U': 85 //U char for undo
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

    constructor(count, initializeValue, initializeRandomCount) {
        this.score = 0;
        this.hasMoved = false;
        this.rows = count;
        this.cols = count;
        this.initializeValue = initializeValue;
        this.initializeRandomCount = initializeRandomCount;
        this.mainArr = new Array(this.rows).fill(initializeValue).map(() => new Array(this.cols).fill(initializeValue))
        this.emptyCells = [];
        this.undoJson = [];

        this.ComputeEmptyCells();
        this.InitializeRandom();
    }

    // #region Methods


    /**
     * this method fill an empty cell(find randomlly) and fill it with random value

     */
    FillAnEmptyCellWithRandomValue() {
        var emptyIndex = this.FindAnEmptyCellIndex();

        if (emptyIndex == -1)
            return; //ToDo

        var emptyValues = this.emptyCells[emptyIndex];
        var randomNumber = Utils.GenerateRandom2or4();

        this.mainArr[emptyValues[0]][emptyValues[1]] = randomNumber;
        this.RemoveFromEmptyCells(emptyIndex);
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
     * this methis is for fill random cells at first
     */
    InitializeRandom() {
        var i;
        for (i = 0; i < this.initializeRandomCount; i++) {
            this.FillAnEmptyCellWithRandomValue();
        }
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

        if (this.hasMoved == true) {
            this.ComputeEmptyCells();
            this.FillAnEmptyCellWithRandomValue();

            this.undoJson.unshift(entity);

            if (this.undoJson.length >= 6) {
                this.undoJson.pop();
            }
        }

        this.hasMoved = false;
        this.Show();
        this.ShowUI('mainTbl','score');
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

        var info = JSON.parse(this.undoJson.shift());
        this.mainArr = info.mainArr;
        this.score = info.score;
        this.ShowUI('mainTbl', 'score');
    }

    /**
     * method to show mainArr in table element in page
     *
     * @param {string} tableId table id to show mainArr.
     */
    ShowUI(tableId, scoreId) {
        var mainTbl = $("#" + tableId);
        mainTbl.text(null);

        var row, col;

        var rowInfos = [];

        for (row = 0; row < this.rows; row++) {
            var rowInfo = $("<tr></tr>");
            var colInfos = [];
            for (col = 0; col < this.cols; col++) {
                var tdInfo = "";
                if (this.mainArr[row][col] != 0)
                    tdInfo = $("<td class='gridCell'></td>").text(this.mainArr[row][col]);
                else
                    tdInfo = $("<td class='gridCell'></td>").text(' ');
                colInfos.push(tdInfo);
            }

            rowInfo.append(colInfos);

            rowInfos.push(rowInfo);
        }

        mainTbl.append(rowInfos);

        $("#" + scoreId).text(this.score);
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
My2048Instance.CustomInitial();
My2048Instance.Show();

