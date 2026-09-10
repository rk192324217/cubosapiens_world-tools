"""
CUBO Chess Engine — engine.py
Adaptive AI: adjusts depth, blunder rate, and style based on player ELO + session data.
"""
import time
import random
import json
import os
import chess

# ── Piece values ──────────────────────────────────────────────────────────────
PIECE_VALUES = {
    chess.PAWN: 100, chess.KNIGHT: 320, chess.BISHOP: 330,
    chess.ROOK: 500, chess.QUEEN:  900, chess.KING:   20000,
}

# ── Piece-Square Tables (White perspective, a1=idx 0) ────────────────────────
PST = {
    chess.PAWN: [
         0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0,
    ],
    chess.KNIGHT: [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50,
    ],
    chess.BISHOP: [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20,
    ],
    chess.ROOK: [
         0,  0,  0,  0,  0,  0,  0,  0,
         5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
         0,  0,  0,  5,  5,  0,  0,  0,
    ],
    chess.QUEEN: [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20,
    ],
    chess.KING: [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20,
    ],
}
PST_KING_EG = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
]

# ── Opening book ──────────────────────────────────────────────────────────────
OPENING_BOOK = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq":   "e2e4",
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq": "e7e5",
    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq": "d7d5",
    "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq": "c2c4",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq": "g1f3",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq": "b8c6",
    "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq": "f1b5",
    "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq": "f1e2",
    "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq": "c2c4",
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq": "c7c5",
}

def get_opening_move(board):
    key = ' '.join(board.fen().split(' ')[:3])
    uci = OPENING_BOOK.get(key)
    if uci:
        move = chess.Move.from_uci(uci)
        if move in board.legal_moves:
            return move
    return None

# ── Endgame detection ─────────────────────────────────────────────────────────
def is_endgame(board):
    queens  = len(board.pieces(chess.QUEEN,  chess.WHITE)) + len(board.pieces(chess.QUEEN,  chess.BLACK))
    minors  = sum(len(board.pieces(pt, c))
                  for pt in (chess.ROOK, chess.BISHOP, chess.KNIGHT)
                  for c  in (chess.WHITE, chess.BLACK))
    return queens == 0 or (queens == 2 and minors <= 2)

# ── Static evaluation ─────────────────────────────────────────────────────────
def evaluate(board):
    if board.is_checkmate():
        return -99999 if board.turn == chess.WHITE else 99999
    if board.is_stalemate() or board.is_insufficient_material():
        return 0
    if board.can_claim_fifty_moves() or board.can_claim_threefold_repetition():
        return 0

    eg = is_endgame(board)
    score = 0

    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if not piece:
            continue
        val = PIECE_VALUES[piece.piece_type]
        if piece.piece_type == chess.KING and eg:
            table = PST_KING_EG
        else:
            table = PST.get(piece.piece_type, [0]*64)
        idx = sq if piece.color == chess.WHITE else chess.square_mirror(sq)
        pst_bonus = table[idx]
        if piece.color == chess.WHITE:
            score += val + pst_bonus
        else:
            score -= val + pst_bonus

    # Mobility
    original = board.turn
    board.turn = chess.WHITE
    wm = board.legal_moves.count()
    board.turn = chess.BLACK
    bm = board.legal_moves.count()
    board.turn = original
    score += (wm - bm) * 2

    # Center control
    for sq in [chess.D4, chess.E4, chess.D5, chess.E5]:
        p = board.piece_at(sq)
        if p:
            score += 10 if p.color == chess.WHITE else -10

    # Check pressure
    if board.is_check():
        score += -15 if board.turn == chess.WHITE else 15

    return score

# ── Move ordering ─────────────────────────────────────────────────────────────
def order_moves(board):
    def score(move):
        s = 0
        if board.is_capture(move):
            victim   = board.piece_at(move.to_square)
            attacker = board.piece_at(move.from_square)
            if victim and attacker:
                s += 10 * PIECE_VALUES.get(victim.piece_type, 0) - PIECE_VALUES.get(attacker.piece_type, 0)
            else:
                s += 500  # en passant
        if move.promotion:
            s += PIECE_VALUES.get(move.promotion, 0)
        board.push(move)
        if board.is_check():
            s += 50
        board.pop()
        return s
    return sorted(board.legal_moves, key=score, reverse=True)

# ── Minimax with alpha-beta ───────────────────────────────────────────────────
def minimax(board, depth, alpha, beta, maximizing):
    if depth == 0 or board.is_game_over():
        return evaluate(board)
    if maximizing:
        best = -float('inf')
        for move in order_moves(board):
            board.push(move)
            val  = minimax(board, depth-1, alpha, beta, False)
            board.pop()
            best  = max(best, val)
            alpha = max(alpha, val)
            if beta <= alpha:
                break
        return best
    else:
        best = float('inf')
        for move in order_moves(board):
            board.push(move)
            val  = minimax(board, depth-1, alpha, beta, True)
            board.pop()
            best = min(best, val)
            beta = min(beta, val)
            if beta <= alpha:
                break
        return best

