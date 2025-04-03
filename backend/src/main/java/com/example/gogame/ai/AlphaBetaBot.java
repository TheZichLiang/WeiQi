package com.example.gogame.ai;

import com.example.gogame.logic.*;
import com.example.gogame.scoring.*;
import java.util.*;

public class AlphaBetaBot implements Agent {
    private int maxDepth;
    private static final int MAX_SCORE = Integer.MAX_VALUE;
    private static final int MIN_SCORE = Integer.MIN_VALUE;
    private Random random = new Random();
    private Map<GameState, Integer> transpositionTable = new HashMap<>();

    public AlphaBetaBot(int maxDepth) {
        this.maxDepth = maxDepth;
    }

    // Use the existing scoring algorithm
    public int evaluateBoard(GameState state) {
        GameResult result = Score.computeGameResult(state.getBoard());
        double scoreDifference = result.getBlackPoints() - (result.getWhitePoints() + result.getKomi());
        return state.getNextPlayer() == Player.BLACK ? (int) scoreDifference : -(int) scoreDifference;
    }

    public int alphaBetaResult(GameState gameState, int depth, int alpha, int beta) {
        if (gameState.isOver()) {
            return gameState.winner() == gameState.getNextPlayer() ? MAX_SCORE : MIN_SCORE;
        }

        if (depth == 0) {
            return evaluateBoard(gameState);
        }

        if (transpositionTable.containsKey(gameState)) {
            return transpositionTable.get(gameState);
        }

        if (gameState.getNextPlayer() == Player.WHITE) {
            int bestScore = MIN_SCORE;
            for (Move move : orderMoves(gameState)) {
                GameState nextState = gameState.applyMove(move);
                int score = alphaBetaResult(nextState, depth - 1, alpha, beta);
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
            }
            transpositionTable.put(gameState, bestScore);
            return bestScore;
        } else {
            int bestScore = MAX_SCORE;
            for (Move move : orderMoves(gameState)) {
                GameState nextState = gameState.applyMove(move);
                int score = alphaBetaResult(nextState, depth - 1, alpha, beta);
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break; // Alpha cutoff
                }
            }
            transpositionTable.put(gameState, bestScore);
            return bestScore;
        }
    }

    public Move selectMove(GameState gameState) {
        List<Move> bestMoves = new ArrayList<>();
        int bestScore = MIN_SCORE;
        int alpha = MIN_SCORE;
        int beta = MAX_SCORE;

        System.out.println("Evaluating legal moves...");
        for (Move move : orderMoves(gameState)) {
            GameState nextState = gameState.applyMove(move);
            int score = alphaBetaResult(nextState, this.maxDepth, alpha, beta);
            if (bestMoves.isEmpty() || score > bestScore) {
                bestMoves.clear();
                bestMoves.add(move);
                bestScore = score;
                alpha = Math.max(alpha, score); // Update alpha
            } else if (score == bestScore) {
                bestMoves.add(move);
            }
        }

        if (bestMoves.isEmpty()) {
            System.out.println("No valid moves found.");
            return Move.passTurn(); // or handle appropriately
        }

        Move selectedMove = bestMoves.get(random.nextInt(bestMoves.size()));
        System.out.println("Selected move: " + selectedMove);
        return selectedMove;
    }

    private List<Move> orderMoves(GameState gameState) {
        List<Move> moves = new ArrayList<>(gameState.legalMoves());

        // Move ordering logic: prioritize capturing moves
        moves.sort((move1, move2) -> {
            int captureScore1 = getCaptureScore(gameState, move1);
            int captureScore2 = getCaptureScore(gameState, move2);
            return Integer.compare(captureScore2, captureScore1); // Descending order
        });

        return moves;
    }

    // Function to calculate the capture score for a given move
    private int getCaptureScore(GameState gameState, Move move) {
        if (!move.isPlay()) {
            return 0; // Assign 0 score for pass or resign moves
        }
        Board boardCopy = gameState.getBoard().deepCopy();
        Set<Point> capturedStones = boardCopy.placeStone(gameState.getNextPlayer(), move.getPoint());
        return capturedStones.size();
    }
}