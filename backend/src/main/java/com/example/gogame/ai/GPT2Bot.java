package com.example.gogame.ai;

import com.example.gogame.logic.*;
import com.example.gogame.inference.GPT2Client;

public class GPT2Bot implements Agent{
    private GPT2Client gpt2Client;

    public GPT2Bot(String difficulty) {
        this.gpt2Client = new GPT2Client(difficulty);
    }

    @Override
    public Move selectMove(GameState gameState) {
        String prompt = serializeMoves(gameState);
        String moveStr = gpt2Client.predict(prompt);
        Point predictedPoint = parseMove(moveStr);

        System.out.println("Prompt sent to GPT-2: " + prompt);
        System.out.println("Raw GPT-2 output: " + moveStr);
        System.out.println("Parsed point: " + predictedPoint);

        if (predictedPoint == null) {
            System.out.println("Failed to parse a valid point. Falling back to PASS.");
            return Move.passTurn();
        }

        Move predictedMove = Move.play(predictedPoint);

        if (gameState.isValidMove(predictedMove)) {
            return predictedMove;
        } else {
            System.out.println("Predicted move is invalid on the current board. Falling back to PASS.");
            return Move.passTurn();
        }
    }

    private String serializeMoves(GameState state) {
        StringBuilder sb = new StringBuilder();
        java.util.List<String> moveList = new java.util.ArrayList<>();

        GameState current = state;
        while (current.getLastMove() != null && current.getPreviousState() != null) {
            Move move = current.getLastMove();
            Player player = current.getPreviousState().getNextPlayer();  // the player who just moved
            if (move.isPlay()) {
                int col = move.getPoint().getCol();
                int row = move.getPoint().getRow();
                char sgfCol = (char) ('a' + col);
                char sgfRow = (char) ('a' + row);
                moveList.add(player.name().charAt(0) + "" + sgfCol + sgfRow);
            } else if (move.isPass()) {
                moveList.add(player.name().charAt(0) + "PASS");
            }
            current = current.getPreviousState();
        }

        sb.append("<|startoftext|>");
        // Append in correct order
        for (int i = moveList.size() - 1; i >= 0; i--) {
            sb.append(moveList.get(i));
        }
        return sb.toString();
    }
    
    private Point parseMove(String moveStr) {
        if (moveStr == null || moveStr.trim().equalsIgnoreCase("PASS")) {
            return null;
        }

        moveStr = moveStr.trim();

        // Support format like "Bae" (no brackets)
        if (moveStr.length() == 3 && (moveStr.startsWith("B") || moveStr.startsWith("W"))) {
            char colChar = moveStr.charAt(1);
            char rowChar = moveStr.charAt(2);
            int col = colChar - 'a';
            int row = rowChar - 'a';
            return new Point(col, row);
        }
        return null;
    }
}