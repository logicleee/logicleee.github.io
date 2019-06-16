function Piece (type, rotation = 0, gridSize = [10,20], indexOffset = 3) {

  function resizeIndex(index, oldXmax, newXmax) {
    return ((Math.floor(index / oldXmax)) * newXmax) + (index % oldXmax);
  };

  function getCurrentPiece (p) {
    return p.allBlocksIR[p.indexOffset][p.rotation].blocks; };
  function getCurrentIsValid (p) {
    return p.allBlocksIR[p.indexOffset][p.rotation].isValid; };
  function getCurrentOffsetXY (p) {
    return p.allBlocksIR[p.indexOffset][p.rotation].offsetXY; };
  function toggleNormalMode (p) {
    while (! p.normalMode && p.isValid === false && p.indexOffset > 0) {
      p.left();
    }
    p.normalMode = ! p.normalMode;
    return p.normalMode;
  }

  function incrementIndexBy (p, x) {
    const i = p.indexOffset;
    const newI = i + x;
    const r = p.rotation;

    if (! p.allBlocksIR[newI] || ! p.allBlocksIR[newI][r])
      return i;

    const px = p.allBlocksIR[i][r].offsetXY[0];
    const newPX = p.allBlocksIR[newI][r].offsetXY[0];
    const newPIsValid = p.allBlocksIR[newI][r].isValid;
    const newPIsInBounds = p.allBlocksIR[newI][r].isInBounds;

    if (p.normalMode) {
      if ((px != newPX) || (! newPIsValid))
        return i;
    }

    if (! newPIsInBounds)
      return i;
    return newI;
  };

  function incrementIndexByRows (p,x) {
    const i = p.indexOffset;
    const newI = i + (x * p.gridSize[0]);
    const r = p.rotation;
    if (! p.allBlocksIR[newI] || ! p.allBlocksIR[newI][r])
      return i;
    const py = p.allBlocksIR[i][r].offsetXY[1];
    const newPY = p.allBlocksIR[newI][r].offsetXY[1];
    const newPIsValid = p.allBlocksIR[newI][r].isValid;
    const newPIsInBounds = p.allBlocksIR[newI][r].isInBounds;
    if (p.normalMode) {
      if ((py != newPY) || (! newPIsValid))
        return i;
    }
    if (! newPIsInBounds)
      return i;
    return newI;
  };

  function generateBlockData (origBlocks, blockSize, gridSize, boardGrid) {
    function reset ([x,y]) { return Array(x*y).fill({'color': 0}); }
    function blockNotEmpty (grid, index) {return grid[index].color > 0; }
    const blockMaxX = blockSize[0];
    const gridMaxX = gridSize[0];
    const gridMaxY = gridSize[1];
    const maxIndex = (gridMaxX * gridMaxY) - 1;
    const permutations = origBlocks.length;

    if (boardGrid.length === 0)
      boardGrid = reset(gridSize);

    let result = {};

    for (let i=0; i <= maxIndex; i++) {
      result[i] = [];
      for (let r=0; r < permutations; r++) {
        const oldMinRow = Math.floor(origBlocks[r][0] / blockMaxX);
        result[i][r] = {};
        result[i][r]['blocks'] = [];
        result[i][r]['isValid'] = true;
        result[i][r]['isEmpty'] = true;
        result[i][r]['isInBounds'] = true;

        for (let bI=0; bI < origBlocks[r].length; bI++) {
          const oldBi = resizeIndex(origBlocks[r][bI], blockMaxX, gridMaxX);
          const newBi = oldBi + i;
          result[i][r]['blocks'].push(newBi);
          const newMinRow = Math.floor(result[i][r]['blocks'][0]/ gridMaxX);
          const oldDelta =
                Math.floor(origBlocks[r][bI]/blockMaxX) - oldMinRow;
          const newDelta = Math.floor(newBi/gridMaxX) - newMinRow;

          if (bI === 0)
            result[i][r]['offsetXY'] =
            [Math.floor(newBi/gridMaxX), (newBi % gridMaxX)];

          if (newBi > maxIndex || oldDelta != newDelta)
            result[i][r]['isValid'] = false;
          if (newBi <= maxIndex && blockNotEmpty(boardGrid, newBi))
            result[i][r]['isEmpty'] = false;
          if (newBi > maxIndex || newBi < 0)
            result[i][r]['isInBounds'] = false;

        }

      }

    }

    return result;

  };

  // ================================================================== //
  this.type = type;
  const templates = new Pieces();

  let template = {
    'size':  templates.data[type].size.slice(),
    'allBlocks': templates.data[type].allBlocks.slice(),
    'color': templates.data[type].color
  };

  this.renderGrid = () => {
    const block = {'color': 0};
    function reset ([x,y]) { return Array(x*y).fill(block); }
    let result = reset(this.gridSize);
    this.blocks.forEach(b =>{
      result[b] = {'color': this.color};
    });

    return result;
  };

  this.normalMode = true; // allows left right commands to split blocks
  this.gridSize = gridSize;
  this.indexOffset = indexOffset;
  this.color = template.color;
  this.rotation = rotation;
  this.boardGrid = [];
  this.minIndex = 0;
  this.maxIndex = gridSize[0] * gridSize[1];

  //this.blocks = () => getCurrentPiece(this);
  this.isValid = () => getCurrentIsValid(this);
  this.getTemplateSize = () => template.size;

  this.toggleNormalMode = () => toggleNormalMode(this);

  this.resetPieceSpecs = ([type, rotation, gridSize, indexOffset]) => {
    this.type = type;
    this.rotation = rotation;
    this.gridSize = gridSize;
    //this.size = gridSize;
    this.minIndex = 0;
    this.maxIndex = gridSize[0] * gridSize[1];
    this.indexOffset = indexOffset;
    template = {
      'size':  templates.data[type].size.slice(),
      'allBlocks': templates.data[type].allBlocks.slice(),
      'color': templates.data[type].color
    };
    this.color = template.color;
  };

  this.getPieceSpecs = () => {
    return [this.type ,
            this.rotation,
            this.gridSize,
            this.indexOffset];
  };

  this.rotate = () => {
    const i = this.indexOffset;
    let r;
    this.rotation < 3 ? r = this.rotation + 1 : r = 0;
    if (this.allBlocksIR[i][r].isValid || ! this.normalMode)
      return this.update(this, i, r);
    return false;
  };

  this.left = (x = 1) => {
    return this.update(this, incrementIndexBy(this,-1 * x));};

  this.right = (x = 1) => {
    return this.update(this, incrementIndexBy(this,x));};

  this.up = (x = 1) => {
    return this.update(this, incrementIndexByRows(this,-1 * x));};

  this.down = (x = 1) => {
    return this.update(this, incrementIndexByRows(this,x));};

  this.update = function (piece = this,
                          i = this.indexOffset,
                          r = this.rotation) {
    if (! piece.allBlocksIR[i][r].blocks)
      return false;

    piece.indexOffset = i;
    piece.rotation = r;
    piece.blocks = piece.allBlocksIR[i][r].blocks;
    piece.offsetXY = piece.allBlocksIR[i][r].offsetXY;
    piece.isValid = piece.allBlocksIR[i][r].isValid;
    piece.isInBounds = piece.allBlocksIR[i][r].isInBounds;
    return true;
  };

  this.generateBlockData = function (w = template.allBlocks,
                                     x = template.size,
                                     y = this.gridSize,
                                     z = this.boardGrid) {
    this.allBlocksIR =  generateBlockData(w,x,y,z);
    const i = this.indexOffset;
    const r = this.rotation;
    this.blocks = this.allBlocksIR[i][r].blocks;
    this.offsetXY = this.allBlocksIR[i][r].offsetXY;
    this.isValid = this.allBlocksIR[i][r].isValid;
    this.isInBounds = this.allBlocksIR[i][r].isInBounds;
  };

}

