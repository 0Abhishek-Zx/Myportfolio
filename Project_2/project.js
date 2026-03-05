window.addEventListener('load', function () {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');
  let tileSize = 100;
  let board;

  function initializeBoard() {
    board = [
      ['', new Piece(0, 1, 'red'), '', new Piece(0, 3, 'red'), '', new Piece(0, 5, 'red'), '', new Piece(0, 7, 'red')],
      [new Piece(1, 0, 'red'), '', new Piece(1, 2, 'red'), '', new Piece(1, 4, 'red'), '', new Piece(1, 6, 'red'), ''],
      ['', new Piece(2, 1, 'red'), '', new Piece(2, 3, 'red'), '', new Piece(2, 5, 'red'), '', new Piece(2, 7, 'red')],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      [new Piece(5, 0, 'grey'), '', new Piece(5, 2, 'grey'), '', new Piece(5, 4, 'grey'), '', new Piece(5, 6, 'grey'), ''],
      ['', new Piece(6, 1, 'grey'), '', new Piece(6, 3, 'grey'), '', new Piece(6, 5, 'grey'), '', new Piece(6, 7, 'grey')],
      [new Piece(7, 0, 'grey'), '', new Piece(7, 2, 'grey'), '', new Piece(7, 4, 'grey'), '', new Piece(7, 6, 'grey'), ''],
    ];
  }

  function drawBoard() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? 'white' : 'black';
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }

  function drawPieces() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let piece = board[row][col];
        if (piece instanceof Piece) {
          if (piece.isClicked) {
            let x = piece.col * 100 + 50;
            let y = piece.row * 100 + 50;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, 2 * Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();
            ctx.closePath();
          }
          piece.draw(ctx);
        }
      }
    }
  }

  canvas.addEventListener('click', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const row = Math.floor(y / tileSize);
    const col = Math.floor(x / tileSize);
    const clickedPiece = board[row][col];
    const selectedPiece = getSelectedPiece();

    if (clickedPiece instanceof Piece) {
      if (selectedPiece) {
        selectedPiece.isClicked = false;
      }
      if (selectedPiece !== clickedPiece) {
        clickedPiece.isClicked = true;
      }
      drawBoard();
      drawPieces();
    } else {
      if (selectedPiece && selectedPiece.isValidMove(row, col, board)) {
        if (Math.abs(row - selectedPiece.row) === 2) {
          const middleRow = (selectedPiece.row + row) / 2;
          const middleCol = (selectedPiece.col + col) / 2;
          board[middleRow][middleCol] = '';
        }
        board[selectedPiece.row][selectedPiece.col] = '';
        selectedPiece.move(row, col);
        board[row][col] = selectedPiece;
        selectedPiece.isClicked = false;
        drawBoard();
        drawPieces();
      }
    }
  });

  function getSelectedPiece() {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        let piece = board[row][col];
        if (piece instanceof Piece && piece.isClicked) {
          return piece;
        }
      }
    }
    return null;
  }

  initializeBoard();
  drawBoard();
  drawPieces();
});

function Piece(row, col, color) {
  this.row = row;
  this.col = col;
  this.color = color;
  this.isClicked = false;
  this.isKing = false;

  this.draw = function (ctx) {
    let x = this.col * 100 + 50;
    let y = this.row * 100 + 50;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    if (this.isKing) {
      ctx.beginPath();
      ctx.arc(x - 10, y - 10, 5, 0, 2 * Math.PI);
      ctx.arc(x + 10, y - 10, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI, false);
      ctx.strokeStyle = 'white';
      ctx.stroke();
      ctx.closePath();
    }
  }

  this.checkKing = function () {
    if (this.color === 'red' && this.row === 7) {
      this.isKing = true;
    } else if (this.color === 'grey' && this.row === 0) {
      this.isKing = true;
    }
  }

  this.move = function (newRow, newCol) {
    this.row = newRow;
    this.col = newCol;
    this.checkKing();
  };

  this.isValidMove = function (newRow, newCol, board) {
    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
      return false;
    }

    if ((newRow + newCol) % 2 === 0) {
      return false;
    }

    if (board[newRow][newCol] instanceof Piece) {
      return false;
    }

    let direction = (this.color === 'red' || this.isKing) ? 1 : -1;

    if (Math.abs(newRow - this.row) === 1 && Math.abs(newCol - this.col) === 1) {
      if (this.isKing || newRow === this.row + direction) {
        return true;
      }
    }

    if (Math.abs(newRow - this.row) === 2 && Math.abs(newCol - this.col) === 2) {
      let middleRow = (this.row + newRow) / 2;
      let middleCol = (this.col + newCol) / 2;
      let middlePiece = board[middleRow][middleCol];
      if (middlePiece instanceof Piece && middlePiece.color !== this.color) {
        return true;
      }
    }

    return false;
  }
}
