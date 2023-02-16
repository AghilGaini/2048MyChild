
class Utils {

    static GenerateRandom() {
        return Math.random() < 0.3 ? 4 : 2;
    }

    static GenerateRandomWithMax(max) {
        return Math.floor(Math.random() * max);
    }

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

    constructor(count, initializeValue, initializeRandomCount) {
        this.rows = count;
        this.cols = count;
        this.initializeValue = initializeValue;
        this.initializeRandomCount = initializeRandomCount;
        this.mainArr = new Array(this.rows).fill(initializeValue).map(() => new Array(this.cols).fill(initializeValue))
        this.emptyCells = [];

        this.ComputeEmptyCells();
        this.InitializeRandom();
    }

    // #region Methods

    FillAnEmptyCellWithRandomValue() //this method fill an empty cell(find randomlly) and fill it with random value
    {
        var emptyIndex = this.FindAnEmptyCellIndex();

        if (emptyIndex == -1)
            return; //ToDo

        var emptyValues = this.emptyCells[emptyIndex];
        var randomNumber = Utils.GenerateRandom();

        this.mainArr[emptyValues[0]][emptyValues[1]] = randomNumber;
        this.RemoveFromEmptyCells(emptyIndex);
    }

    RemoveFromEmptyCells(index) //this method remove passed index from emptyCells array
    {
        this.emptyCells.splice(index, 1);
    }

    FindAnEmptyCellIndex() //this method return an index of empty cell (returned index is based on emptyCells array)
    {
        if (this.emptyCells.length <= 0)
            return -1;

        var randomCellNumber = Utils.GenerateRandomWithMax(this.emptyCells.length);

        return randomCellNumber;
    }

    ComputeEmptyCells() //this method is for find empty cells and fill emptyCells property
    {
        var i;
        var j;
        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.cols; j++) {
                if (this.mainArr[i][j] == 0)
                    this.emptyCells.push([i, j]);
            }
        }
    }

    InitializeRandom() //this methis is for fill random cells at first
    {
        var i;
        for (i = 0; i < this.initializeRandomCount; i++) {
            this.FillAnEmptyCellWithRandomValue();
        }
    }

    get info() //for log
    {
        console.log('rows : ' + this.rows
            + '   / cols : ' + this.cols
            + '   / initial value : ' + this.initializeValue
            + '   / initial random count : ' + this.initializeRandomCount);
    }

    Move(direction) {
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

        console.table(this.mainArr);
    }

    swap(source, destination) {
        var temp = this.mainArr[source[0]][source[1]];
        this.mainArr[source[0]][source[1]] = this.mainArr[destination[0]][destination[1]];
        this.mainArr[destination[0]][destination[1]] = temp;
    }

    /**
     * find first none zero value in a direction
     *
     * @param {Array} source the coordinate to start search.
     * @param {string} direction the direction to search.
     * @return {Array} if find any none zero return it else return [-1,-1].
     */
    FindFirstNoneZero(source, direction) { //this method returns first none 0 value index (based on direction arg)
        //if not found any none 0 value return [-1,-1]
        //source must be a zero value

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

    // #endregion

    // #region Move Right

    MoveRight() {
        this.ShiftRight();
        this.CollapseRight();
    }

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
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }

            }
        }

    }

    CollapseRight() {
        var row, col;

        for (row = 0; row < this.rows; row++) {
            for (col = this.cols - 1; col >= 0; col--) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'R');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
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

    MoveLeft() {
        this.ShiftLeft();
        this.CollapseLeft();
    }

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
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }

            }
        }

    }

    CollapseLeft() {
        var row, col;
        for (row = 0; row < this.rows; row++) {
            for (col = 0; col < this.cols; col++) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'L');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
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

    MoveUp() {
        this.ShiftUp();
        this.CollapseUp();
    }

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
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }
            }
        }
    }

    CollapseUp() {
        var col, row;
        for (col = 0; col < this.cols; col++) {
            for (row = 0; row < this.cols; row++) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'U');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
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

    MoveDown() {
        this.ShiftDown();
        this.CollapseDown();
    }

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
                    this.mainArr[res.source[0]][res.source[1]] *= 2;
                    this.mainArr[res.destination[0]][res.destination[1]] = 0;
                }
            }
        }
    }

    CollapseDown() {
        var col, row;
        for (col = 0; col < this.cols; col++) {
            for (row = this.rows - 1; row >= 0; row--) {
                if (this.mainArr[row][col] == 0) {
                    var findedNoneZero = this.FindFirstNoneZero([row, col], 'D');
                    if (!Utils.CompareTwoArraya(findedNoneZero, [-1, -1])) { //in this case founded at lease a none 0 value
                        this.swap([row, col], findedNoneZero);
                    }
                    else { //in this case all ot elements is 0! so got to next row !
                        row = 0;
                    }
                }
            }
        }
    }

    // #endregion


    CustomInitial() {
        this.mainArr =
            [
                [0, 2, 4, 2],
                [2, 4, 4, 2],
                [4, 4, 2, 4],
                [0, 2, 4, 4]
            ];
    }

}

const count = 4;
const initializeValue = 0;
const initializeRandomCount = 4;


const My2048Instance = new My2048(count, initializeValue, initializeRandomCount);

// console.table(My2048Instance.mainArr);