function Pieces (gridSize = [10,20], indexOffset = 3) {
   this.data = {
    "i": {
      "allBlocks": [[1,5,9,13], [4,5,6,7], [2,6,10,14], [8,9,10,11]],
      "size": [4,4],
      "color": 2
    },
    "j": {
      "allBlocks": [[1,5,8,9], [0,4,5,6], [1,2,5,9], [0,1,2,6]],
      "size": [4,4],
      "color": 3
    },
    "l": {
      "allBlocks": [[1,5,9,10], [4,5,6,8], [0,1,5,9], [2,4,5,6]],
      "size": [4,4],
      "color": 4
    },
    "o": {
      "allBlocks": [[0,1,4,5], [0,1,4,5], [0,1,4,5], [0,1,4,5]],
      "size": [4,4],
      "color": 5
    },
    "s": {
      "allBlocks": [[5,6,8,9], [0,4,5,9], [1,2,4,5], [1,5,6,10]],
      "size": [4,4],
      "color": 6
    },
    "t": {
      "allBlocks": [[4,5,6,9], [1,4,5,9], [1,4,5,6], [1,5,6,9]],
      "size": [4,4],
      "color": 7
    },
    "z": {
      "allBlocks": [[4,5,9,10], [1,4,5,8], [0,1,5,6], [2,5,6,9]],
      "size": [4,4],
      "color": 8
    }
  };

  this.ordered = generateList(this.data);
  this.list = shuffle(this.ordered);
  this.getCurrentPiece = () => this.currentPiece;
  this.getNextPiece = () => this.nextPiece;

  this.shuffle = function() {
    if (! Array.isArray(this.shuffled))
      this.shuffled = [];
    //this.shuffled = this.shuffled.concat(shuffle(this.ordered));
    this.shuffled = shuffle(this.ordered).concat(this.shuffled);
  };

  this.refreshList = function() {
    if (this.shuffled.length < 3) {
      this.shuffle();
    }
    const p = this.shuffled.pop();
    this.currentPiece = new Piece(p.type, p.rotation,
                                  p.gridSize, p.indexOffset);
    const np = this.shuffled[this.shuffled.length - 1];
    /*
      this.nextPiece = new Piece(np.type, np.rotation,
      [4,4], np.indexOffset);
    */
      this.nextPiece = new Piece(np.type, np.rotation,
      [4,4], 0);

  };

  function generateList (p) {
    let result = [];
    const typeList = Object.keys(p);
    typeList.forEach(x => {
      const permutations = p[x].allBlocks.length;
      for (let i=0 ; i < permutations; i++) {
        result.push({type: x, rotation: i, 'gridSize': gridSize,
                     'indexOffset': indexOffset});
      };
    });
    return result;
  }

  function shuffle(array) {
    /*
      Implementing Fisher and Yates shuffle based on wikipedia:
      https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
    */
    let arr = array.slice();
    const swapInArr = (a,x,y) => [a[x], a[y]] = [a[y], a[x]];
    const len = arr.length;
    const randomInt = (min, max) =>
          Math.floor(min + (Math.random()*(max - min + 1)));
    let result = [];
    for (let i=arr.length - 1; i > 0; i--) {
      swapInArr(arr,randomInt(0, i - 1), i);
    }
    return arr;
  }

  this.init = () => {
    this.shuffle();
    this.currentPiece = {};
    this.nextPiece = [];
  };

  this.init();
}

