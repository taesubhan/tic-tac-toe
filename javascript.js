/* Game board module */
const gameBoard = (function() {
    const board = []; // Array that represents game board and stores players' pieces
    const rows = 3;
    const cols = 3;

    /* Returns the current board */
    function getBoard() {
        return board;
    }
    
    /* Creates a nested array to represent the game board and inserts cell object that will store player's info */
    function createBoard() {
        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < cols; c++) {
                board[r].push(cell());
            }
        }
    } 

    /* Returns cell object based on the row and col of the board */
    function getCell(row, col) {
        return board[row][col];
    }

    /* Returns boolean of whether the cell object contains a player object already */
    function isCellTaken(cell) { // accepts cell object
        return Boolean(cell.getPlayerValue());
    }

    /* Returns boolean on whether move is valid according to the game's rule */
    function isValidMove(row, col) {
        return (typeof row === 'number' && typeof col === 'number') &&
                (row >= 0 && row < rows) &&
                (col >= 0 && col < cols) &&  
                !isCellTaken(board[row][col])
    }
    
    /* Stores a player object inside of a cell object to represent a player's piece being placed on a cell on the board */
    function placePlayerToken(row, col, player) { // accepts player object
        const boardCell = getCell(row, col);
        if(!isCellTaken(boardCell)) {
            boardCell.setPlayerValue(player);
        } 
    }

    /* Returns a Boolean of whether the board is full, in other words, every cell objects in 'board' array has a player object */
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

    /* Deletes all items within the 'board' array. Represents clearing of the game board */
    function deleteBoard() {
        while (board.length > 0) {
            board.pop();
        }
    }

    return {getBoard, createBoard, getCell, isCellTaken, isValidMove, placePlayerToken, isFull, deleteBoard};
})();

/* Game board cell factory function */
function cell() {
    let playerValue = null; // Stores player object

    /* Returns the player object of the cell if it exists */
    function getPlayerValue() {
        return playerValue;
    }

    /* Returns the token of the player object if player object exists inside cell instance */
    function getPlayerToken() {
        return Boolean(playerValue) 
            ? playerValue.getToken()
            : null;
    }

    /* Assigns a player object to this cell object instance. Represents a player's piece taking up this cell space */
    function setPlayerValue(player) {
        playerValue = player;
    }

    /* Removes player object from cell instance */
    function resetPlayerValue() {
        playerValue = null;
    }

    /* Return boolean of whether the cell contains a player object */
    function isEmpty() {
        return !Boolean(playerValue);
    }

    return {getPlayerValue, getPlayerToken, setPlayerValue, resetPlayerValue, isEmpty};
}

/* Player factory function */
function player(playerName, playerToken) {
    const name = playerName;
    const token = playerToken;
 
    function getToken() {
        return token;
    } 

    return {name, getToken};
}

