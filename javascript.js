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

    function deleteBoard() {
        while (board.length > 0) {
            board.pop();
        }
    }

    return {getBoard, createBoard, getCell, isCellTaken, isValidMove, placePlayerToken, isFull, deleteBoard};
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

    function getAllPlayersObject() {
        return {playerA, playerB};
    }
    
    function setUpGame(player1Name, player1Token, player2Name, player2Token) {
        gameBoard.createBoard();
        playerA = player(player1Name, player1Token);
        playerB = player(player2Name, player2Token);
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
        return isDraw() || Boolean(getWinner());
    }

    function getCurrentPlayer() {
        return currentPlayer.name;
    }

    function restartBackEnd() {
        gameBoard.deleteBoard();
        setUpGame(playerA.name, playerA.getToken(), playerB.name, playerB.getToken());
    }

    function isSamePlayer(array) {
        const result =  array.every(item => {
            return item !== null &&
                    item.getPlayerValue() === array[0].getPlayerValue()});
        return result;
    }

    function getWinner() {
        const board = gameBoard.getBoard();
        const rows = board.length;
        const cols = board[0].length;
        
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
        return gameBoard.isFull() && !getWinner();
    }

    return {getAllPlayersObject, setUpGame, playerInput, isGameOver, getCurrentPlayer, restartBackEnd, getWinner, isDraw};
})();

// DOM manipulating modules
const gameInDOM = (function(doc) {
    let boardDOM = doc.querySelector('.game-board');

    //dialog
    const dialogBox =  doc.querySelector('#game-dialog');

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
    }

    function displayWinner() {
        if (gameLogic.getWinner()) {
            alert(`Congratulations, ${gameLogic.getCurrentPlayer()} wins!`);
        } else if (gameLogic.isDraw()) {
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
        setTimeout(() => {gameLogic.isGameOver() ? endGame() : null}, 10); 
    }

    function getCheckedValue (selectors) {
        return Array.from(selectors).find((input) => input.checked).value;
    }

    function flipRadioValue(radio) {
        Array.from(radio).find((button) => !button.checked).checked = true;
    }

    function preventSameToken(player1Radio, player2Radio) {
        const allRadio = [player1Radio, player2Radio]

        for (let radio of allRadio) {
            radio.forEach((button) => {
                button.addEventListener('change', (e) => { 
                    radio === allRadio[0]
                        ? flipRadioValue(allRadio[1])
                        : flipRadioValue(allRadio[0]);
                })
            })
        }
    }

    function removeStartButton() {
        const startButton = doc.querySelector('.start-game');
        if (startButton) startButton.hidden = true;
    }

    function addGameButtons() {
        const restartButton = doc.querySelector('.restart-game');
        const newGameButton = doc.querySelector('.new-game');
        restartButton.hidden = false;
        newGameButton.hidden = false;
    }

    function outputPlayerInfo() {
        console.log(doc.querySelector('.player1-name.output'));
        console.log(gameLogic.getAllPlayersObject().playerA.name);
        console.log(gameLogic.getAllPlayersObject().playerB.name);
        doc.querySelector('.player1-name.output').textContent = gameLogic.getAllPlayersObject().playerA.name;
        doc.querySelector('.player1-token.output').textContent = gameLogic.getAllPlayersObject().playerA.getToken();
        doc.querySelector('.player2-name.output').textContent = gameLogic.getAllPlayersObject().playerB.name;
        doc.querySelector('.player2-token.output').textContent = gameLogic.getAllPlayersObject().playerB.getToken();

    }

    function setUpDialogBox() {
        const player1Name = doc.querySelector('#player1Name');
        const player2Name = doc.querySelector('#player2Name');
        const player1Tokens = doc.querySelectorAll('input[name="player1Token"]');
        const player2Tokens = doc.querySelectorAll('input[name="player2Token"]');
        const form = doc.querySelector('.player-form');
        const beginButton = doc.querySelector('.begin');
        const cancelButton = doc.querySelector('.cancel');
        dialogBox.returnValue = 'default';
        
        preventSameToken(player1Tokens, player2Tokens);
        
        beginButton.addEventListener('click', (e) => {
            if (form.reportValidity()) {
                e.preventDefault();
                dialogBox.close('closed');
            }
        })

        dialogBox.addEventListener('close', () => {
            if (dialogBox.returnValue !== 'default') {
                gameLogic.setUpGame(player1Name.value, getCheckedValue(player1Tokens), 
                                        player2Name.value, getCheckedValue(player2Tokens));
                deleteDOMBoard();
                drawBoard();
                removeStartButton();
                addGameButtons();
                outputPlayerInfo();
            }
            
            form.reset(); // Clears input for next time dialog is opened
        })

        cancelButton.addEventListener('click', (e) => {
            dialogBox.returnValue = 'default';
            e.preventDefault();
            dialogBox.close();
        })
    }

    function addStartFeature() {
        const startButton = doc.querySelector('.start-game');
        startButton.addEventListener('click', () => dialogBox.showModal());
    }

    function addNewGameFeature() {
        const newGameButton = doc.querySelector('.new-game');
        newGameButton.addEventListener('click', () => {
            
            dialogBox.showModal();

        })

    }

    function start() {
        setUpDialogBox();
        addStartFeature();
        addRestartFeature();
        addNewGameFeature();
    }

    return {start};
})(document);

gameInDOM.start();

