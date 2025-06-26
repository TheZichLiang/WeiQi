# WeiQi (围棋) Online Go Game Simulation

> _A modern full-stack Go (Weiqi) game simulator with scalable AI agents, inspired by ancient strategy and modern machine learning._

---

## 🧠 About the Project

WeiQi (Go) is one of the oldest board games in the world, originating in China over 2,500 years ago. The game is played on a 9×9, 13×13, or 19×19 Goban, where the objective is to control more territory than your opponent.

This web app simulates real-time Go gameplay against AI agents of different strengths, enabling both casual play and serious training.

📜 Inspired by *"Deep Learning and the Game of Go"* by Max Pumperla & Kevin Ferguson and [AlphaZero](https://arxiv.org/pdf/1712.01815)

---

## 🤖 AI Agents

WeiQi supports two AI agents, enabling scalable difficulty from beginner to advanced amateur level play.

| Bot Name      | Difficulty Range        | Description |
|---------------|--------------------------|-------------|
| `BeginnerBot` | 🟢 Beginner (30–20 kyu)   | Picks random legal moves. No strategy or evaluation. |
| `GPT2Bot`     | 🔴 SDK to High Dan (9k–9p) | Transformer-based agent trained on professional SGF games. Scales in strength via decoding parameters. |

<details>
<summary><strong>Click to expand AI details</strong></summary>

### 🟢 BeginnerBot
- Selects random legal moves without strategic evaluation.
- Ideal for new players or debugging.

### 🔴 GPT2Bot
- Powered by a fine-tuned GPT-2 model trained on thousands of SGF-formatted professional Go games.
- Treats board positions as token sequences, learning tactical and strategic patterns like a language model.
- Scales in strength by adjusting:
  - 🔥 **Decoding temperature** (controls randomness)
  - 🧠 **Move filtering** (filters out weak/legal-only moves)
  - 🎲 **Top-k / Top-p sampling** (controls search breadth)
- Replaces the need for multiple classical AI systems like MCTS or CNNs.
- Integration: `GPT2Client.java` (Spring Boot) ↔ `GPT2Predict.py` (Python)

</details>

---

## 🖥️ Client–Server Architecture

```plaintext
Frontend (React)    <--->    Backend (Spring Boot)    <--->    (Planned) Database
    |                                |                               |
HTML/CSS/JS                Game Logic, AI Agents          PostgreSQL for multiplayer,
                             GPT2Bot, SGF parsing           login, and match records