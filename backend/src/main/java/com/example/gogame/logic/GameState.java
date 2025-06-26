package com.example.gogame.logic;

import java.util.*;
import com.example.gogame.scoring.*;

public class GameState {
    private Board board;
    private Player nextPlayer;
    private GameState previousState;
    private Move lastMove;
    private Set<Point> capturedPoints;

    public GameState(Board board, Player nextPlayer, GameState previousState, Move lastMove, Set<Point> capturedPoints) {
        this.board = board;
        this.nextPlayer = nextPlayer;
        this.previousState = previousState;
        this.lastMove = lastMove;
        this.capturedPoints = capturedPoints;
    }

    public GameState applyMove(Move move) {
        Board nextBoard;
        Set<Point> capturedPoints = new HashSet<>();
        if (move.isPlay()) {
            nextBoard = board.deepCopy();
            capturedPoints = nextBoard.placeStone(this.nextPlayer, move.getPoint());
            return new GameState(nextBoard, this.nextPlayer.other(), this, move, capturedPoints);
        } else {
            return new GameState(this.board, this.nextPlayer.other(), this, move, capturedPoints);
        }
    }

    public GameState applyManualMove(Point point, Player player) {
        Board nextBoard = this.board.deepCopy();
        Set<Point> captured = nextBoard.placeStone(player, point);
        Move move = Move.play(point);
        return new GameState(nextBoard, this.nextPlayer, this, move, captured);
    }
    

    public Set<Point> getCapturedPoints() {
        return this.capturedPoints;
    }

    public static GameState newGame(int boardSize) {
        Board board = new Board(boardSize, boardSize);
        return new GameState(board, Player.BLACK, null, null, new HashSet<>());
    }

    public boolean isOver() {
        if (this.lastMove == null) {
            return false;
        }
        if (this.lastMove.isResign()) {
            return true;
        }
        Move secondLastMove = this.previousState.lastMove;
        if (secondLastMove == null) {
            return false;
        }
        return this.lastMove.isPass() && secondLastMove.isPass();
    }

    public boolean isMoveSelfCapture(Player player, Move move) {
        if (!move.isPlay()) {
            return false;
        }
        Board nextBoard = this.board.deepCopy();
        capturedPoints = nextBoard.placeStone(player, move.getPoint());
        Chain newChain = nextBoard.getChain(move.getPoint());
        return newChain.getNumLiberties() == 0;
    }

    public boolean doesMoveViolateKo(Player player, Move move) {
        if (!move.isPlay()) {
            return false;
        }
        Board nextBoard = board.deepCopy();
        capturedPoints = nextBoard.placeStone(player, move.getPoint());
        Situation nextSituation = new Situation(player.other(), nextBoard);
        GameState pastState = this.previousState;
        while (pastState != null) {
            if (pastState.getSituation().equals(nextSituation)) {
                return true;
            }
            pastState = pastState.previousState;
        }
        return false;
    }

    public boolean isValidMove(Move move) {
        if (this.isOver()) {
            return false;
        }
        if (move.isPass() || move.isResign()) {
            return true;
        }
        return this.board.getChain(move.getPoint()) == null &&
                !this.isMoveSelfCapture(this.nextPlayer, move) &&
                !this.doesMoveViolateKo(this.nextPlayer, move);
    }

    public boolean isValidManualMove(Point point, Player player) {
        if (this.isOver()) {
            return false;
        }
        if (this.board.getChain(point) != null) {
            return false;
        }
        Move move = Move.play(point);
        return !this.isMoveSelfCapture(player, move) &&
            !this.doesMoveViolateKo(player, move);
    }

    public List<Move> legalMoves() {
        List<Move> moves = new ArrayList<>();
        for (int col = 0; col < this.board.getDim(); col++) {
            for (int row = 0; row < this.board.getDim(); row++) {
                Point point = new Point(col, row);
                Move move = Move.play(point);
                if (isValidMove(move)){
                    moves.add(move);
                }
            }
        }
        moves.add(Move.passTurn());
        moves.add(Move.resign());
        return moves;
    }

    public Player winner() {
        if(!this.isOver()){
            return null;
        }
        if (this.lastMove.isResign()) {
            return this.nextPlayer.other();
        }
        GameResult result = Score.computeGameResult(this.board);
        return result.getWinner();
    }


    public Board getBoard() {
        return this.board;
    }

    public List<Map<String, Object>> getBoardAsList() {
        List<Map<String, Object>> boardList = new ArrayList<>();
        for (Map.Entry<Point, Chain> entry : this.board.getGrid().entrySet()) {
            Chain chain = entry.getValue();
            if (chain != null) {
                Point p = entry.getKey();
                String color = chain.getColor().equals(Player.BLACK.getColor()) ? "black" : "white";
                boardList.add(Map.of(
                    "col", p.getCol(),
                    "row", p.getRow(),
                    "color", color
                ));
            }
        }
        return boardList;
    }

    
    public Move getLastMove() {
        return lastMove;
    }
    public GameState getPreviousState() {
        return this.previousState;
    }

    public Player getNextPlayer() {
        return nextPlayer;
    }

    public Situation getSituation() {
        return new Situation(this.nextPlayer, this.board);
    }

    private static class Situation {
        private Player player;
        private String[][] boardState;

        public Situation(Player player, Board board) {
            this.player = player;
            this.boardState = board.getBoardState();
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Situation situation = (Situation) o;
            return player == situation.player && Arrays.deepEquals(boardState, situation.boardState);
        }

        @Override
        public int hashCode() {
            return Objects.hash(player, Arrays.deepHashCode(boardState));
        }
    }
}