package com.example.gogame.ai;

import java.util.*;

import com.example.gogame.logic.*;
import com.example.gogame.scoring.GameResult;
import com.example.gogame.scoring.Score;

public class MCTSBot implements Agent {
    private int numRounds;
    private double temperature;

    public MCTSBot(int numRounds, double temperature) {
        this.numRounds = numRounds;
        this.temperature = temperature;
    }

    public Move selectMove(GameState gameState) {
        MCTSNode root = new MCTSNode(gameState, null, null);

        for (int i = 0; i < numRounds; i++) {
            MCTSNode node = root;

            while (!node.canAddChild() && !node.isTerminal()) {
                node = selectChild(node);
            }

            if (node.canAddChild()) {
                node = node.addRandomChild();
            }

            Player winner = simulateRandomGame(node.getGameState());

            while (node != null) {
                node.recordWin(winner);
                node = node.getParent();
            }
        }

        // Choose the best move
        Move bestMove = null;
        double bestPct = -1.0;
        for (MCTSNode child : root.getChildren()) {
            if (child.getNumRollouts() == 0) {
                continue;
            }
            double childPct = child.winningFrac(gameState.getNextPlayer());
            System.out.println("Move: " + child.getMove() + ", Win rate: " + childPct);
            if (childPct > bestPct && !child.getMove().isResign()) {
                bestPct = childPct;
                bestMove = child.getMove();
            }
        }
        if (bestPct < 0.1 && root.getNumRollouts() > 100) { // Example threshold and rollout condition
            bestMove = Move.resign();
        }else if (bestMove == null) {
            bestMove = Move.passTurn();
        }
        System.out.println("Selected move: " + bestMove);
        return bestMove;
    }

    private MCTSNode selectChild(MCTSNode node) {
        int totalRollouts = node.getChildren().stream().mapToInt(MCTSNode::getNumRollouts).sum();
        if (totalRollouts == 0){
            return null;
        }
        double logRollouts = Math.log(totalRollouts);
        double bestScore = -1;
        MCTSNode bestChild = null;
        for (MCTSNode child : node.getChildren()) {
            if (child.getNumRollouts()==0 || child.getMove().isResign()){
                continue;
            }
            double winPct = child.winningFrac(node.gameState.getNextPlayer());
            double expFactor = Math.sqrt(logRollouts/ child.getNumRollouts());
            double uctScore = winPct + this.temperature * expFactor;
            if (uctScore> bestScore) {
                bestScore = uctScore;
                bestChild = child;
            }
        }
        return bestChild;
    }

    private Player simulateRandomGame(GameState gameState) {
        Map<Player, Agent> bots = Map.of(Player.BLACK, new BeginnerBot(), Player.WHITE, new BeginnerBot());

        while (!gameState.isOver()) {
            Move botsMove = bots.get(gameState.getNextPlayer()).selectMove(gameState);
            if (botsMove.isResign()) {
                // If a bot chooses to resign, the game ends and we get the winner
                gameState = gameState.applyMove(botsMove);
                break;
            }
            System.out.println("Bot's move: " + botsMove);
            gameState = gameState.applyMove(botsMove);
        }
        GameResult result = Score.computeGameResult(gameState.getBoard());
        System.out.println("Game finished. Winner: " + gameState.winner() + ". Score: " + result);
        return gameState.winner();
    }

    public static class MCTSNode {
        private GameState gameState;
        private MCTSNode parent;
        private Move move;
        private Map<Player, Integer> winCounts;
        private int numRollouts;
        private List<MCTSNode> children;
        private List<Move> unvisitedMoves;

        public MCTSNode(GameState gameState, MCTSNode parent, Move move) {
            this.gameState = gameState;
            this.parent = parent;
            this.move = move;
            this.winCounts = new HashMap<>(Map.of(Player.BLACK, 0, Player.WHITE, 0));
            this.numRollouts = 0;
            this.children = new ArrayList<>();
            this.unvisitedMoves = new ArrayList<>(gameState.legalMoves());
        }

        public MCTSNode addRandomChild() {
            Random random = new Random();
            int index = random.nextInt(unvisitedMoves.size());
            Move newMove = unvisitedMoves.remove(index);
            GameState newGameState = gameState.applyMove(newMove);
            MCTSNode newNode = new MCTSNode(newGameState, this, newMove);
            children.add(newNode);
            return newNode;
        }

        public void recordWin(Player winner) {
            if (winner == null) {
                System.err.println("Error: Winner is null.");
                return;
            }
            winCounts.put(winner, winCounts.get(winner) + 1);
            numRollouts++;
            System.out.println("Recorded win for: " + winner + ". Total rollouts: " + numRollouts);
        }

        public boolean canAddChild() {
            return !unvisitedMoves.isEmpty();
        }

        public boolean isTerminal() {
            return gameState.isOver();
        }

        public double winningFrac(Player player) {
            if (numRollouts == 0) {
                return 0.0;
            }
            double winningFraction = (double) winCounts.get(player) / numRollouts;
            System.out.println("Winning fraction for player " + player + ": " + winningFraction);
            return winningFraction;
        }

        public GameState getGameState() {
            return gameState;
        }

        public MCTSNode getParent() {
            return parent;
        }

        public Move getMove() {
            return move;
        }

        public List<MCTSNode> getChildren() {
            return children;
        }

        public int getNumRollouts() {
            return numRollouts;
        }
    }
}