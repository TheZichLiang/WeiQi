package com.example.gogame;

import com.example.gogame.logic.*;
import com.example.gogame.multiplayer.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "https://tyderoom.com")
public class MultiController {

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signIn(@RequestBody Map<String, String> body) {
        String playerId = body.get("playerId");
        int boardSize = Integer.parseInt(body.getOrDefault("boardSize", "19"));

        MultiplayerSession session = SessionManager.getOrCreateSession(playerId, boardSize);

        Map<String, Object> response = new HashMap<>();
        response.put("player1Id", session.getPlayer1Id());
        response.put("player2Id", session.getPlayer2Id());
        response.put("boardSize", session.getBoardSize());
        response.put("yourColor", session.getColorForPlayer(playerId).toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/move")
    public ResponseEntity<?> makeMove(@RequestBody Map<String, Object> json) {
        String playerId = (String) json.get("playerId");
        Object colObj = json.get("col");
        Object rowObj = json.get("row");

        if (playerId == null || colObj == null || rowObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields."));
        }

        int col = ((Number) colObj).intValue();
        int row = ((Number) rowObj).intValue();

        MultiplayerSession session = SessionManager.getSession(playerId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No session found for player."));
        }

        if (!session.isPlayersTurn(playerId)) {
            return ResponseEntity.ok(Map.of("validMove", false, "error", "Not your turn"));
        }

        GameState game = session.getGameState();
        Point movePoint = new Point(col, row);
        Move move = Move.play(movePoint);

        if (!game.isValidMove(move)) {
            return ResponseEntity.ok(Map.of("validMove", false, "gameOver", false));
        }

        GameState nextState = game.applyMove(move);
        session.setGameState(nextState);
        session.recordMove(move);

        if (nextState.isOver()) {
            return ResponseEntity.ok(Map.of(
                "validMove", true,
                "gameOver", true,
                "message", "Game over.",
                "winner", nextState.winner().toString()
            ));
        }

        List<Map<String, Integer>> capturedList = GameService.convertCapturedPoints(nextState.getCapturedPoints());

        return ResponseEntity.ok(Map.of(
            "validMove", true,
            "capturedPoints", capturedList,
            "gameOver", false
        ));
    }

    @GetMapping("/state")
    public ResponseEntity<?> getGameState(@RequestParam String playerId) {
        MultiplayerSession session = SessionManager.getSession(playerId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No session found for player."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("board", session.getGameState().getBoardAsList());
        response.put("currentTurn", session.getGameState().getNextPlayer().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resign")
    public ResponseEntity<?> resign(@RequestBody Map<String, String> json) {
        String playerId = json.get("playerId");

        MultiplayerSession session = SessionManager.getSession(playerId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No session found for player."));
        }

        GameState game = session.getGameState();
        game.applyMove(Move.resign());

        return ResponseEntity.ok(Map.of(
            "message", "Player " + playerId + " resigned.",
            "winner", game.winner().toString(),
            "gameOver", true
        ));
    }

   @PostMapping("/manualinit")
    public ResponseEntity<?> manualInit(@RequestBody Map<String, Object> body) {
        String playerId = (String) body.get("playerId");
        int step = ((Number) body.get("step")).intValue();

        MultiplayerSession session = SessionManager.getSession(playerId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No session"));
        }

        List<Move> history = session.getMoveHistory();
        GameState manualState = GameState.newGame(session.getBoardSize());
        manualState = GameService.applyManualHistory(manualState, history, step, session);
        return ResponseEntity.ok(Map.of("board", manualState.getBoardAsList()));
    }

    @PostMapping("/manualmove")
    public ResponseEntity<?> manualMove(@RequestBody Map<String, Object> body) {
        String playerId = (String) body.get("playerId");
        int step = ((Number) body.get("step")).intValue();
        int col  = ((Number) body.get("col")).intValue();
        int row  = ((Number) body.get("row")).intValue();
        String color = (String) body.get("color");

        MultiplayerSession session = SessionManager.getSession(playerId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No session"));
        }

        List<Move> history = session.getMoveHistory();
        GameState state = GameService.applyManualHistory(GameState.newGame(session.getBoardSize()), history, step, session);

        Map<String, Object> result = GameService.processManualMove(state, col, row, color, true);

        if ((boolean) result.get("validMove")) {
            session.setGameState((GameState) result.get("updatedBoard"));
        }

        result.remove("updatedBoard");
        return ResponseEntity.ok(result);
    }
}