def minimax_root(board, depth):
    """Find best move for the side to move."""
    best_move  = None
    ai_white   = (board.turn == chess.WHITE)
    best_score = -float('inf') if ai_white else float('inf')

    for move in order_moves(board):
        board.push(move)
        score = minimax(board, depth-1, -float('inf'), float('inf'), not ai_white)
        board.pop()
        if ai_white and score > best_score:
            best_score, best_move = score, move
        elif not ai_white and score < best_score:
            best_score, best_move = score, move

    return best_move

# ── Adaptive AI ───────────────────────────────────────────────────────────────
def _adaptive_params(difficulty, session_data):
    """
    Compute (depth, blunder_chance, random_chance) based on:
    • The chosen difficulty
    • Player's ELO  — higher ELO → AI plays stronger
    • Session wins  — win streak → AI ramps up
    • Session losses — loss streak → AI eases off slightly (assistive mode)

    This creates a rubber-band feel: the bot adapts to keep games competitive
    and educational rather than crushing or boring the player.
    """
    player_elo  = session_data.get('elo',    1200)
    wins        = session_data.get('wins',   0)
    losses      = session_data.get('losses', 0)
    net         = wins - losses  # positive = player doing well

    if difficulty == 'easy':
        depth         = 1
        blunder_chance = 0.35
        random_chance  = 0.50
        # If player is losing a lot, reduce blunders slightly to help
        if net < -3:
            blunder_chance = 0.20
            random_chance  = 0.35

    elif difficulty == 'medium':
        depth         = 2
        blunder_chance = 0.10
        random_chance  = 0.15
        # Player on winning streak → play a bit sharper
        if net >= 3:
            depth = 3; blunder_chance = 0.05
        # Player struggling → ease off
        elif net <= -3:
            blunder_chance = 0.20; random_chance = 0.25
        # Boost depth slightly if player ELO is high
        if player_elo >= 1500:
            depth = max(depth, 3)

    else:  # hard
        depth         = 4
        blunder_chance = 0.0
        random_chance  = 0.0
        # Even on Hard, boost depth if player is very strong
        if player_elo >= 1700 or net >= 5:
            depth = 5
        # Slight rubber-band on Hard if player is really struggling
        if net <= -4:
            depth = 3; blunder_chance = 0.05

    return depth, blunder_chance, random_chance

def _evaluate_single(board, move):
    board.push(move)
    score = evaluate(board)
    board.pop()
    return score

# ── Public API ────────────────────────────────────────────────────────────────
def get_ai_move(board, difficulty, user_id=None, session_data=None):
    if session_data is None:
        session_data = {}

    print(f"[AI] diff={difficulty}  turn={'W' if board.turn==chess.WHITE else 'B'}  "
          f"elo={session_data.get('elo',1200)}  net={session_data.get('wins',0)-session_data.get('losses',0)}")

    legal = list(board.legal_moves)
    if not legal:
        return None

    depth, blunder_chance, random_chance = _adaptive_params(difficulty, session_data)

    # Think delay (scaled down for adaptive hard)
    delays = { 'easy': (0.1, 0.4), 'medium': (0.3, 0.8), 'hard': (0.4, 1.1) }
    lo, hi = delays.get(difficulty, (0.3, 0.8))
    time.sleep(random.uniform(lo, hi))

    # ── Easy: mostly random / occasional blunder ──────────────────────────────
    if difficulty == 'easy':
        if random.random() < blunder_chance:
            scored = sorted([(m, _evaluate_single(board, m)) for m in legal[:20]],
                            key=lambda x: x[1])
            pool = scored[:max(1, len(scored)//3)]
            return random.choice(pool)[0]
        if random.random() < random_chance:
            return random.choice(legal)
        return minimax_root(board, depth)

    # ── Medium: depth-2/3 with occasional randomness ──────────────────────────
    elif difficulty == 'medium':
        if random.random() < blunder_chance:
            return random.choice(legal[:min(5, len(legal))])
        if random.random() < random_chance:
            # pick from top-3 moves (not strictly best) for variety
            candidates = []
            for move in order_moves(board)[:6]:
                board.push(move)
                s = minimax(board, depth-1, -float('inf'), float('inf'),
                            board.turn == chess.WHITE)
                board.pop()
                candidates.append((move, s))
            candidates.sort(key=lambda x: x[1],
                            reverse=(board.turn == chess.WHITE))
            top3 = candidates[:3]
            return random.choice(top3)[0]
        return minimax_root(board, depth)

    # ── Hard: opening book + deep minimax ────────────────────────────────────
    else:
        if len(board.move_stack) < 10:
            opening = get_opening_move(board)
            if opening:
                print(f"[AI] Opening: {opening}")
                return opening
        return minimax_root(board, depth)