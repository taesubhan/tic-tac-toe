// Game board module
const gameBoard = (function() {
    const board = [];
    const rows = 3;
    const cols = 3;

    function getBoard() {
        return board;
    }
    
    function createBoard() {
        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < cols; c++) {
                board[r].push(cell());
            }
        }
    }

    function getCell(row, col) {
        return board[row][col];
    }

    function isCellTaken(cell) { // accepts cell object
        return Boolean(cell.getValue());
    }
    
    function placePlayerToken(row, col, player) { // accepts player object
        const boardCell = getCell(row, col);
        if(!isCellTaken(boardCell)) {
            boardCell.setValue(player.getToken());
        } 
    }

    return {getBoard, createBoard, getCell, isCellTaken, placePlayerToken};
})();

// Game board cell factory function
function cell() {
    let value = null;

    function getValue() {
        return value;
    }

    function setValue(token) {
        value = token;
    }

    function resetValue() {
        value = null;
    }

    return {getValue, setValue, resetValue};
}

// Player factory function
function player(playerName, playerToken) {
    const name = playerName;
    const token = playerToken;

    function getToken() {
        return token;
    } 

    return {name, getToken};
}

// Game logic module
const gameLogic = (function() {


    function setUpGame(player1Name, player2Name) {
        gameBoard.createBoard();
        
    }

    function displayBoard() {
        console.log(gameBoard.getBoard());
    }
    

})();

console.log('test');

gameBoard.createBoard();
console.log(gameBoard.getBoard());