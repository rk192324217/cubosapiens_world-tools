from flask import Flask, render_template, request, jsonify
import chess
import chess.pgn
import io
from engine import get_ai_move, evaluate, minimax_root
import json, os
from datetime import datetime

app = Flask(__name__,
            static_folder="../frontend/static",
            template_folder="../frontend/templates")

# ── Persistence ───────────────────────────────────────────
def load_user_data():
    try:
        with open("user_data.json", "r") as f:
            data = json.load(f)
            data.setdefault("users", {}); data.setdefault("games", [])
            return data
    except: return {"users": {}, "games": []}

def save_user_data(data):
    with open("user_data.json", "w") as f:
        json.dump(data, f, indent=2)

def log_mistake(user_id, fen, move_uci):
    entry = {"user_id": user_id, "fen": fen, "losing_move": move_uci, "timestamp": datetime.now().isoformat()}
    with open("mistakes.json", "a") as f:
        f.write(json.dumps(entry) + "\n")

# ── Routes ────────────────────────────────────────────────
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/move", methods=["POST"])
def handle_move():
    data       = request.json
    user_id    = data.get("user_id", "guest")
    difficulty = data.get("difficulty", "medium")
    fen        = data.get("fen")
    if not fen: return jsonify({"error": "Missing FEN"}), 400

    board = chess.Board(fen)
    if board.is_game_over():
        return jsonify({"error": "Game already over"}), 400

    # Track user move
    user_move_uci = data.get("move", "")
    if user_move_uci:
        ud = load_user_data()
        ue = ud["users"].setdefault(user_id, {"total_moves":0,"games_played":0,"last_played":datetime.now().isoformat()})
        ue["total_moves"] += 1
        ue["last_played"]  = datetime.now().isoformat()
        ud["games"].append({"game_id": f"game_{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
                            "user_id": user_id, "move": user_move_uci, "fen": fen,
                            "timestamp": datetime.now().isoformat(), "difficulty": difficulty})
        save_user_data(ud)

    fen_before = board.fen()
    ai_move    = get_ai_move(board, difficulty, user_id)
    if not ai_move: return jsonify({"error": "No legal moves"}), 400

    board.push(ai_move)
    is_checkmate = board.is_checkmate()
    is_stalemate = board.is_stalemate()
    is_fifty     = board.can_claim_fifty_moves()
    is_insuff    = board.is_insufficient_material()
    is_threefold = board.can_claim_threefold_repetition()
    is_draw      = is_stalemate or is_fifty or is_insuff or is_threefold

    if is_checkmate and board.turn == chess.BLACK:
        log_mistake(user_id, fen_before, ai_move.uci())

    return jsonify({
        "move":         ai_move.uci(),
        "fen":          board.fen(),
        "is_checkmate": is_checkmate,
        "is_stalemate": is_stalemate,
        "is_draw":      is_draw,
        "is_check":     board.is_check() and not is_checkmate,
        "draw_reason":  ("stalemate" if is_stalemate else "fifty-move rule" if is_fifty
                         else "insufficient material" if is_insuff
                         else "threefold repetition" if is_threefold else None),
    })

@app.route("/eval", methods=["POST"])
def handle_eval():
    """Return static evaluation of a position (centipawns, white positive)."""
    data = request.json
    fen  = data.get("fen")
    if not fen: return jsonify({"error": "Missing FEN"}), 400
    try:
        board = chess.Board(fen)
        score = evaluate(board)   # from engine.py (white positive)
        return jsonify({"score": score})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/analyze", methods=["POST"])
def handle_analyze():
    """
    Analyse every move in a PGN game and classify each as:
    best / ok / inaccuracy / mistake / blunder
    based on centipawn loss vs the engine's preferred move.
    """
    data = request.json
    pgn  = data.get("pgn", "")
    if not pgn: return jsonify({"error": "Missing PGN"}), 400

    try:
        pgn_io = io.StringIO(pgn)
        game   = chess.pgn.read_game(pgn_io)
        if not game: return jsonify({"error": "Invalid PGN"}), 400

        board    = game.board()
        results  = []
        DEPTH    = 2  # shallow for speed — increase for accuracy

        for node in game.mainline():
            move      = node.move
            board_pre = board.copy()

            # Score before the move (from the moving side's POV)
            score_before = evaluate(board_pre)
            if board_pre.turn == chess.BLACK:
                score_before = -score_before

            # Best move according to engine
            best_move  = minimax_root(board_pre, DEPTH)
            board_best = board_pre.copy()
            board_best.push(best_move)
            score_best = evaluate(board_best)
            if board_pre.turn == chess.BLACK:
                score_best = -score_best

            # Score after actual move
            board_after = board_pre.copy()
            board_after.push(move)
            score_after = evaluate(board_after)
            if board_pre.turn == chess.BLACK:
                score_after = -score_after

            cp_loss = score_best - score_after  # centipawns lost vs best

            if cp_loss <= 20:        quality = "best"
            elif cp_loss <= 60:      quality = "ok"
            elif cp_loss <= 120:     quality = "inaccuracy"
            elif cp_loss <= 250:     quality = "mistake"
            else:                    quality = "blunder"

            results.append({
                "san":      board_pre.san(move),
                "uci":      move.uci(),
                "color":    "w" if board_pre.turn == chess.WHITE else "b",
                "quality":  quality,
                "cp_loss":  cp_loss,
                "best_san": board_pre.san(best_move) if best_move and best_move != move else None,
            })

            board.push(move)

        return jsonify({"moves": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats/<user_id>", methods=["GET"])
def get_stats(user_id):
    ud   = load_user_data()
    user = ud["users"].get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    return jsonify(user)

# ── Startup ───────────────────────────────────────────────
if __name__ == "__main__":
    for fname, default in [("user_data.json", '{"users":{},"games":[]}'),
                           ("mistakes.json", "")]:
        if not os.path.exists(fname):
            with open(fname, "w") as f: f.write(default)
    app.run(debug=True)