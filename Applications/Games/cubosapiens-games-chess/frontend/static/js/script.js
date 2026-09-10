/* ═══════════════════════════════════════════════════════════
   CUBO CHESS — script.js  v4
   Drag fix : MutationObserver watches chessboard.js's inline
              opacity changes and immediately reverts them so
              the source piece NEVER goes invisible.
   Mobile   : board size driven by CSS --board-size variable;
              touch events work via chessboard.js native touch.
   Click    : full click-to-move with legal-dot highlights.
═══════════════════════════════════════════════════════════ */
$(function () {

/* ══ ECO Opening Book ══════════════════════════════════════ */
const ECO = [
  { moves:['e2e4'],                                    name:"King's Pawn",           var:"" },
  { moves:['e2e4','e7e5'],                             name:"Open Game",             var:"" },
  { moves:['e2e4','e7e5','g1f3'],                      name:"King's Knight",         var:"" },
  { moves:['e2e4','e7e5','g1f3','b8c6'],               name:"King's Knight",         var:"Two Knights" },
  { moves:['e2e4','e7e5','g1f3','b8c6','f1b5'],        name:"Ruy López",             var:"" },
  { moves:['e2e4','e7e5','g1f3','b8c6','f1b5','a7a6'], name:"Ruy López",             var:"Morphy Defence" },
  { moves:['e2e4','e7e5','g1f3','b8c6','f1c4'],        name:"Italian Game",          var:"" },
  { moves:['e2e4','e7e5','g1f3','b8c6','d2d4'],        name:"Scotch Game",           var:"" },
  { moves:['e2e4','e7e5','f2f4'],                      name:"King's Gambit",         var:"" },
  { moves:['e2e4','e7e5','f2f4','e5f4'],               name:"King's Gambit",         var:"Accepted" },
  { moves:['e2e4','c7c5'],                             name:"Sicilian Defence",      var:"" },
  { moves:['e2e4','c7c5','g1f3'],                      name:"Sicilian",              var:"Open" },
  { moves:['e2e4','c7c5','g1f3','d7d6'],               name:"Sicilian",              var:"Najdorf" },
  { moves:['e2e4','c7c5','g1f3','b8c6'],               name:"Sicilian",              var:"Classical" },
  { moves:['e2e4','c7c5','b1c3'],                      name:"Sicilian",              var:"Closed" },
  { moves:['e2e4','c7c5','c2c3'],                      name:"Sicilian",              var:"Alapin" },
  { moves:['e2e4','e7e6'],                             name:"French Defence",        var:"" },
  { moves:['e2e4','e7e6','d2d4','d7d5'],               name:"French Defence",        var:"Classical" },
  { moves:['e2e4','e7e6','d2d4','d7d5','e4e5'],        name:"French",                var:"Advance" },
  { moves:['e2e4','c7c6'],                             name:"Caro-Kann Defence",     var:"" },
  { moves:['e2e4','c7c6','d2d4','d7d5'],               name:"Caro-Kann",             var:"Classical" },
  { moves:['e2e4','c7c6','d2d4','d7d5','e4e5'],        name:"Caro-Kann",             var:"Advance" },
  { moves:['e2e4','d7d5'],                             name:"Scandinavian",          var:"" },
  { moves:['e2e4','d7d5','e4d5'],                      name:"Scandinavian",          var:"Accepted" },
  { moves:['e2e4','g8f6'],                             name:"Alekhine's Defence",    var:"" },
  { moves:['e2e4','d7d6'],                             name:"Pirc Defence",          var:"" },
  { moves:['d2d4'],                                    name:"Queen's Pawn",          var:"" },
  { moves:['d2d4','d7d5','c2c4'],                      name:"Queen's Gambit",        var:"" },
  { moves:['d2d4','d7d5','c2c4','e7e6'],               name:"Queen's Gambit",        var:"Declined" },
  { moves:['d2d4','d7d5','c2c4','d5c4'],               name:"Queen's Gambit",        var:"Accepted" },
  { moves:['d2d4','d7d5','c2c4','c7c6'],               name:"Slav Defence",          var:"" },
  { moves:['d2d4','g8f6'],                             name:"Indian Defence",        var:"" },
  { moves:['d2d4','g8f6','c2c4','e7e6','b1c3'],        name:"Nimzo-Indian",          var:"" },
  { moves:['d2d4','g8f6','c2c4','e7e6','g1f3'],        name:"Queen's Indian",        var:"" },
  { moves:['d2d4','g8f6','c2c4','g7g6'],               name:"King's Indian",         var:"" },
  { moves:['d2d4','g8f6','c2c4','g7g6','b1c3'],        name:"King's Indian",         var:"Classical" },
  { moves:['d2d4','g8f6','c2c4','c7c5'],               name:"Benoni Defence",        var:"" },
  { moves:['d2d4','f7f5'],                             name:"Dutch Defence",         var:"" },
  { moves:['c2c4'],                                    name:"English Opening",       var:"" },
  { moves:['c2c4','e7e5'],                             name:"English",               var:"Reversed Sicilian" },
  { moves:['c2c4','c7c5'],                             name:"English",               var:"Symmetrical" },
  { moves:['g1f3'],                                    name:"Zukertort Opening",     var:"" },
  { moves:['g1f3','d7d5','c2c4'],                      name:"Reti Opening",          var:"" },
  { moves:['b2b3'],                                    name:"Nimzowitsch-Larsen",    var:"" },
];
function getOpening(g) {
  const uci = g.history({ verbose:true }).map(m => m.from+m.to);
  let best = null;
  for (const e of ECO)
    if (uci.length >= e.moves.length && e.moves.every((m,i) => m === uci[i]))
      if (!best || e.moves.length > best.moves.length) best = e;
  return best;
}

/* ══ 50 Curated Puzzles ════════════════════════════════════ */
const PUZZLES = [
  {fen:'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',solution:['h5f7'],desc:'White to move — checkmate in 1.',rating:900},
  {fen:'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',solution:['f3f7'],desc:"Scholar's Mate — find the winning move.",rating:850},
  {fen:'4k3/8/4K3/4R3/8/8/8/8 w - - 0 1',solution:['e5e8'],desc:'Checkmate with the rook.',rating:800},
  {fen:'6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',solution:['e1e8'],desc:'Rook checkmate in 1.',rating:800},
  {fen:'r2q1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 1',solution:['g5f6'],desc:'Trade bishops to expose the king.',rating:1200},
  {fen:'4r1k1/pp3ppp/2p5/8/3B4/8/PP3PPP/6K1 w - - 0 1',solution:['d4h8'],desc:'Find the winning bishop move.',rating:1000},
  {fen:'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 4 6',solution:['c4f7'],desc:'Sacrifice on f7 to win!',rating:1300},
  {fen:'8/8/8/4k3/8/4K3/4Q3/8 w - - 0 1',solution:['e2e5'],desc:'Queen + king force checkmate.',rating:850},
  {fen:'r4rk1/pp2ppbp/2np1np1/q1p5/2PP4/2NQBP2/PP2N1PP/R4RK1 w - - 0 12',solution:['d3a6'],desc:'Win the queen with a fork!',rating:1150},
  {fen:'2bqkb1r/r4ppp/p1nppn2/1p6/3NP3/1BN5/PPP1BPPP/R2QK2R w KQk - 0 11',solution:['d4b5'],desc:'Knight fork wins material.',rating:1050},
  {fen:'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 1',solution:['c5f2'],desc:'Black to move — find the tactic!',rating:1200},
  {fen:'8/3P4/8/8/8/8/8/3K1k2 w - - 0 1',solution:['d7d8q'],desc:'Promote the pawn!',rating:800},
  {fen:'5rk1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',solution:['d1d8'],desc:'Rook to the 8th rank!',rating:850},
  {fen:'r1b1r1k1/pp3pbp/1qnp2p1/2pNp3/4P3/2P1BP2/PP1QB1PP/R4RK1 w - - 0 14',solution:['d5b6'],desc:'Fork the queen and rook!',rating:1250},
  {fen:'8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',solution:['d4d5'],desc:'Advance the passer — opposition rules.',rating:900},
  {fen:'r1bqkb1r/ppp2ppp/2n5/3pp3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',solution:['f3e5'],desc:'Knight fork wins a pawn.',rating:1000},
  {fen:'2kr3r/ppp2ppp/2n5/3Pb3/1b2P3/2NB4/PPP2PPP/R1BQK2R w KQ - 0 10',solution:['d5c6'],desc:'Discovered check — win material!',rating:1300},
  {fen:'4r1k1/5pp1/7p/3B4/8/8/5PPP/6K1 w - - 0 1',solution:['d5f7'],desc:'Bishop attacks the king!',rating:1050},
  {fen:'8/8/1p6/1Pp5/2P5/8/8/k1K5 w - c6 0 1',solution:['b5c6'],desc:'En passant creates a passed pawn!',rating:1100},
  {fen:'5k2/8/5K2/5P2/8/8/8/8 w - - 0 1',solution:['f5f6'],desc:'Advance the pawn — opposition.',rating:900},
  {fen:'r2q1rk1/pp3ppp/2p1pn2/8/3PN3/1Q6/PP3PPP/R3R1K1 w - - 0 17',solution:['d4f5'],desc:'Knight leap attacks!',rating:1200},
  {fen:'1rb1k2r/p1qn1pbp/1pp1p1p1/3pP3/3P1B2/2NB1N2/PPP1QPPP/R4RK1 w k - 0 13',solution:['f4h6'],desc:'Bishop sacrifice opens the king!',rating:1400},
  {fen:'8/5k2/8/5P2/8/5K2/8/8 w - - 0 1',solution:['f3e4'],desc:'Take the key square!',rating:850},
  {fen:'2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',solution:['c1c8'],desc:'Rook on the 8th!',rating:800},
  {fen:'r1b1kb1r/1pppqppp/p1n2n2/4p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 7',solution:['c4f7'],desc:'Greek gift sacrifice!',rating:1450},
  {fen:'8/8/8/8/8/k7/p7/K7 b - - 0 1',solution:['a2a1q'],desc:'Black queens the pawn!',rating:750},
  {fen:'r3r1k1/ppp2ppp/2n2n2/3p1b2/3P1B2/2N2N2/PPP2PPP/R3R1K1 w - - 0 10',solution:['f4d6'],desc:'Bishop fork!',rating:1150},
  {fen:'r1bq1rk1/ppp2ppp/2n5/3pN3/2Pp4/3P4/PP3PPP/RNBQ1RK1 w - - 0 10',solution:['e5d7'],desc:'Knight fork — queen and rook!',rating:1300},
  {fen:'3qk3/8/8/8/8/8/8/3QK3 w - - 0 1',solution:['d1d8'],desc:'Queen checkmate in 1.',rating:750},
  {fen:'r3k2r/pp3ppp/2nb1n2/3pp1B1/3PP3/2N2N2/PP3PPP/R3K2R w KQkq - 0 11',solution:['g5f6'],desc:'Attack the pinned knight.',rating:1100},
  {fen:'8/8/8/1k6/1P6/1K6/8/8 w - - 0 1',solution:['b4b5'],desc:'Advance the passer correctly.',rating:950},
  {fen:'4k3/8/8/8/8/8/8/R3K3 w Q - - 0 1',solution:['a1a8'],desc:'Back rank checkmate!',rating:750},
  {fen:'r2r2k1/ppp2ppp/2n2n2/2bpp1B1/2B1P3/2NP1N2/PPP2PPP/R2R2K1 w - - 0 12',solution:['g5f6'],desc:'Remove the defender!',rating:1200},
  {fen:'2r1r1k1/pp2bppp/2p2n2/3p4/3P4/2N2N2/PPP1BPPP/2R1R1K1 w - - 0 14',solution:['f3e5'],desc:'Knight centralisation!',rating:1100},
  {fen:'4k3/4r3/8/8/8/8/4R3/4K3 w - - 0 1',solution:['e1d2'],desc:'Activate the king in rook endgame.',rating:950},
  {fen:'6k1/pp3p1p/2p3p1/8/8/2P3P1/PP3P1P/6K1 w - - 0 1',solution:['g1f2'],desc:'King march to victory.',rating:900},
  {fen:'5k2/ppp5/3p4/8/8/3P4/PPP5/5K2 w - - 0 1',solution:['f1e2'],desc:'Centralise the king first.',rating:850},
  {fen:'1r6/5pk1/p6p/6p1/8/P5PP/5PK1/1R6 w - - 0 30',solution:['b1b8'],desc:'Rook to the 8th dominates!',rating:1050},
  {fen:'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',solution:['f1e2'],desc:'Develop the bishop naturally.',rating:800},
  {fen:'r1b1k2r/ppppqppp/2n2n2/2b1p3/4P3/2NP1N2/PPP1BPPP/R1BQK2R w KQkq - 6 7',solution:['e1g1'],desc:'Castle to safety and connect rooks!',rating:800},
  {fen:'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 5',solution:['d3d4'],desc:'Strike at the center!',rating:900},
  {fen:'r3k2r/1pp2ppp/p1n1pn2/8/8/2N1PN2/PPP2PPP/R3K2R w KQkq - 0 10',solution:['e1c1'],desc:'Castle queenside for activity.',rating:800},
  {fen:'r1bqkb1r/pp3ppp/2n1pn2/3p4/3P4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 7',solution:['d4e5'],desc:'Exchange in the center.',rating:950},
  {fen:'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 13',solution:['g5d8'],desc:'Win the queen!',rating:1350},
  {fen:'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 2 4',solution:['f1e2'],desc:'Develop the bishop.',rating:800},
  {fen:'r1b1kb1r/ppppqppp/2n2n2/4p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 4 5',solution:['f3e5'],desc:'Win material with the knight.',rating:1050},
  {fen:'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7',solution:['c4b3'],desc:'Retreat bishop to safety.',rating:850},
  {fen:'8/8/8/1k6/8/1K6/1P6/8 w - - 0 1',solution:['b2b4'],desc:'Advance the passer — calculate first.',rating:900},
  {fen:'r1bqkbnr/pppp1ppp/2n5/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 1 3',solution:['f4e5'],desc:'Win the pawn with the f-pawn.',rating:850},
  {fen:'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',solution:['d1c2'],desc:'Defend the attacked piece.',rating:900},
];

/* ══ Achievements ══════════════════════════════════════════ */
const ACH_DEFS = [
  { id:'first_win',  icon:'🏆', title:'First Victory',   desc:'Won your first game!',              check: s => s.wins === 1 },
  { id:'three_wins', icon:'🎯', title:'On a Roll',        desc:'Won 3 games this session.',          check: s => s.wins === 3 },
  { id:'puzzle_5',   icon:'🧩', title:'Puzzle Solver',    desc:'Solved 5 puzzles correctly.',        check: s => s.puzzlesSolved === 5 },
  { id:'puzzle_10',  icon:'🧠', title:'Tactician',        desc:'Solved 10 puzzles correctly.',       check: s => s.puzzlesSolved === 10 },
  { id:'elo_1300',   icon:'📈', title:'Rising Star',      desc:'Reached 1300 rating!',               check: s => s.elo >= 1300 },
  { id:'elo_1500',   icon:'⭐', title:'Expert',           desc:'Reached 1500 rating!',               check: s => s.elo >= 1500 },
  { id:'survive_50', icon:'⏳', title:'Endurance',        desc:'Played a 50+ move game.',            check: s => s.lastGameMoves >= 50 },
  { id:'en_passant', icon:'👻', title:'Ghost Capture',    desc:'Captured en passant!',               check: s => s.enPassant },
  { id:'promotion',  icon:'👑', title:'Crowned!',         desc:'Promoted a pawn!',                   check: s => s.promoted },
  { id:'hard_win',   icon:'💀', title:'Terminator',       desc:'Beat the AI on Hard difficulty.',    check: s => s.hardWin },
  { id:'no_undo',    icon:'🎖️', title:'No Regrets',       desc:'Won without using Undo.',            check: s => s.winsNoUndo >= 1 },
];

/* ══ Coaching tips ═════════════════════════════════════════ */
const TIPS = {
  opening:    ['💡 Control the center with pawns on e4 or d4.','💡 Develop knights and bishops before the queen.','💡 Castle early to protect your king!','💡 Connect your rooks after castling.'],
  middlegame: ['💡 Look for forks — one piece attacking two targets!','💡 Double rooks on open files.','💡 Identify your opponent\'s weakest piece and target it.','💡 Keep your king safe — avoid moving pawns in front of it.'],
  endgame:    ['💡 Activate your king — it\'s powerful in the endgame!','💡 Passed pawns must be pushed!','💡 Rooks belong behind passed pawns.','💡 In pawn endgames, opposition is the key concept.'],
  blunder:    ['⚠ Check your opponent\'s threats before every move!','⚠ Visualize 2 moves ahead before moving.','⚠ Ask: can my opponent capture anything for free?'],
  check:      ['💡 You\'re in check! Block, capture, or move the king.'],
};
function getPhase(g) {
  const h = g.history().length;
  if (h < 10) return 'opening';
  return ((g.fen().match(/[rnbqRNBQ]/g)||[]).length <= 6) ? 'endgame' : 'middlegame';
}
let lastTipAt = -1;
function maybeShowTip(phase) {
  const n = game.history().length;
  if (n - lastTipAt < 4) return;
  lastTipAt = n;
  const arr = TIPS[phase]; showCoachTip(arr[Math.floor(Math.random()*arr.length)]);
}
function showCoachTip(txt) {
  $('#coachTip').remove();
  const el = $(`<div id="coachTip">${txt}</div>`).appendTo('body');
  setTimeout(() => el.addClass('visible'), 40);
  setTimeout(() => { el.removeClass('visible'); setTimeout(()=>el.remove(),400); }, 5000);
}

/* ══ State ═════════════════════════════════════════════════ */
const userId        = 'u_' + Math.random().toString(36).substr(2,9);
const game          = new Chess();
let isBotThinking   = false;
let selectedDiff    = 'medium';
let timeMins        = 0;
let clockWhite      = 0, clockBlack = 0;
let clockInterval   = null;
let puzzleMode      = false;
let currentPuzzle   = null;
let puzzleIdx       = 0, puzzleStep = 0;
let usedUndo        = false, usedHint = false;
let selectedSq      = null;   // click-to-move selected square
let legalTargets    = [];
let isDragging      = false;  // true between dragStart and snapEnd/drop

const SYMS = {p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'};
let elo      = parseInt(localStorage.getItem('cubo_elo')||'1200');
let achieved = JSON.parse(localStorage.getItem('cubo_ach')||'[]');
let session  = {wins:0,losses:0,draws:0,moves:0,puzzlesSolved:0,lastGameMoves:0,enPassant:false,promoted:false,hardWin:false,winsNoUndo:0,elo:1200};
function saveState() { localStorage.setItem('cubo_elo',elo); localStorage.setItem('cubo_ach',JSON.stringify(achieved)); }

/* ══ Audio ═════════════════════════════════════════════════ */
function snd(type) {
  try { const a=new Audio(type==='capture'?'/static/sounds/capture.mp3':'/static/sounds/move.mp3'); a.volume=.65; a.play(); } catch(e) {}
}

/* ══════════════════════════════════════════════════════════
   BOARD INIT
══════════════════════════════════════════════════════════ */
const board = Chessboard('board', {
  position:     'start',
  draggable:    true,
  pieceTheme:   '/static/img/chesspieces/wikipedia/{piece}.png',
  showNotation: true,
  moveSpeed:    150,
  snapbackSpeed:200,
  snapSpeed:    80,
  onDragStart,
  onDrop,
  onSnapEnd,
  onMouseoverSquare,
  onMouseoutSquare,
  onSquareClick,
});

/* ══════════════════════════════════════════════════════════
   DRAG FIX — MutationObserver approach
   ─────────────────────────────────────────────────────────
   chessboard.js sets el.style.opacity = '0' directly on the
   source piece's IMG element when dragging starts.
   CSS !important cannot beat an inline style.
   Solution: watch the board with a MutationObserver; whenever
   we see opacity being set to '0' on any piece during a drag,
   immediately reset it to '1'.
══════════════════════════════════════════════════════════ */
const boardEl = document.getElementById('board');
const opacityObserver = new MutationObserver(mutations => {
  if (!isDragging) return;
  for (const m of mutations) {
    if (m.type === 'attributes' && m.attributeName === 'style') {
      const el = m.target;
      if (el.style && el.style.opacity === '0') {
        el.style.opacity = '1';
      }
    }
  }
});
opacityObserver.observe(boardEl, {
  attributes:    true,
  attributeFilter: ['style'],
  subtree:       true,
});

/* ══ Helpers ═══════════════════════════════════════════════ */
function canMove() {
  if (isBotThinking || game.game_over()) return false;
  if (puzzleMode) return true;
  return game.turn() === 'w';
}

function needsPromo(src, tgt) {
  const p = game.get(src);
  if (!p || p.type !== 'p') return false;
  const r = parseInt(tgt[1]);
  return (p.color==='w' && r===8) || (p.color==='b' && r===1);
}

function promoChoice() {
  const c = prompt('Promote to:\n  q — Queen\n  r — Rook\n  b — Bishop\n  n — Knight','q');
  return ['q','r','b','n'].includes(c) ? c : 'q';
}

/* ══ Drag callbacks ════════════════════════════════════════ */
function onDragStart(source, piece) {
  if (!canMove()) return false;
  if (!puzzleMode && !piece.startsWith('w')) return false;
  isDragging = true;
  clearSelection();
  return true;
}

function onDrop(source, target) {
  isDragging = false;
  clearSelection();
  if (!canMove() || source === target) return 'snapback';
  const promo = needsPromo(source,target) ? promoChoice() : 'q';
  const move  = game.move({from:source, to:target, promotion:promo});
  if (!move) return 'snapback';
  afterPlayerMove(move, source, target);
}

function onSnapEnd() {
  isDragging = false;
  board.position(game.fen());
}

/* ══ Click-to-move callbacks ════════════════════════════════ */
function onMouseoverSquare(sq, piece) {
  if (!canMove() || selectedSq || isDragging) return;
  if (!piece) return;
  const p = game.get(sq);
  if (!p || (!puzzleMode && p.color !== 'w')) return;
  showDots(sq);
  $(`#board .square-${sq}`).addClass('hover-square');
}
function onMouseoutSquare() {
  if (selectedSq || isDragging) return;
  removeDots();
  $('.hover-square').removeClass('hover-square');
}

function onSquareClick(sq, piece) {
  if (!canMove() || isDragging) return;

  if (selectedSq) {
    // Try to move to clicked square
    if (legalTargets.includes(sq)) {
      const promo = needsPromo(selectedSq, sq) ? promoChoice() : 'q';
      const move  = game.move({from:selectedSq, to:sq, promotion:promo});
      clearSelection();
      if (!move) return;
      board.position(game.fen());
      afterPlayerMove(move, selectedSq, sq);
      return;
    }
    // Re-select a friendly piece
    const p = game.get(sq);
    if (p && (puzzleMode || p.color === 'w')) {
      clearSelection();
      selectSq(sq);
      return;
    }
    // Deselect
    clearSelection();
    return;
  }

  // Select a friendly piece
  if (!piece) return;
  const p = game.get(sq);
  if (!p) return;
  if (!puzzleMode && p.color !== 'w') return;
  selectSq(sq);
}

function selectSq(sq) {
  selectedSq  = sq;
  legalTargets = game.moves({square:sq,verbose:true}).map(m=>m.to);
  $(`#board .square-${sq}`).addClass('selected-square');
  showDots(sq);
}

function clearSelection() {
  if (selectedSq) {
    $(`#board .square-${selectedSq}`).removeClass('selected-square');
    selectedSq  = null;
    legalTargets = [];
  }
  removeDots();
}

function showDots(sq) {
  removeDots();
  game.moves({square:sq, verbose:true}).forEach(m => {
    const hasPiece = !!game.get(m.to);
    $(`#board .square-${m.to}`)
      .css('position','relative')
      .append($('<div>').addClass('legal-dot'+(hasPiece?' capture-ring':'')));
  });
}
function removeDots() { $('.legal-dot').remove(); }

/* ══ After player move ══════════════════════════════════════ */
function afterPlayerMove(move, from, to) {
  if (move.flags.includes('e')) session.enPassant = true;
  if (move.flags.includes('p')) session.promoted  = true;
  session.moves++;
  updateStats();

  snd(move.captured ? 'capture' : 'move');
  highlightMove(from, to);
  addToHistory(move, 'you');
  updateCaptures();
  updateOpening();
  maybeShowTip(getPhase(game));

  if (puzzleMode) { handlePuzzleDrop(move); return; }
  setTurnBars(false);
  if (game.game_over()) { endGame(); return; }
  makeBotMove(move.from+move.to);
}

/* ══ Bot move ══════════════════════════════════════════════ */
async function makeBotMove(userUci) {
  isBotThinking = true;
  setStatus('thinking','CUBO is thinking…');
  $('#thinkBar').addClass('on');
  $('#board').addClass('bot-thinking');
  stopClock();

  try {
    const res = await $.ajax({
      url:'/move', type:'POST', contentType:'application/json',
      data: JSON.stringify({
        fen:game.fen(), difficulty:selectedDiff,
        user_id:userId, move:userUci,
        session_data:{wins:session.wins,losses:session.losses,moves:session.moves,elo}
      })
    });
    const from=res.move.slice(0,2), to=res.move.slice(2,4);
    const promo=res.move.length===5?res.move[4]:'q';
    const move=game.move({from,to,promotion:promo});
    if (!move) { console.error('Illegal bot move:',res.move); return; }

    session.moves++;
    updateStats();
    board.position(game.fen());
    snd(move.captured?'capture':'move');
    highlightMove(from,to);
    addToHistory(move,'bot');
    updateCaptures();
    updateOpening();
    setTurnBars(true);
    fetchEval();

    if (game.game_over()||res.is_checkmate||res.is_draw||res.is_stalemate) {
      endGame(res);
    } else {
      const chk=game.in_check();
      $('#board').toggleClass('check-glow',chk);
      if (chk) showCoachTip(TIPS.check[0]);
      setStatus(chk?'check':'your-turn', chk?'⚠ You are in check!':'Your turn');
      startClock('white');
    }
  } catch(e) {
    console.error(e);
    setStatus('','Connection error — is the server running?');
  } finally {
    isBotThinking=false;
    $('#thinkBar').removeClass('on');
    $('#board').removeClass('bot-thinking');
  }
}

/* ══ Eval bar ══════════════════════════════════════════════ */
async function fetchEval() {
  if (game.game_over()) return;
  try {
    const r=await $.ajax({url:'/eval',type:'POST',contentType:'application/json',data:JSON.stringify({fen:game.fen()})});
    updateEvalBar(r.score);
  } catch(e) {}
}
function updateEvalBar(score) {
  const c=Math.max(-800,Math.min(800,score));
  const pct=(50+c/16).toFixed(1);
  $('#evalBarWhite').css('height',pct+'%');
  $('#evalScore').text(score>9000?'M':score<-9000?'-M':(score/100).toFixed(1));
}

/* ══ Clock ═════════════════════════════════════════════════ */
function initClocks() {
  if (!timeMins) { $('#clockBot,#clockYou').addClass('hidden').text('—'); return; }
  clockWhite=clockBlack=timeMins*60;
  $('#clockBot,#clockYou').removeClass('hidden');
  renderClocks();
}
function renderClocks() {
  $('#clockYou').text(fmt(clockWhite)).toggleClass('low-time',clockWhite<=10);
  $('#clockBot').text(fmt(clockBlack)).toggleClass('low-time',clockBlack<=10);
}
function fmt(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }
function startClock(color) {
  if (!timeMins) return;
  stopClock();
  clockInterval=setInterval(()=>{
    if (color==='white') { clockWhite=Math.max(0,clockWhite-1); if(!clockWhite){stopClock();flagFall('white');} }
    else { clockBlack=Math.max(0,clockBlack-1); if(!clockBlack){stopClock();flagFall('black');} }
    renderClocks();
  },1000);
}
function stopClock() { clearInterval(clockInterval); clockInterval=null; }
function flagFall(c) {
  if (c==='white') { session.losses++; showModalDirect('⏱','Time!','Your flag fell — you lose on time!'); calcElo(0); }
  else             { session.wins++;   showModalDirect('⏱','Time!','Bot flag fell — you win on time!');   calcElo(1); }
  updateStats();
}

/* ══ Opening ════════════════════════════════════════════════ */
function updateOpening() {
  const o=getOpening(game);
  if (o) {
    $('#openingName').text(o.name);
    $('#openingVar').text(o.var?'· '+o.var:'');
    $('#openingBadge').addClass('has-opening');
  } else {
    $('#openingName').text('Starting Position');
    $('#openingVar').text('');
    $('#openingBadge').removeClass('has-opening');
  }
}

/* ══ Hint ═══════════════════════════════════════════════════ */
$('#btnHint').on('click', async function(){
  if (isBotThinking||game.game_over()||game.turn()!=='w') return;
  usedHint=true; $(this).text('…').prop('disabled',true);
  try {
    const r=await $.ajax({url:'/move',type:'POST',contentType:'application/json',
      data:JSON.stringify({fen:game.fen(),difficulty:'hard',user_id:'hint',move:''})});
    const f=r.move.slice(0,2),t=r.move.slice(2,4);
    $(`#board .square-${f},#board .square-${t}`).css('background','rgba(85,144,224,.6)');
    setTimeout(()=>$(`#board .square-${f},#board .square-${t}`).css('background',''),2500);
  } catch(e){}
  $(this).text('💡 Hint').prop('disabled',false);
});

/* ══ Status / turns ════════════════════════════════════════ */
function setStatus(s,t){$('#statusBadge').attr('data-s',s);$('#statusTxt').text(t);}
function setTurnBars(yours){$('#barYou').toggleClass('active-turn',yours);$('#barBot').toggleClass('active-turn',!yours);}

/* ══ Captures ══════════════════════════════════════════════ */
function updateCaptures() {
  let byYou=[],byBot=[];
  for (const m of game.history({verbose:true}))
    if (m.captured) (m.color==='w'?byYou:byBot).push(SYMS[m.captured]);
  $('#capByYou').text(byYou.join(''));
  $('#capByBot').text(byBot.join(''));
}

/* ══ Highlights ════════════════════════════════════════════ */
function highlightMove(f,t){
  $('.highlight-square').removeClass('highlight-square');
  $(`#board .square-${f}`).addClass('highlight-square');
  $(`#board .square-${t}`).addClass('highlight-square');
}

/* ══ History ════════════════════════════════════════════════ */
function addToHistory(move,player){
  const n=Math.ceil(game.history().length/2);
  if (player==='you')
    $('#move-history').append(`<div class="move-row" id="mr-${n}"><span class="mn">${n}.</span><span class="you">${move.san}</span></div>`);
  else {
    const row=$(`#mr-${n}`);
    if(row.length) row.append(`<span class="bot"> ${move.san}</span>`);
  }
  const mh=document.getElementById('move-history');
  mh.scrollTop=mh.scrollHeight;
}
function rebuildHistory(){
  $('#move-history').empty();
  let tmp=new Chess();
  game.history({verbose:true}).forEach((m,i)=>{
    const mv=tmp.move({from:m.from,to:m.to,promotion:m.promotion||'q'});
    const n=Math.floor(i/2)+1;
    if(i%2===0) $('#move-history').append(`<div class="move-row" id="mr-${n}"><span class="mn">${n}.</span><span class="you">${mv.san}</span></div>`);
    else $(`#mr-${n}`).append(`<span class="bot"> ${mv.san}</span>`);
  });
}

/* ══ Stats ══════════════════════════════════════════════════ */
function updateStats(){
  $('#s-wins').text(session.wins);$('#s-loss').text(session.losses);
  $('#s-draw').text(session.draws);$('#s-move').text(session.moves);
}
function bumpStat(id){const e=$(id);e.addClass('bump');setTimeout(()=>e.removeClass('bump'),380);}

/* ══ ELO ════════════════════════════════════════════════════ */
const DIFF_ELO={easy:600,medium:1400,hard:1900};
function calcElo(result){
  const K=32,Ro=DIFF_ELO[selectedDiff];
  const exp=1/(1+Math.pow(10,(Ro-elo)/400));
  const delta=Math.round(K*(result-exp));
  elo=Math.max(100,elo+delta);
  session.elo=elo; saveState();
  $('#eloDisplay,#headerElo').text(elo);
  const sign=delta>0?`+${delta} ↑`:delta<0?`${delta} ↓`:'±0';
  const cls =delta>0?'up':delta<0?'down':'flat';
  $('#eloDelta').text(sign).attr('class','elo-delta '+cls);
  $('#mEloDelta').text(delta>0?`+${delta} ELO`:delta<0?`${delta} ELO`:'±0 ELO').attr('class','modal-elo-delta '+cls);
  return delta;
}

/* ══ Achievements ═══════════════════════════════════════════ */
function checkAchievements(){
  for (const d of ACH_DEFS)
    if (!achieved.includes(d.id)&&d.check(session)){
      achieved.push(d.id); saveState(); showAchievement(d);
    }
}
function showAchievement(d){
  const t=$(`<div class="achievement-toast"><div class="toast-icon">${d.icon}</div><div class="toast-body"><div class="toast-title">Achievement: ${d.title}</div><div class="toast-desc">${d.desc}</div><div class="toast-progress"><div class="toast-progress-bar"></div></div></div></div>`);
  $('#achievementStack').append(t);
  setTimeout(()=>{t.addClass('dismissing');setTimeout(()=>t.remove(),400);},4200);
}

/* ══ Game over ═════════════════════════════════════════════ */
function endGame(srv){
  stopClock();
  session.lastGameMoves=Math.ceil(game.history().length/2);
  let result,g,title,sub;
  if (game.in_checkmate()){
    if (game.turn()==='w'){
      result=0;g='☠';title='Checkmate';sub='CUBO wins. Review your moves and try again.';
      session.losses++;bumpStat('#s-loss');
    } else {
      result=1;g='♛';title='Brilliant!';sub='You checkmated CUBO — outstanding play!';
      session.wins++;
      if(selectedDiff==='hard') session.hardWin=true;
      if(!usedUndo) session.winsNoUndo++;
      bumpStat('#s-wins');
    }
  } else if (game.in_stalemate()){
    result=.5;g='🤝';title='Stalemate';sub='No legal moves — honourable draw.';
    session.draws++;bumpStat('#s-draw');
  } else if (game.in_draw()){
    result=.5;g='=';title='Draw';
    sub=srv&&srv.draw_reason?`Draw by ${srv.draw_reason}.`:'The game ends in a draw.';
    session.draws++;bumpStat('#s-draw');
  } else { result=.5;g='♟';title='Game Over';sub=''; }

  updateStats(); calcElo(result); checkAchievements();
  showModalDirect(g,title,sub);
}
function showModalDirect(glyph,title,sub){
  $('#mGlyph').text(glyph);$('#mTitle').text(title);$('#mSub').text(sub);
  $('#modalOv').removeClass('hidden');
}

/* ══ Analysis ═══════════════════════════════════════════════ */
async function showAnalysis(){
  $('#analysisOv').removeClass('hidden');
  $('#analysisSummary').html('<p style="color:var(--text-2);font-size:.84rem;padding:10px 0">Analysing moves…</p>');
  $('#analysisMoves').empty();
  try {
    const res=await $.ajax({url:'/analyze',type:'POST',contentType:'application/json',data:JSON.stringify({pgn:game.pgn()})});
    const moves=res.moves||[];
    let best=0,inac=0,mis=0,blun=0;
    moves.forEach(m=>{if(m.quality==='best')best++;if(m.quality==='inaccuracy')inac++;if(m.quality==='mistake')mis++;if(m.quality==='blunder')blun++;});
    $('#analysisSummary').html(`
      <div class="analysis-stat"><div class="analysis-stat-val good">${best}</div><div class="analysis-stat-lbl">Best</div></div>
      <div class="analysis-stat"><div class="analysis-stat-val" style="color:var(--blue)">${inac}</div><div class="analysis-stat-lbl">Inaccuracies</div></div>
      <div class="analysis-stat"><div class="analysis-stat-val warn">${mis}</div><div class="analysis-stat-lbl">Mistakes</div></div>
      <div class="analysis-stat"><div class="analysis-stat-val bad">${blun}</div><div class="analysis-stat-lbl">Blunders</div></div>`);
    $('#analysisMoves').html(moves.map((m,i)=>{
      const pl=m.color==='w'?'you':'bot',n=Math.floor(i/2)+1,pr=m.color==='w'?`${n}.`:`${n}…`,q=m.quality||'ok';
      return `<div class="analysis-move-row"><div class="am-num">${pr}</div><div class="am-moves"><span class="am-san ${pl}">${m.san}</span><span class="am-badge ${q}">${q}</span>${m.best_san&&m.best_san!==m.san?`<div class="am-eval">Best: ${m.best_san}</div>`:''}</div></div>`;
    }).join(''));
  } catch(e){$('#analysisSummary').html('<p style="color:var(--text-2);font-size:.84rem;padding:10px 0">Needs Flask server running.</p>');}
}
$('#mAnalyze').on('click',()=>{$('#modalOv').addClass('hidden');showAnalysis();});
$('#navAnalysis').on('click',()=>{if(game.history().length>0)showAnalysis();});
$('#analysisClose').on('click',()=>$('#analysisOv').addClass('hidden'));

/* ══ FEN/PGN ════════════════════════════════════════════════ */
$('#btnImport').on('click',function(){
  const v=$('#pgnInput').val().trim(); if(!v) return;
  try{game.load(v);board.position(game.fen());$('#move-history').empty();updateCaptures();updateOpening();setStatus('your-turn','Position loaded');return;}catch(e){}
  try{if(game.load_pgn(v)){board.position(game.fen());rebuildHistory();updateCaptures();updateOpening();setStatus('your-turn','PGN loaded');}}catch(e){alert('Invalid FEN or PGN.');}
});
$('#btnExportFen').on('click',()=>{const f=game.fen();$('#pgnInput').val(f);navigator.clipboard.writeText(f).catch(()=>{});});
$('#btnExportPgn').on('click',()=>{const p=game.pgn({max_width:60,newline_char:'\n'});$('#pgnInput').val(p);navigator.clipboard.writeText(p).catch(()=>{});});

/* ══ Puzzle mode ════════════════════════════════════════════ */
function startPuzzle(){
  puzzleMode=true;
  $('#diffSection,#timeSection').hide();
  $('#puzzleBar').addClass('visible');
  stopClock(); clearSelection();
  setStatus('puzzle','Solve the puzzle!');
  loadPuzzle();
}
function exitPuzzle(){
  puzzleMode=false;
  $('#diffSection,#timeSection').show();
  $('#puzzleBar').removeClass('visible');
  resetGame();
}
function loadPuzzle(){
  currentPuzzle=PUZZLES[puzzleIdx%PUZZLES.length]; puzzleStep=0;
  game.load(currentPuzzle.fen);
  board.position(currentPuzzle.fen);
  board.orientation(game.turn()==='b'?'black':'white');
  $('#move-history').empty(); updateCaptures(); updateOpening();
  $('#puzzleDesc').text(currentPuzzle.desc);
  $('#puzzleRating').text(currentPuzzle.rating);
  $('#puzzleResult').removeClass('correct wrong').text('').hide();
  $('#btnPuzzleNext').addClass('hidden');
  setStatus('puzzle','Find the best move!');
}
function handlePuzzleDrop(move){
  const sol=currentPuzzle.solution;
  const uci=move.from+move.to+(move.promotion||'');
  if (uci===sol[puzzleStep]){
    puzzleStep++;
    if (puzzleStep>=sol.length){
      session.puzzlesSolved++;
      elo=Math.min(3000,elo+5);session.elo=elo;saveState();
      $('#eloDisplay,#headerElo').text(elo);
      $('#puzzleResult').addClass('correct').text('✓ Correct! Well done.').show();
      $('#btnPuzzleNext').removeClass('hidden');
      checkAchievements();
    } else {
      setTimeout(()=>{
        const r=sol[puzzleStep];
        game.move({from:r.slice(0,2),to:r.slice(2,4),promotion:r[4]||'q'});
        board.position(game.fen()); puzzleStep++;
      },500);
    }
  } else {
    game.undo(); board.position(game.fen());
    $('#puzzleResult').addClass('wrong').text('✗ Not quite — try again!').show();
    setTimeout(()=>$('#puzzleResult').hide(),2000);
  }
}
$('#btnPuzzleSkip').on('click',()=>{puzzleIdx++;loadPuzzle();});
$('#btnPuzzleNext').on('click',()=>{puzzleIdx++;loadPuzzle();});
$('#modePuzzleBtn,#navPuzzle').on('click',function(){
  $('.mode-btn').removeClass('active');$('#modePuzzleBtn').addClass('active');
  startPuzzle();
});

/* ══ Reset / Undo ═══════════════════════════════════════════ */
function resetGame(){
  if(isBotThinking) return;
  stopClock(); clearSelection(); isDragging=false;
  game.reset(); board.position('start'); board.orientation('white');
  usedUndo=false; usedHint=false; lastTipAt=-1;
  $('#move-history').empty();
  $('#capByYou,#capByBot').empty();
  $('.highlight-square').removeClass('highlight-square');
  $('#board').removeClass('check-glow bot-thinking');
  $('#modalOv').addClass('hidden');
  updateOpening(); updateEvalBar(0); initClocks();
  setStatus('your-turn','Your turn'); setTurnBars(true);
  if(!puzzleMode){
    $('.mode-btn').removeClass('active');$('[data-mode="bot"]').addClass('active');
    $('#diffSection,#timeSection').show();$('#puzzleBar').removeClass('visible');
  }
}
$('#btnNew,#mNew').on('click',()=>{exitPuzzle();resetGame();});
$('#mClose').on('click',()=>$('#modalOv').addClass('hidden'));
$('#btnUndo').on('click',function(){
  if(isBotThinking||game.game_over()||puzzleMode) return;
  game.undo();game.undo();usedUndo=true;
  board.position(game.fen());clearSelection();
  rebuildHistory();updateCaptures();updateOpening();fetchEval();
  $('.highlight-square').removeClass('highlight-square');
  $('#board').removeClass('check-glow');
  setStatus('your-turn','Your turn');setTurnBars(true);
});
$('#btnFlip').on('click',()=>board.flip());

/* ══ Theme / Difficulty / Time ══════════════════════════════ */
$('#themeToggle').on('click',function(){
  const c=document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme',c==='light'?'':'light');
});
const BOT_RATINGS={easy:'Elo ~600',medium:'Elo ~1400',hard:'Elo ~1900'};
$('.diff-btn').on('click',function(){
  $('.diff-btn').removeClass('active');$(this).addClass('active');
  selectedDiff=$(this).data('diff');
  $('#botRating').text(BOT_RATINGS[selectedDiff]);
});
$('.time-pill').on('click',function(){
  $('.time-pill').removeClass('active');$(this).addClass('active');
  timeMins=parseInt($(this).data('mins'));if(!isBotThinking) initClocks();
});
$('[data-mode="bot"]').on('click',function(){
  if(puzzleMode) exitPuzzle();
  else{$('.mode-btn').removeClass('active');$(this).addClass('active');}
});

/* ══ Board resize on window resize ══════════════════════════ */
$(window).on('resize',function(){
  board.resize();
});

/* ══ Init ═══════════════════════════════════════════════════ */
$('#eloDisplay,#headerElo').text(elo);
updateStats();
setStatus('your-turn','Your turn');
setTurnBars(true);
initClocks();

});