/* ═══════════════════════════════════════════════════════════
   CUBO CHESS — script.js Consolidated Engine
═══════════════════════════════════════════════════════════ */
$(function () {
    // --- Master Application State Properties ---
    let board = null;
    let game = new Chess();
    let currentMode = 'bot';    // 'bot' | 'puzzle'
    let difficulty = 'medium'; 
    let currentPuzzle = null;
    let puzzleStep = 0;
    let puzzleIdx = 0;
    let isBotThinking = false;
    let usedUndo = false;

    // Track Persistent Engine Session Stats
    let session = {
        wins: 0,
        losses: 0,
        draws: 0,
        puzzlesSolved: 0,
        elo: 1200,
        lastGameMoves: 0,
        enPassant: false,
        promoted: false,
        hardWin: false,
        winsNoUndo: 0
    };

    // Clocks Matrix
    let clockTimer = null;
    let timeMins = 0;   // 0 = unlimited / No limit
    let whiteTime = 0;
    let blackTime = 0;

    // Click-to-move square selection state
    let removeGreySquares = function() {
      $('#board .square-55d63').css('background', '');
    };
    let greySquare = function(square){
      let $square = $('#board .square-' + square);
      let background = $square.hasClass('black-3c85d') ? '#b58863' : '#f0d9b5';
      $square.css('background', 'radical-gradient(circle, rgba(0,0,0,0.15) 18%, transparent 20%),' + background);
    };
    let selectedSquare = null;

    // --- DOM Cache References ---
    const $statusTxt = $('#statusTxt, .status-text, [data-s]').first();
    const $statusBadge = $('#statusBadge, .status-badge');
    const $openingBadge = $('#openingBadge');
    const $openingName = $('#openingName, .opening-name');
    const $openingVar = $('#openingVar');
    const $thinkBar = $('#thinkBar');
    const $evalBarWhite = $('#evalBarWhite');
    const $evalScore = $('#evalScore');
    const $moveHistory = $('#move-history');
    
    // Stats Element Accessors
    const $eloDisplay = $('#eloDisplay');
    const $headerElo = $('#headerElo, .elo-chip span');
    const $sWins = $('#s-wins');
    const $sLoss = $('#s-loss');
    const $sDraw = $('#s-draw');
    const $sMove = $('#s-move');

    // Puzzle Element Accessors
    const $puzzleBar = $('#puzzleBar');
    const $puzzleDesc = $('#puzzleDesc');
    const $puzzleRating = $('#puzzleRating');
    const $puzzleResult = $('#puzzleResult');
    const $btnPuzzleNext = $('#btnPuzzleNext');

    // Modals
    const $modalOv = $('#modalOv');

    // --- Core Game Validation Rules ---
    function onDragStart(source, piece, position, orientation) {
        // Disabled since we are strictly using a click-to-move setup now
        return false;
    }

    function onDrop(source, target) {
        return 'snapback';
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    function handleTurnTransition(move) {
      if(currentMode === 'bot') {
        handleBotTurnSequence();
      } else if(currentMode === 'puzzle') {
        handlePuzzleDrop(move);
      }
    }

    // --- Execution Subroutines ---
    function handleBotTurnSequence() {
        updateUI();
        manageClockExecution();

        if (!game.game_over()) {
            isBotThinking = true;
            $statusBadge.attr('data-s', 'bot-turn');
            $statusTxt.text('CUBO Bot is thinking...');
            $('#board').addClass('bot-thinking');
            if($thinkBar.length) $thinkBar.css('width', '100%');

            setTimeout(makeBotMove, 600);
        } else {
            checkGameOver();
        }
    }

    function makeBotMove() {
        if (game.game_over()) return;

        const possibleMoves = game.moves();
        if (possibleMoves.length === 0) return;

        let selectedMove = null;
        const captures = possibleMoves.filter(m => m.includes('x'));
        
        if (captures.length > 0 && difficulty !== 'easy') {
            selectedMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        game.move(selectedMove);
        board.position(game.fen());

        isBotThinking = false;
        $('#board').removeClass('bot-thinking');
        if($thinkBar.length) $thinkBar.css('width', '0%');
        $statusBadge.attr('data-s', 'your-turn');
        $statusTxt.text('Your turn');

        updateUI();
        manageClockExecution();
        checkGameOver();
    }

    function updateUI() {
        // Build History Row Logs
        let history = game.history({ verbose: true });
        if($moveHistory.length){
          $moveHistory.empty();
        
          let htmlStr = '';
          for (let i = 0; i < history.length; i += 2) {
            let moveNum = Math.floor(i / 2) + 1;
            let wMove = history[i].san;
            let bMove = history[i + 1] ? history[i + 1].san : '';
            htmlStr += `<div class="move-row">
                <span class="m-num">${moveNum}.</span>
                <span class="m-w">${wMove}</span>
                <span class="m-b">${bMove}</span>
            </div>`;
          }
          $moveHistory.append(htmlStr);
          $moveHistory.scrollTop($moveHistory[0].scrollHeight);
        }
        $sMove.text(history.length);

        // Update Openings dynamically using the function matching your block
        updateOpening();

        // Calculate basic layout Evaluation Meter score
        let score = 0;
        game.board().forEach(row => {
            row.forEach(sq => {
                if(!sq) return;
                let val = sq.type === 'p' ? 1 : sq.type === 'n' ? 3 : sq.type === 'b' ? 3 : sq.type === 'r' ? 5 : sq.type === 'q' ? 9 : 0;
                score += sq.color === 'w' ? val : -val;
            });
        });

        let displayScore = score >= 0 ? `+${score.toFixed(1)}` : `${score.toFixed(1)}`;
        $evalScore.text(displayScore);
        let percentage = 50 + (score * 4);
        percentage = Math.max(5, Math.min(95, percentage));
        $evalBarWhite.css('height', `${percentage}%`);
    }

    function updateOpening() {
        // Accessing the library parsing utility from your uploaded data structure
        if (typeof getOpening === 'function') {
            const match = getOpening(game);
            if (match) {
                $openingName.text(match.name);
                $openingVar.text(match.var || '');
                $openingBadge.addClass('visible');
                return;
            }
        }
        if (game.history().length === 0) {
            $openingName.text('Starting Position');
            $openingVar.text('');
            $openingBadge.removeClass('visible');
        }
    }

    // Core Timer Implementation Engines
    function initializeGameClocks() {
      clearInterval(clockTimer);
      if(timeMins === 0) {
        $('#whiteClock, #blackClock').text('∞');
        return;
      }
      whiteTime = timeMins * 60;
      blackTime = timeMins * 60;
      renderClockString($('#whiteClock'), whiteTime);
      renderClockString($('#blackClock'), blackTime);
    }

    function manageClockExecution() {
      if(timeMins === 0 || game.game_over()) {
        clearInterval(clockTimer);
        return;
      }
      clearInterval(clockTimer);
      clockTimer = setInterval(() => {
        if(game.turn() === 'w') {
          whiteTime--;
          renderClockString($('#whiteClock'), whiteTime);
          if(whiteTime <= 0) {
            clearInterval(clockTimer);
            triggerGameOverModal('Loss', 'White loses on time fallback.');
          }
        } else {
          blackTime--;
          renderClockString($('#blackClock'), blackTime);
          if(blackTime <= 0) {
            clearInterval(clockTimer);
            triggerGameOverModal('Win', 'Blak running out of time bounds.');
          }
        }
      }, 1000);
    }

    function renderClockString($element, overallSeconds) {
      let calculatedMinutes = Math.floor(overallSeconds / 60);
      let calculatedSeconds = overallSeconds % 60;
      $element.text(`${calculatedMinutes}:${calculatedSeconds < 10 ? '0' : ''}${calculatedSeconds}`);
    }

    function checkGameOver() {
        if (game.in_checkmate()) {
          clearInterval(clockTimer);
          triggerGameOverModal(game.turn() === 'b' ? 'Win' : 'Loss', 'Checkmate occurs.');
        } else if (game.in_draw()) {
            clearInterval(clockTimer);
            triggerGameOverModal('Draw', 'Draw position achieved.');
        }
    }

    function triggerGameOverModal(res, reason) {
        clearInterval(clockTimer);
        session.lastGameMoves = game.history().length;
        $('#mTitle').text(res === 'Win' ? 'Victory!' : res === 'Loss' ? 'Defeat' : 'Draw');
        $('#mSub').text(reason);
        
        let delta = res === 'Win' ? 15 : res === 'Loss' ? -12 : 2;
        session.elo += delta;
        
        if (res === 'Win') {
            session.wins++;
            if (!usedUndo) session.winsNoUndo++;
            if (difficulty === 'hard') session.hardWin = true;
        } else if (res === 'Loss') {
            session.losses++;
        } else {
            session.draws++;
        }

        $eloDisplay.text(session.elo);
        $headerElo.text(session.elo);
        $sWins.text(session.wins);
        $sLoss.text(session.losses);
        $sDraw.text(session.draws);
        
        if(typeof ACH_DEFS !== 'undefined') {
          ACH_DEFS.forEach(ach => {
            if(ach.check(session)) console.log('Achievement Unlocked: ${ach.title}');
          });
        }
        $modalOv.removeClass('hidden');
    }

    function checkAchievements() {
        if (typeof ACH_DEFS !== 'undefined') {
            ACH_DEFS.forEach(ach => {
                if (ach.check(session)) {
                    console.log(`Achievement Unlocked: ${ach.title} - ${ach.desc}`);
                }
            });
        }
    }

    function showHint() {
      if(game.game_over() || isBotThinking) return;
      if(currentMode === 'puzzle' && currentPuzzle) {
        const nextMoveUCI = currentPuzzle.solution[puzzleStep];
        if(nextMoveUCI) {
          const fromSquare = nextMoveUCI.substring(0, 2);
          const toSquare = nextMoveUCI.substring(2, 4);
          removeGreySquares();
          greySquare(fromSquare);
          greySquare(toSquare);
          $statusTxt.text(`Hint: Look closely at square ${fromSquare}...`);
        }
      } else if(currentMode === 'bot') {
          const possibleMoves = game.moves({verbose: true});
          if(possibleMoves.length === 0) return;

          let hintMove = null;
          const captures = possibleMoves.filter(m => m.san.includes('x'));
          if(captures.length > 0 && difficulty !== 'easy') {
            hintMove = captures[Math.floor(Math.random() * captures.length)];
          } else {
            hintMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          }

          if(hintMove) {
            removeGreySquares();
            greySquare(hintMove.from);
            greySquare(hintMove.to);
            $statusTxt.text(`Hint: Move ${hintMove.san} (${hintMove.from} → ${hintMove.to})`);
          }
      }
    }

    // --- Configuration Mapping ---
    const config = {
        draggable: false,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    board = Chessboard('board', config);
    resetGameInstance();

    // Click-To-Move Integration Logic
    $('#board').on('click', '.square-55d63', function() {
      if(game.game_over() || isBotThinking) return;

      let square = $(this).data('square');

      if(selectedSquare) {
        let move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        });
        if(move === null) {
          let piece = game.get(square);
          if(piece && piece.color === game.turn()) {
            selectedSquare = square;
            removeGreySquares();
            greySquare(square);
            let moves = game.moves({ square: square, verbose: true });
            moves.forEach(m => greySquare(m.to));
          } else {
            removeGreySquares();
            selectedSquare = null;
          }
        } else {
            // Achievement verification flags
            if(move.flags && move.flags.includes('e')) session.enPassant = true;
            if(move.flags && move.flags.includes('p')) session.promoted = true;

            removeGreySquares();
            board.position(game.fen());
            selectedSquare = null;
            handleTurnTransition(move);
          }
      } else {
          let piece = game.get(square);
          if (piece && piece.color === game.turn()) {
            selectedSquare = square;
            removeGreySquares();
            greySquare(square);

            let moves = game.moves({ square: square, verbose: true });
            moves.forEach(m => greySquare(m.to));
          }
        }
    });

    // Interactive Mode Switching Functions (Clean Lifecycle Initialization)
    function startPuzzle() {
        currentMode = 'puzzle';
        clearInterval(clockTimer);
        $('#diffSection,#timeSection').hide();
        $('#puzzleBar').addClass('visible');
        loadPuzzle();
    }

    // Safely exits layout views without stack iteration loops
    function exitPuzzle() {
        currentMode = 'bot';
        $('#diffSection,#timeSection').show();
        $('#puzzleBar').removeClass('visible');
        resetGameInstance();
    }

    function loadPuzzle() {
        if (typeof PUZZLES !== 'undefined' && PUZZLES.length > 0) {
            currentPuzzle = PUZZLES[puzzleIdx % PUZZLES.length];
            puzzleStep = 0;
            game.load(currentPuzzle.fen);
            board.position(currentPuzzle.fen);
            board.orientation(game.turn() === 'b' ? 'black' : 'white');
            
            $('#move-history').empty();
            $puzzleDesc.text(currentPuzzle.desc);
            $puzzleRating.text(currentPuzzle.rating);
            $puzzleResult.removeClass('correct wrong').text('').hide();
            $btnPuzzleNext.addClass('hidden');
            removeGreySquares();
            selectedSquare = null;
            updateOpening();
        }
    }

    function handlePuzzleDrop(move) {
        const sol = currentPuzzle.solution;
        const uci = move.from + move.to;
        
        if (uci === sol[puzzleStep]) {
            puzzleStep++;
            if (puzzleStep >= sol.length) {
                session.puzzlesSolved++;
                session.elo = Math.min(3000, session.elo + 5);
                $('#eloDisplay,#headerElo').text(session.elo);
                $('#puzzleResult').addClass('correct').text('✓ Correct! Well done.').show();
                $btnPuzzleNext.removeClass('hidden');
                checkAchievements();
            }
        } else {
            setTimeout(() => {
              let botMoveUCI = sol[puzzleStep];
              game.move({
                from: botMoveUCI.substring(0, 2),
                to: botMoveUCI.substring(2, 4),
                promotion: 'q'
              });
              board.position(game.fen());
              puzzleStep++;
        }, 500);
    }
  }

    function resetGameInstance() {
      clearInterval(clockTimer);
      game.reset();
      board.start();
      board.orientation('white');
      isBotThinking = false;
      usedUndo = false;
      selectedSquare = null;
      removeGreySquares();
      $statusBadge.attr('data-s', 'your-turn');
      $statusTxt.text('Your turn');
      initializeGameClocks();
      updateUI();
      setTimeout(() => board.resize(), 100);
    }

    // Element Listeners binding hooks
    $('#btnHint, .btn-hint, #hintBtn').on('click', function() { showHint(); });
    $('#btnPuzzleSkip').on('click', () => { puzzleIdx++; loadPuzzle(); });
    $btnPuzzleNext.on('click', () => { puzzleIdx++; loadPuzzle(); });
    $('#modePuzzleBtn,#navPuzzle').on('click', function() { startPuzzle(); });
    $('#modeBotBtn, #navBot').on('click', function() { exitPuzzle(); });

    $('#btnNew,#mNew').on('click', function() {
      if(currentMode === 'puzzle') {
        loadPuzzle();
      } else {
        resetGameInstance();
      }
    });
    $('#mClose').on('click', () => $modalOv.addClass('hidden'));
    $('#btnFlip').on('click', () => board.flip());

    $('#btnUndo').on('click', function() {
        if (isBotThinking || game.game_over() || currentMode === 'puzzle') return;
        game.undo(); game.undo(); usedUndo = true;
        selectedSquare = null;
        removeGreySquares();
        board.position(game.fen());
        updateUI();
    });

    $('#themeToggle').on('click', function() {
        const c = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', c === 'light' ? '' : 'light');
    });

    $('.diff-btn').on('click', function() {
        $('.diff-btn').removeClass('active'); $(this).addClass('active');
        difficulty = $(this).data('diff');
    });

    // New Active Time Control Button Initialization Handler
    $('.time-btn, #timeSection button').on('click', function(){
      $('.time-btn, #timeSection button').removeClass('active');
      $(this).addClass('active');

      let extractionValue = $(this).data('time') || $(this).text().trim();

      if(extractionValue === 'No limit' || extractionValue === '∞' || parseInt(extractionValue) === 0) {
        timeMins = 0;
      } else {
        timeMins = parseInt(extractionValue);
      }

      if(currentMode === 'bot') {
        resetGameInstance();
      }
    });
    // Automatic Chessboard Resize Redraw Engine
    $(window).on('resize', function() {
      if(board !== null) {
        board.resize();
      }
    }); 
});