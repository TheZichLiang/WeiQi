package com.example.gogame;

import java.util.*;
import com.example.gogame.logic.*;
import com.example.gogame.scoring.*;
import com.example.gogame.ai.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://tyderoom.com")
public class GoGameController {

    private GameState boardXY;
    private int size;
    private Agent aiAgent;

    @GetMapping("/")
    public String home() {
        return "Welcome to the Backend API!";
    }

    @PostMapping("/startgame")
    public ResponseEntity<?> startGame(@RequestBody Map<String, Object> jsonObject) {
        String boardSize = (String) jsonObject.get("boardSize");
        String aiLevel = (String) jsonObject.get("aiLevel");
        size = Integer.parseInt(boardSize);
        boardXY = GameState.newGame(size);

        System.out.println("Board Size: " + boardSize + ", AI Level: " + aiLevel);

        // Only allow GPT2Bot if board size is 19
        if (size == 19) {
            switch (aiLevel) {
                case "beginner":
                    aiAgent = new BeginnerBot();
                    break;
                case "ddk":
                case "sdk":
                case "low-dan":
                case "high-dan":
                    aiAgent = new GPT2Bot(aiLevel); // allow GPT2 for trained board size
                    break;
                default:
                    aiAgent = new BeginnerBot(); // fallback
                    break;
            }
        } else {
            // GPT2 not trained for 9x9 or 13x13 — use BeginnerBot for all levels
            aiAgent = new BeginnerBot();
            System.out.println("GPT2Bot not supported on board sizes other than 19. Using BeginnerBot instead.");
        }

        return ResponseEntity.ok(Map.of("status", "success", "message", "Game started with board size: " + boardSize + ", AI level: " + aiLevel));
    }

