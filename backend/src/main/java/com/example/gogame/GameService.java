package com.example.gogame;

import com.example.gogame.logic.*;
import com.example.gogame.multiplayer.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashMap; 

public class GameService {

    public static GameState applyManualHistory(GameState state, List<Move> moves, int step, MultiplayerSession session) {
        for (int i = 0; i < step && i < moves.size(); i++) {
            Move move = moves.get(i);
            if (move.isPlay()) {
                Player player = (session != null) ? session.getColorForPlayerAtIndex(i) : null;
                if (player == null && state.isValidMove(move)) {
                    state = state.applyMove(move);  // single-player logic
                } else if (player != null && state.isValidManualMove(move.getPoint(), player)) {
                    state = state.applyManualMove(move.getPoint(), player);  // multiplayer logic
                }
            }
        }
        return state;
    }

    public static Map<String, Object> processManualMove(GameState board, int col, int row, String color, boolean includeCaptured) {
        Player player = color.equalsIgnoreCase("black") ? Player.BLACK : Player.WHITE;
        Point point = new Point(col, row);

        if (!board.isValidManualMove(point, player)) {
            return Map.of(
                "validMove", false,
                "message", "Invalid manual move. Point may already be occupied or illegal."
            );
        }

        GameState updatedBoard = board.applyManualMove(point, player);
        Map<String, Object> result = new HashMap<>();
        result.put("validMove", true);
        result.put("boardState", updatedBoard.getBoardAsList());
        result.put("lastMove", Map.of("col", col, "row", row));
        result.put("updatedBoard", updatedBoard);

        if (includeCaptured) {
            result.put("capturedPoints", convertCapturedPoints(updatedBoard.getCapturedPoints()));
        }

        return result;
    }

    public static List<Map<String, Integer>> convertCapturedPoints(Set<Point> capturedPoints) {
        List<Map<String, Integer>> result = new ArrayList<>();
        for (Point p : capturedPoints) {
            result.add(Map.of("col", p.getCol(), "row", p.getRow()));
        }
        return result;
    }
}