function Board(size = [10,20]) {
  const block = {'color': 0};
  const [xMax,yMax] = size;
  function reset ([x,y]) { return Array(x*y).fill(block); }


  function blockNotEmpty (grid, index) {return grid[index].color > 0; }
  function clearRows (grid, newGrid, size, fn) {
    let oldGrid = grid.slice();
    let maxX = size[0];
    let blocksFull = maxX;
    let currRow = 0;
    let currOffset = 0;
    let newIndex = 0;
    let oldIndex, lastRow;

    while (oldGrid.length > 0) {
      oldIndex = oldGrid.length - 1;
      newIndex = oldIndex + (currOffset * maxX);
      newGrid[newIndex] = oldGrid.pop();
      currRow = Math.floor(oldIndex / maxX);

      if (lastRow != currRow) {
        lastRow = currRow;
        blocksFull = maxX;
      }

      if (fn(grid,oldIndex)) {
        blocksFull -= 1;
      }

      if (blocksFull === 0) {
        currOffset += 1;
        blocksFull = maxX;
      }

    }

    return {'grid': newGrid,
            'rowsCleared': currOffset
           };

  };

  this.score = new Score();

  this.size = [xMax, yMax];
  //const blankGrid = () => reset([xMax, yMax]); //new
  this.grid = reset(this.size);

  this.fits = (g) => {
    if (g === undefined) // if passed undefined, return undefined
      return undefined;
    for (let i = 0; i < g.length; i++) {
      if ( (! this.grid[g[i]]) || this.grid[g[i]].color != 0) {
        return false;  // if calculated OOB, return false
      }
    };
    return true;  // if in bounds, return true
  };


  this.overlay = function (piece) {
    let result = this.grid.slice();
    piece.blocks.forEach(b =>{
      result[b] = {'color': piece.color};
    });

    return result;
  };

  this.update = function (piece) {
    //FIX/REMOVE hardDrop doesn't do anything
    let hardDrop=false;
    const overlay = this.overlay(piece);
    const newRowsObject =
          clearRows(overlay,reset(this.size),this.size, blockNotEmpty);
    this.grid = newRowsObject.grid;
    this.score.awardPoints(newRowsObject.rowsCleared);

    return {
      'boardUpdated': true,
      'rowsCleared': newRowsObject.rowsCleared,
      'hardDrop': hardDrop,
      'grid': this.grid.slice(),
    };
  };

  this.clearRows = (grid, newGrid, size, fn) =>
    clearRows(grid, newGrid, size, fn);
};