/* Game logic and state module */
const gameLogic = (function() {
    let playerA;
    let playerB;
    let currentPlayer; // Player of the current turn

    /* Returns the player objects for both players */
    function getAllPlayersObject() {
        return {playerA, playerB};
    }
    
    /* Create board array and the 2 player objects */
    function setUpGame(player1Name, player1Token, player2Name, player2Token) {
        gameBoard.createBoard();
        playerA = player(player1Name, player1Token);
        playerB = player(player2Name, player2Token);
        currentPlayer = playerA;
    }

    /* Switches the 'currentPlayer' variable to the other player. Used to switch player after every turn */
    function switchPlayer() {
        currentPlayer === playerA
            ? currentPlayer = playerB
            : currentPlayer = playerA;
    }

    /* Places the current player's piece into the board based on the row and column input */
    function playerInput(rowInput, colInput) {
        if (!gameBoard.isValidMove(rowInput, colInput)) {
            return;
        }
        gameBoard.placePlayerToken(rowInput, colInput, currentPlayer);
        if (!isGameOver()) {
            switchPlayer();
        }
    }

    /* Returns the player of the current turn */
    function getCurrentPlayer() {
        return currentPlayer;
    }

    /* Deletes the current board array and creates a new board array with same player name and tokens */
    function restartBackEnd() {
        gameBoard.deleteBoard();
        setUpGame(playerA.name, playerA.getToken(), playerB.name, playerB.getToken());
    }

    /* Checks if each player item in the inputted array are the same */
    function isSamePlayer(array) {
        const result =  array.every(item => {
            return item.getPlayerValue() !== null &&
                    item.getPlayerValue() === array[0].getPlayerValue()});
        return result;
    }

    /* Returns boolean on whether game is a draw */
    function isDraw() {
        return gameBoard.isFull() && !getWinner();
    }

    /* Checks if game ended based on whether game is a draw or one of the player won */
    function isGameOver() {
        return isDraw() || Boolean(getWinner());
    }

    /* Checks if any player has won the game and returns that player object. If neither has won, then returns null */
    function getWinner() {
        const board = gameBoard.getBoard();
        const rows = board.length;
        const cols = board[0].length;
        
        //checks for matching rows
        for (let r = 0; r < rows; r++) {
            if (isSamePlayer(board[r])) {
                return board[r][0].getPlayerValue();
            }
        }

        //checks for matching columns
        for (let c = 0; c < cols; c++) {
            let column = [];
            for (let r = 0; r < rows; r++) {
                column.push(board[r][c]);
            }
            if (isSamePlayer(column)) {
                return board[0][c].getPlayerValue();
            }
        }

        //checks for matching diagonals
        let backward = [];
        let forward = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (r === c) {
                    backward.push(board[r][c]); // Adds cell into array if they are located in the horizontal line (\)
                }
                if ((r + c) === (rows - 1)) {
                    forward.push(board[r][c]); // Adds cell into array if they are located in the horizontal line (/)
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

    return {getAllPlayersObject, setUpGame, playerInput, isGameOver, getCurrentPlayer, restartBackEnd, getWinner, isDraw};
})();

/* DOM manipulating modules */
const gameInDOM = (function(doc) {
    let boardDOM = doc.querySelector('.game-board');
    const dialogBox =  doc.querySelector('#game-dialog');

    /* Displays the game board on the DOM using the 'board' array from the board module */
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

    /* Changes the color of the game outcome message by adding a particular CSS class dependant on the winning player*/
    function changeOutputColor(outputDOM, winner) {
        const options = {'d':'draw', 'X': 'tokenX', 'O': 'tokenO'};
        if (winner in options) {
            for (let o in options) {
                if (o === winner) {
                    outputDOM.classList.add(options[o]);
                }
                else {
                    outputDOM.classList.remove(options[o]);
                }
            }
        }

    }

    /* Displays a text on the webpage to announce the winner of the game or whether it was a draw */
    function displayWinner() {
        const winnerOutput = doc.querySelector('.winner-output');

        if (gameLogic.isDraw()) {
            winnerOutput.textContent = `Draw!`;
            changeOutputColor(winnerOutput, 'd');
        } else if (gameLogic.getWinner()) {
            winnerOutput.textContent = `${gameLogic.getCurrentPlayer().name} wins!`;
            changeOutputColor(winnerOutput, gameLogic.getCurrentPlayer().getToken());
        }
    }

    /* Removes event listeners for each cell in board. This is used after a game is won, so player's can't 
    interact with the board anymore */ 
    function removeAllClickEvent() {
        for (const child of boardDOM.children) {
            child.removeEventListener('click', addPlayerToken);
        }
    }

    /* Runs other functions that outputs the winning player of the game and prevents board to be interacted with */
    function endGame() {
        displayWinner();
        removeAllClickEvent();
    }

    /* Removes the board on the DOM */
    function deleteDOMBoard() {
        while (boardDOM.firstChild) {
            boardDOM.removeChild(boardDOM.firstChild);
        }
    }

    /* Removes the game output text in the webpage */
    function removeGameOutput() {
        doc.querySelector('.winner-output').textContent = '';
    }

    /* Restarts the game by deleting the game board on the front-end and back-end and creates a new fresh board */
    function restart() {
        deleteDOMBoard();
        gameLogic.restartBackEnd();
        removeGameOutput();
        drawBoard();
    }

    /* Places a player object into a cell of the board based on the DOM element inputted. Ran when player
    clicks on a cell, running this function */
    function addPlayerToken(e) {
        const row = parseInt(e.target.getAttribute('row'));
        const col = parseInt(e.target.getAttribute('col'));
        
        if (gameBoard.isValidMove(row, col)) {
            gameLogic.playerInput(row, col);
            const token = gameBoard.getCell(row, col).getPlayerToken();
            e.target.textContent = token;
            e.target.classList.add(`token${token}`);
        }
        setTimeout(() => {gameLogic.isGameOver() ? endGame() : null}, 10); 
    }

    /* Retrieves the checked value of the radio question from the dialog box (X or O) */
    function getCheckedValue (selectors) {
        return Array.from(selectors).find((input) => input.checked).value;
    }

    /* Switches the radio option from X to O or vice versa */
    function flipRadioValue(radio) {
        Array.from(radio).find((button) => !button.checked).checked = true;
    }

    /* Prevents the 2 radio buttons in the dialog box from having the same value. If one is changed, the other 
    is changed too */
    function preventSameToken(player1Radio, player2Radio) {
        const allRadio = [player1Radio, player2Radio]

        for (let radio of allRadio) {
            radio.forEach((button) => {
                button.addEventListener('change', () => { 
                    radio === allRadio[0]
                        ? flipRadioValue(allRadio[1])
                        : flipRadioValue(allRadio[0]);
                })
            })
        }
    }

    /* Removes the initial 'Play Game' button. Function is ran after the button is clicked and dialog box submitted */
    function removeStartButton() {
        const startButton = doc.querySelector('.play-game');
        if (startButton) startButton.hidden = true;
    }

    /* Reveals the 'Play Again' and 'New Game' button after the game is started */
    function addGameButtons() {
        const restartButton = doc.querySelector('.restart-game');
        const newGameButton = doc.querySelector('.new-game');
        restartButton.hidden = false;
        newGameButton.hidden = false;
    }

    /* Displays the box that shows the players name and token */
    function outputPlayerInfo() {
        doc.querySelector('.player1-title').hidden = false;
        doc.querySelector('.player2-title').hidden = false;

        doc.querySelector('.player1-name.output').textContent = gameLogic.getAllPlayersObject().playerA.name;
        doc.querySelector('.player1-token.output').textContent = `(${gameLogic.getAllPlayersObject().playerA.getToken()})`;
        doc.querySelector('.player2-name.output').textContent = gameLogic.getAllPlayersObject().playerB.name;
        doc.querySelector('.player2-token.output').textContent = `(${gameLogic.getAllPlayersObject().playerB.getToken()})`;
    }

    /* Adds CSS styling to game board and player information display box */
    function addBoardAndDisplayStyle() {
        boardDOM.classList.add('game-board-style');
        doc.querySelector('.player-display').classList.add('player-display-style');
    }

    /* Creates and structures the dialog box used to define players' name and token prior to the start of the game */
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
        
        /* Adds event listener to the "Begin" button in the dialog box to start game based on the dialog box input */
        beginButton.addEventListener('click', (e) => {
            if (form.reportValidity()) {
                e.preventDefault();
                dialogBox.close('closed');
            }
        })

        /* Sets up a new board for a new game with new information whenever the dialog box closes 
        from clicking on "Begin" button */
        dialogBox.addEventListener('close', () => {
            if (dialogBox.returnValue !== 'default') {
                gameLogic.setUpGame(player1Name.value, getCheckedValue(player1Tokens), 
                                        player2Name.value, getCheckedValue(player2Tokens));
                deleteDOMBoard();
                drawBoard();
                removeStartButton();
                addGameButtons();
                outputPlayerInfo();
                removeGameOutput();
                addBoardAndDisplayStyle()
            }
            
            form.reset(); // Clears input for next time dialog is opened
        })

        /* Adds event listener to the "Cancel" button in the dialog box to close the dialog box without any specific
        actions being taken place onto the board */
        cancelButton.addEventListener('click', (e) => {
            dialogBox.returnValue = 'default';
            e.preventDefault();
            dialogBox.close();
        })
    }

    /* Adds event listener to the 'Play Game' button to display the dialog button on click */
    function addStartFeature() {
        const startButton = doc.querySelector('.play-game');
        startButton.addEventListener('click', () => dialogBox.showModal());
    }

    /* Adds event listener to the 'New Game' button to display the dialog box on click, after the initial 'Play Game'
    button is clicked */
    function addNewGameFeature() {
        const newGameButton = doc.querySelector('.new-game');
        newGameButton.addEventListener('click', () => {
            dialogBox.showModal();
        })
    }

    /* Starts the game script */
    function start() {
        setUpDialogBox();
        addStartFeature();
        addRestartFeature();
        addNewGameFeature();
    }

    /* Adds event listener to the 'Play Again' button to run the restart() function on click */
    function addRestartFeature() {
        const restartButton = doc.querySelector('.restart-game');
        restartButton.addEventListener('click', restart);
    }

    return {start};
})(document);

gameInDOM.start();