    @PostMapping("/usermove")
    public ResponseEntity<?> handleUserMove(@RequestBody Map<String, Object> jsonObject) {
        try {
            int gridCol = (int) jsonObject.get("gridCol");
            int gridRow = (int) jsonObject.get("gridRow");
            String moveType = (String) jsonObject.get("moveType");
            Move playerMove;

            if (moveType.equals("pass")) {
                playerMove = Move.passTurn();
            } else if (moveType.equals("resign")) {
                playerMove = Move.resign();
            } else {
                Point movePoint = new Point(gridCol, gridRow);
                playerMove = Move.play(movePoint);
            }

            if (boardXY.isValidMove(playerMove)) {
                boardXY = boardXY.applyMove(playerMove);
                if (boardXY.isOver()) {
                    if (playerMove.isPass()) {
                        return ResponseEntity.ok(Map.of("gameOver", true, "message", "Two consecutive passes made."));
                    } else if (playerMove.isResign()) {
                        return ResponseEntity.ok(Map.of("gameOver", true, "message", "You resigned. White wins!"));
                    }
                }
                if (playerMove.isPass()) {
                    return ResponseEntity.ok(Map.of("gameOver", false, "message", "You passed."));
                }
                List<Map<String, Integer>> capturedPointsList = GameService.convertCapturedPoints(boardXY.getCapturedPoints());
                return ResponseEntity.ok(Map.of(
                    "validMove", true,
                    "capturedPoints", capturedPointsList,
                    "gameOver", false
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "validMove", false,
                    "gameOver", false
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "Failed to place stone"));
        }
    }
    
    @PostMapping("/aimove")
    public ResponseEntity<?> handleAIMove() {
        try {
            Move aiMove = aiAgent.selectMove(boardXY);
            boardXY = boardXY.applyMove(aiMove);
            if (boardXY.isOver()) {
                if (aiMove.isPass()) {
                    return ResponseEntity.ok(Map.of("gameOver", true, "message", "Two consecutive passes made."));
                } else if (aiMove.isResign()) {
                    return ResponseEntity.ok(Map.of("gameOver", true, "message", "AI resigned. Black wins!"));
                }
            }
            if (aiMove.isPass()) {
                return ResponseEntity.ok(Map.of("gameOver", false, "message", "AI passed."));
            }
            List<Map<String, Integer>> aiCapturedPointsList = GameService.convertCapturedPoints(boardXY.getCapturedPoints());
            return ResponseEntity.ok(Map.of(
                "validMove", true,
                "aiMove", Map.of("col", aiMove.getPoint().getCol(), "row", aiMove.getPoint().getRow()),
                "aiCapturedPoints", aiCapturedPointsList,
                "gameOver", false
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "Failed to process AI move"));
        }
    }

    @PostMapping("/scoring")
    public ResponseEntity<?> calculateScore() {
        try {
            // Evaluate the territory
            Territory territory = Score.evaluateTerritory(boardXY.getBoard());

            // Log the territory results for debugging
            System.out.println("Black Territory: " + territory.getNumBlackTerritory());
            System.out.println("White Territory: " + territory.getNumWhiteTerritory());
            System.out.println("Black Stones: " + territory.getNumBlackStones());
            System.out.println("White Stones: " + territory.getNumWhiteStones());
            System.out.println("Dame Points: " + territory.getNumDame());

            GameResult gameResult = Score.computeGameResult(boardXY.getBoard());
            // Log the game result for debugging
            System.out.println("Black Points: " + gameResult.getBlackPoints());
            System.out.println("White Points: " + gameResult.getWhitePoints());
            System.out.println("Komi: " + gameResult.getKomi());
            System.out.println("Winner: " + (gameResult.getWinner() == Player.BLACK ? "Black" : "White"));
            System.out.println("Winning Margin: " + gameResult.getWinningMargin());

            Set<Point> blackTerritoryCoords = gameResult.getBlackTerritoryPoints();
            Set<Point> whiteTerritoryCoords = gameResult.getWhiteTerritoryPoints();
            List<Map<String, Integer>> blackTerritory = new ArrayList<>();
            for (Point p : blackTerritoryCoords){
                blackTerritory.add(Map.of("col", p.getCol(), "row", p.getRow()));
            }
            List<Map<String, Integer>> whiteTerritory = new ArrayList<>();
            for (Point p : whiteTerritoryCoords){
                whiteTerritory.add(Map.of("col", p.getCol(), "row", p.getRow()));
            }
            if (boardXY.isOver()) {
                return ResponseEntity.ok(Map.of(
                    "resignstatus", boardXY.getLastMove().isResign(),
                    "blackScore", gameResult.getBlackPoints(),
                    "whiteScore", gameResult.getWhitePoints() + gameResult.getKomi(),
                    "winner", gameResult.getWinner().toString(),
                    "winningMargin", gameResult.getWinningMargin(),
                    "blackTerritory", blackTerritory,
                    "whiteTerritory", whiteTerritory
                ));
            }
            return ResponseEntity.ok(Map.of(
                "blackScore", gameResult.getBlackPoints(),
                "whiteScore", gameResult.getWhitePoints(),
                "winner", gameResult.getWinner().toString(),
                "winningMargin", gameResult.getWinningMargin(),
                "blackTerritory", blackTerritory,
                "whiteTerritory", whiteTerritory
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "Failed to calculate score"));
        }
    }

    @PostMapping("/sgf/board")
    public ResponseEntity<?> getBoardStateFromSgf(@RequestBody Map<String, Object> payload) {
        try {
            String sgf = (String) payload.get("sgf");
            int step = (int) payload.get("step");

            String cleanedSgf = sgf.replace("<|startoftext|>", "").replace("<|endoftext|>", "").trim();
            List<Move> moves = new ArrayList<>();
            for (int i = 0; i < cleanedSgf.length() - 2; i += 3) {
                int col = cleanedSgf.charAt(i + 1) - 'a';
                int row = cleanedSgf.charAt(i + 2) - 'a';
                Point p = new Point(col, row);
                moves.add(Move.play(p));
            }

            GameState current = GameState.newGame(19);
            Point lastMovePoint = null;

            for (int i = 0; i < Math.min(step, moves.size()); i++) {
                Move m = moves.get(i);
                if (current.isValidMove(m)) {
                    current = current.applyMove(m);
                    lastMovePoint = m.getPoint(); // Track the last move
                }
            }
            this.boardXY = current;
            this.size   = 19;

            List<Map<String, Object>> boardState = new ArrayList<>();
            for (Map.Entry<Point, Chain> entry : current.getBoard().getGrid().entrySet()) {
                if (entry.getValue() != null) {
                    Point p = entry.getKey();
                    String color = entry.getValue().getColor().equals(Player.BLACK.getColor()) ? "black" : "white";
                    boardState.add(Map.of("col", p.getCol(), "row", p.getRow(), "color", color));
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("boardState", boardState);
            response.put("totalMoves", moves.size());
            if (lastMovePoint != null) {
                response.put("lastMove", Map.of("col", lastMovePoint.getCol(), "row", lastMovePoint.getRow()));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "SGF parsing failed"));
        }
    }


    @PostMapping("/loadsgf")
    public ResponseEntity<?> loadSGF(@RequestBody Map<String, String> jsonObject) {
        try {
            String sgf = jsonObject.get("sgf");
            boardXY = GameState.newGame(19); // default size for SGF
            SgfParser.applySgf(boardXY, sgf);

            List<Map<String, Object>> stones = new ArrayList<>();
            for (Map.Entry<Point, Chain> entry : boardXY.getBoard().getGrid().entrySet()) {
                Point p = entry.getKey();
                Chain chain = entry.getValue();
                if (chain != null) {
                    String color = chain.getColor().equals(java.awt.Color.BLACK) ? "B" : "W";
                    stones.add(Map.of("col", p.getCol(), "row", p.getRow(), "color", color));
                }
            }

            return ResponseEntity.ok(Map.of("stones", stones, "message", "SGF loaded successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "Failed to parse SGF"));
        }
    }
    
    @PostMapping("/manualinit")
    public ResponseEntity<?> initializeManualBoard(@RequestBody Map<String, Object> json) {
        try {
            String sgf = (String) json.get("sgf");
            int baseStep = (int) json.get("step");

            // parse SGF & apply first baseStep moves
            String cleaned = sgf.replace("<|startoftext|>", "").replace("<|endoftext|>", "").trim();
            List<Move> moves = new ArrayList<>();
            for (int i = 0; i < cleaned.length() - 2; i += 3) {
                int col = cleaned.charAt(i+1) - 'a';
                int row = cleaned.charAt(i+2) - 'a';
                moves.add(Move.play(new Point(col, row)));
            }

            GameState state = GameState.newGame(19);
            state = GameService.applyManualHistory(state, moves, baseStep, null);
            // persist for future manual moves:
            this.boardXY = state;

            // build response boardState
            List<Map<String,Object>> boardList = state.getBoardAsList();

            return ResponseEntity.ok(Map.of(
                "boardState", boardList
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to initialize manual board"));
        }
    }

    @PostMapping("/manualmove")
    public ResponseEntity<?> handleManualMove(@RequestBody Map<String, Object> json) {
        try {
            int col = (int) json.get("col");
            int row = (int) json.get("row");
            String color = (String) json.get("color");
            Map<String, Object> result = GameService.processManualMove(boardXY, col, row, color, true);

            if ((boolean) result.get("validMove")) {
                boardXY = (GameState) result.get("updatedBoard");  // reassign board state
            }

            result.remove("updatedBoard");  // don't send internal object to frontend
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Failed to process manual move."
            ));
        }
    }
}