function Controller () {
  const boardSize = [10,20];
  let canvasSize = [225, 450];
  let board = new Board(boardSize);
  let pieces = new Pieces(boardSize);
  pieces.refreshList();
  let ui = new UI(boardSize, canvasSize);
  let piece = pieces.getCurrentPiece();
  piece.generateBlockData();
  let nextPiece = pieces.getNextPiece();
  nextPiece.generateBlockData();

  let pieceData = [];
  let playingGame = false;
  let boardChanged = true;
  let scoreChanged = true;
  let eventQueue = [];
  let timeDelta = 0;
  let step = 1;
  let speed = {inital: 1, min: .1, multiplier: .1};
  let settings;
  let recentTouches = [];

  this.updateStep = () => {
    const l = Math.floor(board.score.clearedLines / 10);
    const s = speed;
    step = Math.max(s.inital - (s.multiplier * l), s.min);
  };

  const timeStamp = () => new Date().getTime();
  const randomInt = (min, max) =>
        Math.floor(min + (Math.random()*(max - min + 1)));
  const sleep = (ms) =>
          new Promise(resolve => setTimeout(resolve, ms));

  let textGrid = ''; // TODO get rid of this!
  // for testing START
  this.board = () => board;
  this.piece = () => piece;
  this.pieceData = () => pieceData;
  this.pieces = () => pieces;
  this.eventQueue = () => eventQueue;
  // for testing END

  this.getNextPieceGrid = () => board.overlay(this.nextPiece);

  function handle(event) {
    switch (event) {
    case 'moveLeft': move('left'); break;
    case 'moveRight': move('right'); break;
    case 'moveUp': move('up'); break;
    case 'moveDown': move('down'); break;
    case 'awardDrop': board.score.awardDrop(); break;
    case 'moveRotate': move('rotate'); break;
    case 'toggleNormalMode': piece.toggleNormalMode(); break;
    case 'pauseGame':
      playingGame = playGame(false);
      ui.modalIsVisible(true);
      break;
    case 'startGame':
      settings = ui.currentSettings();
      ui.setState(settings.uiMode);
      playingGame = playGame(true);
      ui.modalIsVisible(false);
      let uiSettings = ui.currentSettings();
      piece.normalMode =  (uiSettings.playMode === 'normalMode');
      break;
    case 'togglePlayingGame':
      if (playingGame != true)
        eventQueue.push('startGame');
      else
        eventQueue.push('pauseGame');
      break;
    };
  }

  function move (event) {
    let currentGrid = [];
    let boardEvent;
    switch (event) {
    case 'left':
      piece.left();
      if (board.fits(piece.blocks)) {
        pieceData.push(piece.getPieceSpecs());
        currentGrid = board.overlay(piece);
        textGrid = currentGrid;
        console.log(pieceData[pieceData.length -1]);
        boardChanged = true;
      } else {
        piece.resetPieceSpecs(pieceData[pieceData.length - 1]);
      }
      break;
    case 'right':
      piece.right();
      if (board.fits(piece.blocks)) {
        pieceData.push(piece.getPieceSpecs());
        currentGrid = board.overlay(piece);
        textGrid = currentGrid;
        console.log(pieceData[pieceData.length -1]);
        boardChanged = true;
      } else {
        piece.resetPieceSpecs(pieceData[pieceData.length - 1]);
      }
      break;
    case 'up':
      piece.up();
      if (board.fits(piece.blocks)) {
        pieceData.push(piece.getPieceSpecs());
        currentGrid = board.overlay(piece);
        textGrid = currentGrid;
        console.log(pieceData[pieceData.length -1]);
        boardChanged = true;
      } else {
        piece.resetPieceSpecs(pieceData[pieceData.length - 1]);
      }
      break;
    case 'down':
      const oldOffset = piece.indexOffset;
      piece.down();
      const newOffset = piece.indexOffset;
      if (oldOffset != newOffset && board.fits(piece.blocks)) {
        pieceData.push(piece.getPieceSpecs());
        currentGrid = board.overlay(piece);
        textGrid = currentGrid;
        console.log(pieceData[pieceData.length -1]);
        boardChanged = true;
      } else if (oldOffset <= piece.gridSize[1]){
        endGame();
      } else {
        piece.resetPieceSpecs(pieceData[pieceData.length - 1]);
        piece.generateBlockData();
        boardEvent = board.update(piece);
        boardChanged = boardEvent.boardChanged;
        scoreChanged = boardEvent.scoreChanged;
        pieces.refreshList();
        piece = pieces.getCurrentPiece();
        piece.generateBlockData();
        nextPiece = pieces.getNextPiece();
        nextPiece.generateBlockData();
        eventQueue = [];
        // FIX THIS
        let uiSettings = ui.currentSettings();
        piece.normalMode = (uiSettings.playMode === 'normalMode');
      }
      break;
    case 'rotate':
      piece.rotate();
      pieceData.push(piece.getPieceSpecs());
      currentGrid = board.overlay(piece);
      textGrid = currentGrid;
      console.log(pieceData[pieceData.length -1]);
      boardChanged = true;
      break;
    }
  }

  /*
    */
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
  function keydown (kbEvent) {
    let handled = false;
    console.log('pressed', kbEvent.code);
    if (playingGame) {
      switch (kbEvent.code) {
      case 'KeyK': eventQueue.push('moveUp'); handled = true; break;
      case 'KeyJ':
      case 'ArrowDown':
        eventQueue.push('moveDown');
        eventQueue.push('awardDrop');
        handled = true;
        break;
      case 'KeyH':
      case 'ArrowLeft': eventQueue.push('moveLeft'); handled = true; break;
      case 'KeyL':
      case 'ArrowRight': eventQueue.push('moveRight'); handled = true; break;
      case 'KeyR':
      case 'ArrowUp': eventQueue.push('moveRotate'); handled = true; break;
      case 'KeyN': eventQueue.push('toggleNormalMode'); handled = true; break;
      }
    }
    if (kbEvent.code === 'Space' || kbEvent.code === 'Escape'){
      eventQueue.push('togglePlayingGame');
      handled = true;
    }
    if (handled)
      kbEvent.preventDefault();
  }

  function windowOnClick(event) {
    let modal = document.querySelector(".modal");
    let openModal = document.querySelector(".open-modal");
    let closeModal = document.querySelector(".close-button");

    switch (event.target) {
    case openModal:
      eventQueue.push('pauseGame');
      break;
    case closeModal:
      eventQueue.push('startGame');
      break;
    case modal:
      eventQueue.push('startGame');
      break;
    }
  }

  function playGame (playingGame) {
    if (playingGame) {
      ui.setState('playing');
      return true;
    } else {
      ui.setState('paused');
      return false;
    }
  }

  function endGame () {
    playingGame = false;
    reset();
  }

  function run () {
    let canvas = '';
    let now=last=0;


    function frame () {
      now = timeStamp();
      update(Math.min(1, (now - last) / 1000.0));
      ui.draw(boardChanged, textGrid, board.size, canvasSize,
              nextPiece.renderGrid());
      boardChanged = ui.getBoardUIisUpdated();
      last = now;
      sleep(50).then(() => {
        if (playingGame)
          ui.updateScore(board.score.current, board.score.clearedLines);
            requestAnimationFrame(frame, canvas);
      });
    }

    now = timeStamp();
    last = now;

    resize();
    reset();
    addAllEventListeners();
    frame();
  }

  function addAllEventListeners() {
    let el = document.getElementById("tetris");
    el.addEventListener("touchstart", handleTouchStart, false);
    el.addEventListener("touchmove", handleTouchMove, false);
    el.addEventListener("touchend", handleTouchEnd, false);

    document.addEventListener('keydown', keydown, false);
    window.addEventListener('resize', resize, false);
    window.addEventListener('click', windowOnClick);
  }

  const copyTouch = (t) => { return { pageX: t.pageX, pageY: t.pageY }; };

  function handleTouchMove(evt) {
    evt.preventDefault();
  }

  function handleTouchStart(evt) {
    const el = document.getElementsByTagName("canvas")[0];
    const ctx = el.getContext("2d");
    let touches = evt.changedTouches;

    recentTouches.push(copyTouch(touches[touches.length - 1]));
  };

  function handleTouchEnd(evt) {
    const el = document.getElementsByTagName("canvas")[0];
    const ctx = el.getContext("2d");
    let touches = evt.changedTouches;
    let modal = document.querySelector(".modal");
    let openModal = document.querySelector(".open-modal");
    let closeModal = document.querySelector(".close-button");
    let gameBoardDiv = document.querySelector('.gameBoardDiv');

    function determineDirection (m) {
      let result;
      switch (true) {
      case m.deltaX === 0 && m.deltaY === 0:
        result = "STATIC";
        break;
      case Math.abs(m.deltaX) > Math.abs(m.deltaY) && m.deltaX >= 0:
        result = "LEFT";
        break;
      case Math.abs(m.deltaX) > Math.abs(m.deltaY):
        result = "RIGHT";
        break;
      case m.deltaY > 0:
        result = "UP";
        break;
      default:
        result = "DOWN";
        break;
      }
      return result;
    }

    recentTouches.push(copyTouch(touches[touches.length - 1]));

    const end = recentTouches.pop();
    const start = recentTouches.pop();
    let movement = {
      deltaX: start.pageX - end.pageX,
      deltaY: start.pageY - end.pageY,
    };

    movement.dir = determineDirection(movement);
    console.log('swipe event:', movement.dir, movement);

    let handled = false;
    if (playingGame) {
      switch (movement.dir) {
      case 'DOWN':
        eventQueue.push('awardDrop');
        for (let i = 0; i < Math.abs(movement.deltaY) / 80 ; i++) {
            eventQueue.push('moveDown');
        }
        handled = true;
        break;
      case 'LEFT': eventQueue.push('moveLeft'); handled = true; break;
      case 'RIGHT': eventQueue.push('moveRight'); handled = true; break;
      case 'UP': eventQueue.push('moveRotate'); handled = true; break;
      }
    }

    if (movement.dir === 'STATIC') {
      switch (evt.target) {
      case openModal:
        eventQueue.push('pauseGame');
        handled = true;
        break;
      case closeModal:
        eventQueue.push('startGame');
        handled = true;
        break;
      case gameBoardDiv:
        eventQueue.push('moveRotate');
        handled = true;
        break;
      case modal:
       eventQueue.push('startGame');
       break;
      }
    }

    if (handled)
      evt.preventDefault();
  };

  function update (idt) {
    if (playingGame) {
      timeDelta = timeDelta + idt;
    }
    handle(eventQueue.shift());
    if (timeDelta > step) {
      timeDelta = timeDelta - step;
      eventQueue.push('moveDown');
      this.updateStep();
    }
  }


  function resize() {
    let proportion = [225, 450];
    const padding = .9;

    let div = document.getElementById('tetris');

    const maxXY = [div.offsetWidth * padding / proportion[0],
                   div.offsetHeight * padding / proportion[1]];
    const factor = maxXY[0] > maxXY[1] ? maxXY[1] : maxXY[0];

    canvasSize = [Math.floor(proportion[0] * factor),
                  Math.floor(proportion[1] * factor)];
  }

  function reset () {
    ui = new UI(boardSize, canvasSize);
    ui.initUI();
    ui.setState('paused');
    board = new Board(boardSize);
    pieces = new Pieces(boardSize);

    pieces.refreshList();
    piece = pieces.getCurrentPiece();

    piece.generateBlockData();
    pieceData = [];
    playingGame = false;

  }




  // BEGIN FUNCTION
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
  }
  run();

}

