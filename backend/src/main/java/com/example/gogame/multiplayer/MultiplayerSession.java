package com.example.gogame.multiplayer;

import com.example.gogame.logic.*;

import java.util.*;

public class MultiplayerSession {
    private String player1Id;
    private String player2Id;
    private GameState gameState;
    private int boardSize;
    private Map<String, Player> playerColorMap = new HashMap<>();
    private List<Move> moveHistory = new ArrayList<>();

    public MultiplayerSession(int boardSize) {
        this.boardSize = boardSize;
        this.gameState = GameState.newGame(boardSize);
    }

    public void setPlayer1Id(String player1Id) {
        this.player1Id = player1Id;
        playerColorMap.put(player1Id, Player.BLACK);
    }

    public void setPlayer2Id(String player2Id) {
        this.player2Id = player2Id;
        playerColorMap.put(player2Id, Player.WHITE);
    }

    public Player getColorForPlayer(String playerId) {
        return playerColorMap.get(playerId);
    }

    public boolean isPlayersTurn(String playerId) {
        Player expected = gameState.getNextPlayer();
        Player actual = getColorForPlayer(playerId);
        return expected == actual;
    }

    public Player getColorForPlayerAtIndex(int moveIndex) {
        return (moveIndex % 2 == 0) ? Player.BLACK : Player.WHITE;
    }

    public String getPlayer1Id() {
        return player1Id;
    }

    public String getPlayer2Id() {
        return player2Id;
    }

    public GameState getGameState() {
        return gameState;
    }

    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public void recordMove(Move move) {
        moveHistory.add(move);
    }

    public List<Move> getMoveHistory() {
        return moveHistory;
    }
}