# CUBO Chess AI Web App

CUBO Chess is a full-stack chess application built with a focus on clean design, intuitive interaction, and an intelligent AI opponent.
This project integrates a Flask-based backend, a modern JavaScript frontend, and a handcrafted AI engine using Minimax with evaluation heuristics.

A great demonstration of practical AI integration, UI/UX design, and full-stack deployment.

---

### Live Demo

Play now: [https://cubo-chess.onrender.com](https://cubo-chess.onrender.com)

---

## Key Features

* Three AI difficulty levels: Easy (random), Medium (strategic), Hard (deep evaluation)
* Smart AI engine using Minimax + Alpha-Beta pruning
* Piece-square table evaluation for positional awareness
* Move highlights with sound feedback
* Captured pieces display for both players
* Move history tracking (PGN-style)
* Mistake learning: AI avoids repeating fatal moves
* Responsive UI: Mobile-friendly, clean layout

---

## AI Engine

The core of the bot is a customized Minimax implementation with:

* Material scoring
* Positional heuristics (piece-square tables)
* Center control bias
* Opening book for early-game strength
* Checkmate memory — logs losing moves and avoids them in future games

---

## Technologies Used

| Layer      | Stack                                                  |
| ---------- | ------------------------------------------------------ |
| Frontend   | HTML, CSS, JavaScript, jQuery, chess.js, chessboard.js |
| Backend    | Python, Flask, Gunicorn                                |
| AI Engine  | python-chess + custom evaluation                       |
| Deployment | Render (cloud hosting)                                 |
| Versioning | Git + GitHub                                           |

---

## Run Locally

```bash
# Clone the repo
git clone https://github.com/rk192324217/CUBO-CHESS-WEB.git
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Open your browser and go to [http://localhost:5000](http://localhost:5000).

---

## Project Structure

```
CUBO-CHESS-WEB/
├── backend/
│   ├── app.py             # Flask app and routing
│   ├── engine.py          # Minimax AI logic
│   ├── requirements.txt
│   ├── user_data.json     # Stores user interactions
│   ├── mistakes.json      # Stores AI's learned mistakes
│
├── frontend/
│   ├── templates/index.html
│   └── static/
│       ├── js/script.js
│       ├── css/style.css
│       ├── sounds/move.mp3
│       └── img/chesspieces/...
```

---

## Planned Enhancements

* PGN/FEN export and import
* Time controls and timers
* Dark mode / UI theme toggle
* Multiplayer or hot-seat mode
* AI self-improvement with data weight tuning

---

## About the Developer

Rajesh Kanna S
B.Tech Artificial Intelligence and Data Science
SIMATS Engineering College, Chennai
LinkedIn: [https://www.linkedin.com/in/rajesh-kanna-a43237304/](https://www.linkedin.com/in/rajesh-kanna-a43237304/)
GitHub: [https://github.com/rk192324217](https://github.com/rk192324217)

This project is part of my portfolio as I aim to become a machine learning engineer at Microsoft or Google. Your feedback is welcome.

---

## License

MIT License. Feel free to fork, extend, and use this project in your own learning journey.

---

## Support the Project

If you found this useful or inspiring:

* Star the repository
* Share it with others
* Contribute ideas or improvements