function UI (gridSize, canvasSize = [225, 450]) {
  let boardNeedsUIrefresh = false;
  const nextPieceCanvasFactor = 6;
  const nextPieceCanvasSize = [Math.floor(canvasSize[1] / nextPieceCanvasFactor),
                               Math.floor(canvasSize[1] / nextPieceCanvasFactor)];
  const uiMode = {'text': 'text', 'canvas': 'canvas'};
  const gameMode = {'normal': 'normalMode', 'noBoundaries': 'noBoundaries'};
  let settings = {'uiMode': uiMode.canvas, 'gameMode': gameMode.normal};
  const colorScheme = {
    'slateBlueLight': '#3B5269',
    'slateBlue': '#34495e',
    'red': '#c0392b',
    'yellow': '#f1c40f',
    'purple': '#8e44ad',
    'darkBlue': '#2980b9',
    'teal': '#29eeee',
    'green': '#2ecc71',
    'orange': '#d35400',
  };

  const colors = ['slateBlueLight', 'slateBlue', 'red', 'yellow',
                  'purple', 'darkBlue', 'teal', 'green', 'orange'];

  const getColor = (n) => colorScheme[colors[n]];
  const getElementById = (id) => document.getElementById(id);
  const setElementInnerText = (id, text) => getElementById(id).innerText = text;

  function domElement (tag, parent = false,
                       id = false, classList = false, innerText = false) {
    let result = document.createElement(tag);
    if (id)
      result.id = id;
    if (innerText)
      result.innerText = innerText;
    if (classList)
      result.classList.add(classList);
    if (parent)
      parent.appendChild(result);
    return result;
  }

  function TableElement (parent = false, id = false, colWidths = [],
                         fixed = true, width = '100%') {

    let result = document.createElement('table');
    result.style.width = width;

    if (fixed)
      result.style.layout = 'fixed';

    if (id)
      result.id = id;

    if (colWidths.length) {
      colWidths.forEach((cv, index) => {
        let colId = false;
        if (id)
          colId = id + '-col-' + index;
        let newCol = new domElement('col', result, colId);
        newCol.style.width = cv;
      });

    }

    if (parent)
      parent.appendChild(result);

    return result;

  }

  function getRadioButtonValue (buttonName) {
    return Array.from(document.getElementsByName(buttonName))
          .filter(x => x.checked === true)
          .map(x => x.value)[0];
  }

  function getCurrentSettings () {
    return {
      'playMode': getRadioButtonValue('playMode'),
      'uiMode': getRadioButtonValue('uiMode')
    };
  }

  function RadioButtonAndLabel (parent = false, id = false, name = false,
                                value = false, checked = false, label = false) {

    let result = {'button': document.createElement('input')};
    result['button'].setAttribute('type', 'radio');

    if (id)
      result['button'].setAttribute('id', id);

    if (name)
      result['button'].setAttribute('name', name);

    if (value)
      result['button'].setAttribute('value', value);

    if (checked)
      result['button'].setAttribute('checked', checked);

    if (parent)
      parent.appendChild(result['button']);

    if (label) {
      result['label'] = document.createElement('label');
      if (id)
        result['label'].setAttribute('for', id);
      result['label'].innerText = label;
      if (parent)
        parent.appendChild(result['label']);
    }

    return result;

  }

  function initUI () {
    let tetrisParentDiv = getElementById('tetris');
    if (tetrisParentDiv.children[0])
      tetrisParentDiv.children[0].remove();
    let tetrisGame = new domElement('div', tetrisParentDiv, 'tetris-content',
                                   'tetris-row');

    let gameBoardDiv = new domElement('div', tetrisGame, 'gameBoardDiv',
                                     'tetris-col-md');
    let statsDiv = new domElement('div', tetrisGame, 'statsDiv',
                                  'tetris-col-md');
    let settingsWrapper = new domElement('div', statsDiv, 'settingsWrapper',
                                        'tetris-col-md');
    let settingsButtonWrapper = new domElement('div', settingsWrapper,
                                               'settingsButtonWrapper',
                                        'tetris-col-md');

    let gameBoardText = new domElement('div', gameBoardDiv,
                                       'gameBoardText');
    let gameBoardCanvas = new domElement('canvas', gameBoardDiv,
                                         'gameBoardCanvas');

    let modalDiv = new domElement('div', tetrisGame, false, 'modal');
    let modalContent = new domElement('div', modalDiv, false, 'modal-content');
    let modalCloseButton = new domElement('span', modalContent, false,
                                          'close-button', 'x');
    let modalTitle = new domElement('h1', modalContent, false, false,
                                    'Game Paused');
    let modalSubTitle = new domElement('p', modalContent, false, 'subtitle',
                                    'Press space to play');
    let modalForm = new domElement('form', modalContent);
    let modalRadioTitle1 = new domElement('h2', modalForm, false, false,
                                          'Play Setting');
    let modalRadioDiv1 = new domElement('div', modalForm, false, false);

    let modalPlayNormalButton =
        new RadioButtonAndLabel(modalRadioDiv1, 'tetris-modal-normal-mode',
                                'playMode', gameMode.normal,
                                settings.gameMode === gameMode.normal,
                                'Normal Mode');
    let modalPlayNoBoundButton =
        new RadioButtonAndLabel(modalRadioDiv1,
                                'tetris-modal-boundaryless-mode',
                                'playMode', gameMode.noBoundaries,
                                settings.gameMode === gameMode.noBoundaries,
                                'No Side Boundaries');
    let modalRadioTitle2 =
        new domElement('h2', modalForm, false, false, 'Game Board Setting');
    let modalRadioDiv2 = new domElement('div', modalForm, false, false);
    let modalUiGraphic =
        new RadioButtonAndLabel(modalRadioDiv2, 'tetris-modal-ui-graphic',
                                'uiMode', uiMode.canvas,
                                settings.uiMode === uiMode.canvas,
                                'Graphical Board');

    let modalUiText =
        new RadioButtonAndLabel(modalRadioDiv2, 'tetris-modal-ui-text',
                                'uiMode', uiMode.text,
                                settings.uiMode === uiMode.text,
                                'Retro Text Board');

    let settingsButton = new domElement('button', settingsButtonWrapper,
                                        false, 'button', 'Settings');
    settingsButton.classList.add('open-modal');
    let nextPieceWrapper = new domElement('div', statsDiv, 'nextPieceWrapper');
    let nextPieceWrapperText = new domElement('div', nextPieceWrapper,
                                             'nextPieceWrapperText');
    let nextPieceWrapperCanvas = new domElement('div', nextPieceWrapper,
                                             'nextPieceWrapperCanvas');
    let nextPieceCanvas = new domElement('canvas', nextPieceWrapperCanvas,
                                         'nextPieceCanvas');
    //let statsWrapperText = new domElement('div', statsDiv, 'scoreWrapper');

    //let statsTable = new domElement('div',statsWrapperText, 'statsTable');
    let statsTable = new domElement('div',statsDiv, 'statsTable');
    let row0 = new domElement('div',statsTable);
    let row1 = new domElement('div',statsTable);

    let scoreLabel = new domElement('span', row0, false, false, 'Score:');
    let score = new domElement('span', row0, 'score', false, '0000');

    let rowsClearedLabel = new domElement('span', row1, false, false, 'Rows:');
    let rowsCleared = new domElement('span', row1, 'rowsCleared', false, '1010');
    gameBoardText.classList.toggle('is-hidden');

    toggleMonoSpace(['gameBoardText']);

    nextPieceWrapperText.classList.toggle('is-hidden');

    toggleMonoSpace(['nextPieceWrapperText']);


    gameBoardCanvas.setAttribute('width', canvasSize[0]);
    gameBoardCanvas.setAttribute('height', canvasSize[1]);

    nextPieceCanvas.setAttribute('width', nextPieceCanvasSize[0]);
    nextPieceCanvas.setAttribute('height', nextPieceCanvasSize[1]);

  }

  function toggleVisibility (elementList) {
    elementList.forEach(x => getElementById(x).classList.toggle('is-hidden'));
  }

  function toggleMonoSpace (elementList) {
    elementList.forEach(x => getElementById(x).classList.toggle('monospace'));
  }

  function renderCanvas (canvasId, cSize = canvasSize,
                         gSize = gridSize, blocks) {
    const canvas = getElementById(canvasId);
    const ctx =  canvas.getContext('2d');

    let board = {
      width: (Math.floor(cSize[0] / gSize[0]) * gSize[0]),
      height: (Math.floor(cSize[1] / gSize[1]) * gSize[1]),
      blockCount: gSize[0] * gSize[1],
      color: getColor(0),
    };

    board.blockData = [0, 0, board.width, board.height];

    let block = {
      width: Math.floor(board.height / gSize[0]),
      height:  Math.floor(board.width / gSize[1])
    };

    function drawBlock (ctx, block) {
      //console.log('drawing', block)
      ctx.fillStyle = block.color;
      ctx.fillRect(...block.blockData);
    }

    ctx.save();
    ctx.lineWidth = 1;
    ctx.translate(0.5, 0.5);

    drawBlock(ctx, board);
    blocks.forEach(x => drawBlock(ctx, x));
    ctx.restore();
  };

  function renderTextContent(content, padding, border, margin){
    // Box model inside -> out: content > padding > border > margin
    if (! content)
      return '';
    if (! padding)
      padding = {top: 0, bottom: 0 , left: 0, right: 0, fill: ' '};
    if (padding.fill.length === 0)
      padding.fill = ' ';
    if (! border)
      border = {topFill: '', bottomFill: '' , leftFill: '', rightFill: '' };
    if (! margin)
      margin = {top: 0, bottom: 0 , left: 0, right: 0, fill: ' '};

    const stringFill = (fill, delimiter, width, height) =>
          '' + ((fill).repeat(width) + delimiter).repeat(height);

    padding.width = content.width + padding.left + padding.right;
    padding.height = content.height + padding.top + padding.bottom;

    border.width = padding.width + border.leftFill.length +
      border.rightFill.length;
    border.height = padding.height + border.topFill.length +
      border.bottomFill.length;

    border.topHeight = border.topFill.length > 0 ? 1 : 0;
    border.bottomHeight = border.bottomFill.length > 0 ? 1 : 0;

    margin.width = border.width + margin.left + margin.right;
    margin.height = border.height + margin.top + margin.bottom;

    const blankContent = padding.fill.repeat(content.width);
    const leftMargin = margin.fill.repeat(margin.left);
    const rightMargin = margin.fill.repeat(margin.right);
    const leftPadding = padding.fill.repeat(padding.left);
    const rightPadding = padding.fill.repeat(padding.right);

    const leftSide = leftMargin + border.leftFill + leftPadding;
    const rightSide = rightPadding + border.rightFill + rightMargin;
    const rightDelimLeft = rightSide + content.delimiter + leftSide;

    const topMargin  = stringFill(margin.fill, content.delimiter,
                                  margin.width, margin.top);
    const bottomMargin = stringFill(margin.fill, content.delimiter,
                                    margin.width, margin.bottom);

    let topBorder = '';
    if (border.topHeight > 0) {
      topBorder += leftMargin + border.topFill.repeat(border.width) +
        rightMargin;
      topBorder = stringFill(topBorder, content.delimiter,
                             1, border.topHeight);
    }

    let bottomBorder = '';
    if (border.bottomHeight > 0) {
      bottomBorder += leftMargin + border.bottomFill.repeat(border.width) +
        rightMargin;
      bottomBorder = stringFill(bottomBorder, content.delimiter,
                                1, border.bottomHeight);
    }

    const topPadding = '' + stringFill(leftSide + blankContent + rightSide,
                                       content.delimiter,
                                       1, padding.top);

    const bottomPadding = '' + stringFill(leftSide + blankContent + rightSide,
                                          content.delimiter,
                                          1, padding.bottom);


    //strip delims from the end of content
    let result = content.string.slice();

    if (content.string.length === 0) {
      result = stringFill(padding.fill, content.delimiter,
                          content.width, content.height);
    }

    let re = new RegExp(content.delimiter + '*$');
    result = result.replace(re, '');

    // then replace all delimiters with rp + rb + rm + delim + lm + lb + lp
    re = new RegExp(content.delimiter, 'g');
    result = result.replace(re, rightDelimLeft);

    // add the final right side and delimiter
    result += rightSide + content.delimiter;

    // then add left margin + left border + left padding to beginning
    result = leftSide + result;

    // END Add top and bottom padding, border, and margins (last step)
    result = topMargin + topBorder + topPadding + result;
    result += bottomPadding + bottomBorder + bottomMargin;

    return result;

  };

  function CanvasBlock(index,color,board,block) {
    const col = (index, columnCount) => Math.floor(index % columnCount);
    const row = (index, columnCount) => Math.floor(index / columnCount);
    const colOffset = (i, cc, w) => col(i, cc / w) * w;
    const rowOffset = (i, cc, w, h) => row(i, cc / w) * h;

    let result = {};
    result.color = color;
    result.index = index;
    result.blockData = [
      colOffset(index, board.width, block.width),
      rowOffset(index, board.width, block.width, block.height),
      block.width,
      block.height
    ];
    return result;
  }

  const boardBackgroundsNormal = {'text': ' ', 'canvasColor':  getColor(0)};

  const boardBackgroundsAlternate = {'text': '.', 'canvasColor':  getColor(1)};

  function calcBoardBackgrounds(j) {
    if (j % 2) {
      return boardBackgroundsNormal;
    }
    else {
      return boardBackgroundsAlternate;
    }
  };

  function calcBlockColorWithBg (i, j, block, board, blockColor) {
    let result = {'canvas': {}, 'text': ''};
    if (blockColor === 0) {
      const backgrounds = calcBoardBackgrounds(1);
      result.canvas = new CanvasBlock(i, backgrounds.canvasColor,
                                      board, block);
      result.text += backgrounds.text;
    } else {
      const color = getColor(blockColor);
      result.canvas = new CanvasBlock(i, color, board, block);
      result.text += 'X';
    }

    if ((j + 1) >= board.columns) {
      result.text += '\n';
    }

    return result;
  }

  function calcBlockColorWithAltBg (i, j, block, board, blockColor) {
    let result = {'canvas': {}, 'text': ''};
    if (blockColor === 0) {
      const backgrounds = calcBoardBackgrounds(j);
      result.canvas = new CanvasBlock(i, backgrounds.canvasColor,
                                      board, block);
      result.text += backgrounds.text;
    } else {
      const color = getColor(blockColor);
      result.canvas = new CanvasBlock(i, color, board, block);
      result.text += 'X';
    }

    if ((j + 1) >= board.columns) {
      result.text += '\n';
    }

    return result;
  }

  function renderTextGameBoard (string, board) {
    const content = {string: string,
                     delimiter: '\n', width: board.columns,
                     height: board.rows};
    const padding = {top: 0, bottom: 0 , left: 0, right: 0, fill: ' '};
    const border = {topFill: '_', bottomFill: '^' ,
                    leftFill: '|', rightFill: '|' };
    const margin = {top: 0, bottom: 0 , left: 1, right: 1, fill: ' '};

    return renderTextContent(content, padding, border, margin);

  }

  function calcBoards (grid = [], size = gridSize, cSize = canvasSize) {
    let result = {text: '', canvas: []};

    const board = {
      width: (Math.floor(cSize[0] / size[0]) * size[0]),
      height: (Math.floor(cSize[1] / size[1]) * size[1]),
      blockCount: size[0] * size[1],
      columns: size[0],
      rows: size[1]
    };

    const block = {
      width:  Math.floor(board.width / size[0]),
      height: Math.floor(board.height / size[1])
    };


    let j = 0;

    for (let i=0; i < grid.length; i++) {
      result.canvas[i] = {};

      const blockColor = grid[i].color;
      const blockValues = calcBlockColorWithAltBg(i, j, block, board, blockColor);
      result.canvas[i] = blockValues.canvas;
      result.text += blockValues.text;

      j++;

      if (j >= board.columns) {
        j = 0;
      }
    }

    result.text = renderTextGameBoard(result.text, board);

    return result;
  };

  function calcNextPiece (grid = [], size = gridSize, cSize = canvasSize) {
    let result = {text: '', canvas: []};

    const board = {
      width: (Math.floor(cSize[0] / size[0]) * size[0]),
      height: (Math.floor(cSize[1] / size[1]) * size[1]),
      blockCount: size[0] * size[1],
      columns: size[0],
      rows: size[1]
    };

    const block = {
      width:  Math.floor(board.width / size[0]),
      height: Math.floor(board.height / size[1])
    };


    let j = 0;

    for (let i=0; i < grid.length; i++) {
      result.canvas[i] = {};

      const blockColor = grid[i].color;
      const blockValues = calcBlockColorWithBg(i, j, block, board, blockColor);
      result.canvas[i] = blockValues.canvas;
      result.text += blockValues.text;

      j++;

      if (j >= board.columns) {
        j = 0;
      }
    }

    return result;
  };


  function setUIstate (state) {
    switch (state) {
    case 'paused':
      modalIsVisible(true);
      break;
    case 'playing':
      modalIsVisible(false);
      break;
    case uiMode.text:
      canvasIsVisible(false);
      break;
    case uiMode.canvas:
      canvasIsVisible(true);
      break;
    }
  }

  function draw (boardChanged, grid, gridSize, canvasSize, nextPieceGrid) {
    settings = getCurrentSettings();
    const nextPieceCanvasSize = [Math.floor(canvasSize[1] / nextPieceCanvasFactor),
                                 Math.floor(canvasSize[1] / nextPieceCanvasFactor)];
    const nextPieceGridSize = [4,4];
    if (boardChanged) {
      const boardData = calcBoards(grid, gridSize, canvasSize);
      setElementInnerText('gameBoardText', boardData.text);

      const nextPieceData = calcNextPiece(nextPieceGrid,
                                          nextPieceGridSize,
                                          nextPieceCanvasSize);
      setElementInnerText('nextPieceWrapperText', 'NEXT:\n' + nextPieceData.text);


      if (settings.uiMode === uiMode.canvas) {
        renderCanvas('gameBoardCanvas', canvasSize, gridSize,
                     boardData.canvas);
        renderCanvas('nextPieceCanvas', nextPieceCanvasSize, nextPieceGridSize,
                     nextPieceData.canvas);
      }

      boardNeedsUIrefresh = false;
    }
  };

  function modalIsVisible(newState) {
    let modal = document.querySelector(".modal");
    const currentState = modal.classList.contains("show-modal");
    if (currentState != newState)
        modal.classList.toggle("show-modal");
  }

  function canvasIsVisible(newState) {
    let canvas = getElementById('gameBoardCanvas');
    let text = getElementById('gameBoardText');
    const currentState = text.classList.contains("is-hidden");
    if (currentState != newState) {
      toggleVisibility(['gameBoardText', 'gameBoardCanvas',
                        'nextPieceWrapperText', 'nextPieceWrapperCanvas']);
      toggleMonoSpace(['statsTable']);
    }
  }

  this.calcBoards = (x,y,z) => calcBoards(x,y,z);
  this.calcNextPiece = (x,y,z) => calcNextPiece(x,y,z);

  this.getGridSize = () => gridSize;
  this.getCanvasSize = () => canvasSize;
  this.draw = (v, w, x, y, z) => draw(v, w, x, y, z);
  this.initUI = () => initUI();
  this.setState = (state) => setUIstate(state);
  this.setElementInnerText = (id, text) => setElementInnerText(id,text);
  this.getBoardUIisUpdated = () => boardNeedsUIrefresh;
  this.updateScore = (score, rows) => {
    setElementInnerText('score', score);
    setElementInnerText('rowsCleared', rows);
  };
  this.modalIsVisible = (x) => modalIsVisible(x);
  this.currentSettings = () => getCurrentSettings();
};

