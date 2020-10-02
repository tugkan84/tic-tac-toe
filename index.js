const express = require('express');
const bodyParser = require("body-parser");
var session = require('express-session');
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())
app.use(express.static("www"));
app.use(session({ secret: 'SuperSecretKey', cookie: { maxAge: 60000 } }))

app.post("/user/:uname", (req, res) => {
    res.end("Hello " + req.params.uname);
});

app.post("/user/:uname", (req, res) => {
    res.end("Hello " + req.params.uname);
});

app.post("/move", (req, res) => {
    
    var coordinateX = parseInt(req.body.x);
    var coordinateY = parseInt(req.body.y);
    var user = req.body.user;
    var sessionBoard = null;

   var cookie = req.cookies.refreshed;
   if(cookie != undefined && cookie == 'true'){
    res.cookie('refreshed' , 'false');
    req.session.board= undefined;
   }

    if (req.session.board) { //if board is empty it means new game
        sessionBoard = req.session.board;
    } else { //session is empty new game
        sessionBoard = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        req.session.board = sessionBoard;
    }

    if (sessionBoard[coordinateX][coordinateY] === null) {
        sessionBoard[coordinateX][coordinateY] = 'X';
    } else {
        res.send({ error: "Selected Node can't be re-selected" });
        return;
    }
    var isWinner = checkWinner(sessionBoard);
    if (isWinner != null) {
        res.send({ result: isWinner });
        req.session.destroy();
        return;
    }

    //Computer makes its move...
    var nextMove = NextMove(sessionBoard);
    sessionBoard[nextMove.x][nextMove.y] = "O"
    req.session.board = sessionBoard;
    console.log(nextMove);
    var isWinner = checkWinner(sessionBoard);
    if (isWinner != null) {
        res.send({ result: isWinner , move: nextMove });
        req.session.destroy();
        return;
    }
    res.send({ move: nextMove });
});

app.get("/clear",(req,res)=>{
    req.session.destroy();
    res.send();
});

function isEqual(node1, node2, node3) {
    return node1 == node2 && node2 == node3 && node1 != null;
}

function checkWinner(gameBoard) {

    for (let x = 0; x < 3; x++) {

        if (isEqual(gameBoard[x][0], gameBoard[x][1], gameBoard[x][2])) {
            return gameBoard[x][0];
        }
    }

    for (let y = 0; y < 3; y++) {

        if (isEqual(gameBoard[0][y], gameBoard[1][y], gameBoard[2][y])) {
            return gameBoard[0][y];
        }
    }

    if (isEqual(gameBoard[0][0], gameBoard[1][1], gameBoard[2][2])) {
        return gameBoard[0][0];
    }

    if (isEqual(gameBoard[2][0], gameBoard[1][1], gameBoard[0][2])) {
        return gameBoard[1][1];
    }

    //LastCheck
    var emptyNode = false;
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (gameBoard[x][y] == null) {
                emptyNode = true;
            }
        }
    }

    if (emptyNode) {
        return null;
    } else {
        return "T";
    }
}

let points = {
    "X": -10,
    "O": +10,
    "T": 0
};

function minimax(board, isMaximizing) {
    let result = checkWinner(board);
    if (result !== null) {
        return points[result];
    }

    let bestScore = -Infinity;
    if (!isMaximizing) {
        bestScore = Infinity;
    }

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            // Is the spot available?
            if (board[x][y] == null) {
                if (isMaximizing) {
                    board[x][y] = "O";
                } else {
                    board[x][y] = "X";
                }
                let score = minimax(board, !isMaximizing);
                board[x][y] = null;
                if (isMaximizing) {
                    bestScore = Math.max(score, bestScore);
                } else {
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
    }
    return bestScore;
}

function NextMove(board) {
    // AI to make its turn
    let bestScore = -Infinity;
    let coordinate;
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            // Is the spot available?
            if (board[x][y] == null) {
                board[x][y] = "O";
                let score = minimax(board, false);
                board[x][y] = null;
                if (score > bestScore) {
                    bestScore = score;
                    coordinate = { x, y };
                }
            }
        }
    }
    return coordinate;
}
var port = process.env.PORT || parseInt(process.argv.pop()) || 3000;

app.listen(port, () => console.log('Example app listening on port ' + port + '!'));