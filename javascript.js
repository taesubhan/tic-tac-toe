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
        return Boolean(cell.getPlayerValue());
    }

    function isValidMove(row, col) {
        return (typeof row === 'number' && typeof col === 'number') &&
                (row >= 0 && row < rows) &&
                (col >= 0 && col < cols) &&  
                !isCellTaken(board[row][col])
    }
    
    function placePlayerToken(row, col, player) { // accepts player object
        const boardCell = getCell(row, col);
        if(!isCellTaken(boardCell)) {
            boardCell.setPlayerValue(player);
        } 
    }

    function isFull() {
        for (const row of board) {
            for (const cell of row) {
                if (cell.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    function isSamePlayer(array) {
        const result =  array.every(item => {
            return item !== null &&
                    item.getPlayerValue() === array[0].getPlayerValue()});
        return result;
    }

    function getWinner() {
        for (let r = 0; r < rows; r++) {
            if (isSamePlayer(board[r])) {
                return board[r][0].getPlayerValue();
            }
        }

        for (let c = 0; c < cols; c++) {
            let column = [];
            for (let r = 0; r < rows; r++) {
                column.push(board[r][c]);
            }
            if (isSamePlayer(column)) {
                return board[0][c].getPlayerValue();
            }
        }

        let backward = [];
        let forward = [];

        for (let r = 0; r < rows; r++) {
            
            for (let c = 0; c < cols; c++) {
                if (r === c) {
                    backward.push(board[r][c]);
                } else if ((r + c) === (rows - 1)) {
                    forward.push(board[r][c])
                }
            }
        }

        if (isSamePlayer(backward)) {
            return backward[0].getPlayerValue();
        } else if (isSamePlayer(forward)) {
            return forward[0].getPlayerValue();
        }

        return null;
    }

    function isDraw() {
        return isFull() && !getWinner();
    }

    function deleteBoard() {
        while (board.length > 0) {
            board.pop();
        }
    }

    return {getBoard, createBoard, getCell, isCellTaken, isValidMove, placePlayerToken, getWinner, isDraw, isFull, deleteBoard};
})();

// Game board cell factory function
function cell() {
    let playerValue = null;

    function getPlayerValue() {
        return playerValue;
    }

    function getPlayerToken() {
        return Boolean(playerValue) 
            ? playerValue.getToken()
            : null;
    }

    function setPlayerValue(player) {
        playerValue = player;
    }

    function resetPlayerValue() {
        playerValue = null;
    }

    function isEmpty() {
        return !Boolean(playerValue);
    }

    return {getPlayerValue, getPlayerToken, setPlayerValue, resetPlayerValue, isEmpty};
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

// Game logic and state module
const gameLogic = (function() {
    let playerA;
    let playerB;
    let currentPlayer;
    const tokens = ['x','o']

    function setUpGame(player1Name, player2Name) {
        gameBoard.createBoard();
        playerA = player(player1Name, tokens[0]);
        playerB = player(player2Name, tokens[1]);
        currentPlayer = playerA;
    }

    function switchPlayer() {
        currentPlayer === playerA
            ? currentPlayer = playerB
            : currentPlayer = playerA;
    }

    function playerInput(rowInput, colInput) {
        if (!gameBoard.isValidMove(rowInput, colInput)) {
            return;
        }
        gameBoard.placePlayerToken(rowInput, colInput, currentPlayer);
        if (!isGameOver()) {
            switchPlayer();
        }
    }

    function isGameOver() {
        return gameBoard.isDraw() || Boolean(gameBoard.getWinner());
    }

    function getCurrentPlayer() {
        return currentPlayer.name;
    }

    function startGame() {
        setUpGame('Player 1', 'Player 2');
    }

    function restartBackEnd() {
        gameBoard.deleteBoard();
        startGame();
    }

    return {startGame, playerInput, isGameOver, getCurrentPlayer, restartBackEnd};
})();

// DOM manipulating modules
const gameInDOM = (function(doc) {
    let boardDOM = doc.querySelector('.game-board');

    function drawBoard() {
        const board = gameBoard.getBoard();
        
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                const cellDOM = doc.createElement('li');
                cellDOM.classList.add('cell');
                cellDOM.setAttribute('row', `${r}`);
                cellDOM.setAttribute('col', `${c}`);

                cellDOM.addEventListener('click', addPlayerToken)

                boardDOM.appendChild(cellDOM);
            }
        }

        addRestartFeature();
    }

    function displayWinner() {
        if (gameBoard.getWinner()) {
            alert(`Congratulations ${gameLogic.getCurrentPlayer()} won!`);
        } else if (gameBoard.isDraw()) {
            alert(`Draw!`)
        }
    }

    function removeAllClickEvent() {
        for (const child of boardDOM.children) {
            child.removeEventListener('click', addPlayerToken);
        }
    }

    function endGame() {
        displayWinner();
        removeAllClickEvent();
    }

    function deleteDOMBoard() {
        while (boardDOM.firstChild) {
            boardDOM.removeChild(boardDOM.firstChild);
        }
    }

    function restart() {
        deleteDOMBoard();
        gameLogic.restartBackEnd();
        drawBoard();
    }

    function addRestartFeature() {
        const restartButton = doc.querySelector('.restart-game');
        restartButton.addEventListener('click', restart);
    }

    function addPlayerToken(e) {
        const row = parseInt(e.target.getAttribute('row'));
        const col = parseInt(e.target.getAttribute('col'));
        
        if (gameBoard.isValidMove(row, col)) {
            gameLogic.playerInput(row, col);
            e.target.textContent = gameBoard.getCell(row, col).getPlayerToken();
        }
        setTimeout(() => gameLogic.isGameOver() 
            ? endGame()  
            : null
            , 10); //used to allow textContent to be updated before alert function runs
    }

    function start() {
        gameLogic.startGame();
        drawBoard();
    }

    return {drawBoard, start};
})(document);

gameInDOM.start();