function Grid() {
};

Grid.prototype.renderCoords = function (data) {
  const calcBlockX = () => colOffset(data.index, data.gridSize[0],
                                    data.blockSize[0]);
  const calcBlockY = () => rowOffset(data.index, data.gridSize[0],
                                    ...data.blockSize);
  const col = (index, columnCount) => Math.floor(index % columnCount);
  const row = (index, columnCount) => Math.floor(index / columnCount);
  const colOffset = (i, cc, w) => col(i, cc / w) * w;
  const rowOffset = (i, cc, w, h) => row(i, cc / w) * h;

  return [
    calcBlockX(data.index,data.gridSize[0],data.blockSize[0]),
    calcBlockY(data.index,data.gridSize[0],...data.blockSize),
    data.blockSize[0],
    data.blockSize[1]
  ];

};

function Score(initialScore = 0, initialLevel = 0, initialLines = 0) {

  this.awardPoints = (lines = 0, level = this.level) => {
    const multiplier = [1,40,100,300,1200];
    this.current += (multiplier[lines] * (level + 1));
    this.clearedLines += lines;
    this.level = Math.floor(this.clearedLines / 10);
  };

  this.awardDrop = () => {
    this.awardPoints();
  };

  this.reset = (initialScore = 0, initialLevel = 0, initialLines = 0) => {
    this.current = initialScore;
    this.clearedLines = initialLines;
    this.level = initialLevel;
  };

  this.reset(initialScore, initialLevel, initialLines);
};



