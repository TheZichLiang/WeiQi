# WeiQi (围棋) Online Go Game Simulation

> _A modern full-stack Go (Weiqi) game simulator with scalable AI agents, inspired by ancient strategy and modern machine learning._

---

## About the Project

WeiQi (Go) is a famous historical Chinese board game, played on standard 9x9, 13x13, or 19x19 boards (Goban) with the goal of capturing more territory than your opponent.
This web app simulates real-time gameplay against AI agents with 5 difficulty levels, ranging from beginner to professional level play.

📜 Inspired by *"Deep Learning and the Game of Go"* by Max Pumperla & Kevin Ferguson and AlphaZero https://arxiv.org/pdf/1712.01815

---

## AI Agent Difficulty Levels

|  Bot Name         |  Difficulty Level         |  Algorithm / Description |
|--------------------|-----------------------------|----------------------------|
| `BeginnerBot`      | 🟢 Beginner (30–20k)         | Random legal moves only. No strategy. |
| `AlphaBetaBot`     | 🟡 Double Digit Kyu (19–10k) | Alpha-Beta Pruning with capturing heuristic. |
| `MonteCarloBot`    | 🔵 Single Digit Kyu (9–1k)   | Monte Carlo Tree Search (MCTS). |
| `DeepNeuralBot`    | 🟣 Low Dan (1–7d)            | Deep Neural Network + Search (Planned). |
| `VisionLangBot`    | 🔴 High Dan (1–9p)           | Vision-Language Model + Search (Planned). |

<details>
<summary><strong>Click to expand agent descriptions</strong></summary>

### BeginnerBot
- Picks a random legal move.
- No evaluation performed.

### AlphaBetaBot
- Uses Minimax + Alpha-Beta Pruning.
- Evaluates moves by:
  - Exploring move trees to a fixed depth.
  - Prioritizing moves that capture opponent stones.
  - Avoiding unproductive branches via pruning.

### MonteCarloBot
- Uses MCTS with the 4-step process:
  1. **Selection:** Traverse using UCT.
  2. **Expansion:** Add new random child node.
  3. **Simulation:** Roll out games with BeginnerBot.
  4. **Backpropagation:** Update stats recursively.
- Selects move with highest win rate after the rollouts.

### DeepNeuralBot (Planned)
- CNN or GNN-based evaluation.
- Faster search via heuristic guidance.

### VisionLangBot (Planned)
- Vision-Language model to understand patterns.
- Paired with classical search (e.g., MCTS, Alpha-Beta).
- Intended to simulate professional play quality.

</details>

---

## 🖥️ Client–Server Architecture

```plaintext
Frontend   <--->   Backend   <--->   (Future) Database
 ReactJS              Java              PostgreSQL or MongoDB
 HTML/CSS         Spring Boot              (planned)
