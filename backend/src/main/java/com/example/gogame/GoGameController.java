package com.example.gogame;

import java.util.*;

import com.example.gogame.logic.*;
import com.example.gogame.scoring.*;
import com.example.gogame.ai.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "https://terpconnect.umd.edu/")
public class GoGameController {

    private GameState boardXY;
    private int size;
    private Agent aiAgent;

    @GetMapping("/")
    public String home() {
        return "Welcome to the Backend API!";
    }

    @PostMapping("/playgo/startgame")
    public ResponseEntity<?> startGame(@RequestBody Map<String, Object> jsonObject) {
        String boardSize = (String) jsonObject.get("boardSize");
        String aiLevel = (String) jsonObject.get("aiLevel");
        size = Integer.parseInt(boardSize);
        boardXY = GameState.newGame(size);
        System.out.println(boardSize + aiLevel);
        switch (aiLevel) {
            case "beginner":
                aiAgent = new BeginnerBot();
                break;
            case "ddk":
                aiAgent = new AlphaBetaBot(3); // Example depth and evaluator
                break;
            case "sdk":
                aiAgent = new MCTSBot(500, 0.15);
                break;
        }
        return ResponseEntity.ok(Map.of("status", "success", "message", "Game started with board size: " + boardSize));
    }

    @PostMapping("/playgo/usermove")
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
                Set<Point> capturedPoints = boardXY.getCapturedPoints();
                List<Map<String, Integer>> capturedPointsList = new ArrayList<>();
                for (Point p : capturedPoints) {
                    capturedPointsList.add(Map.of("col", p.getCol(), "row", p.getRow()));
                }

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
    
    @PostMapping("/playgo/aimove")
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
            Set<Point> aiCapturedPoints = boardXY.getCapturedPoints();
            List<Map<String, Integer>> aiCapturedPointsList = new ArrayList<>();
            for (Point p : aiCapturedPoints) {
                aiCapturedPointsList.add(Map.of("col", p.getCol(), "row", p.getRow()));
            }
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

    @PostMapping("/playgo/scoring")
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
}