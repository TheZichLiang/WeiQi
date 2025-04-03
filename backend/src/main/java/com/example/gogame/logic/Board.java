package com.example.gogame.logic;

import java.util.*;
import java.awt.Color;

public class Board {
    private int numRows;
    private int numCols;
    private Map<Point, Chain> grid;

    public Board(int numCols, int numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.grid = new HashMap<>();
        for (int col = 0; col < numCols; col++) {
            for (int row = 0; row < numRows; row++) {
                grid.put(new Point(col, row), null);
            }
        }
    }

    public Set<Point> placeStone(Player player, Point point) {
        assert isOnGrid(point);
        assert grid.get(point) == null;

        Set<Chain> adjacentSameColor = new HashSet<>();
        Set<Chain> adjacentOppositeColor = new HashSet<>();
        Set<Point> liberties = new HashSet<>();
        Set<Point> captures = new HashSet<>();

        for (Point neighbor : point.getNeighbors(numCols)) {
            if (!isOnGrid(neighbor)) {
                continue;
            }
            Chain neighborString = grid.get(neighbor);
            if (neighborString == null) {
                liberties.add(neighbor);
            } else if (neighborString.getColor().equals(player.getColor())) {
                if (!(adjacentSameColor.contains(neighborString))){
                    adjacentSameColor.add(neighborString);
                }
            } else {
                if (!(adjacentOppositeColor.contains(neighborString))){
                    adjacentOppositeColor.add(neighborString);
                }
            }
        }
        Chain newString = new Chain(player.getColor(), Set.of(point), liberties);
        for (Chain sameColorString : adjacentSameColor) {
            newString = newString.mergedWith(sameColorString);
        }

        for (Point newStringPoint : newString.getStones()) {
            grid.put(newStringPoint, newString);
        }
        for (Chain otherColorString : adjacentOppositeColor) {
            otherColorString.removeLiberty(point);
            for (Point oppositeColor : otherColorString.getStones()) {
                grid.put(oppositeColor, otherColorString);
            }
            if (otherColorString.getNumLiberties() == 0) {
                captures.addAll(otherColorString.getStones());
                removeString(otherColorString);
            }
        }
        return captures;
    }

    public boolean isOnGrid(Point point) {
        return point.getCol() >= 0 && point.getCol() <= numCols - 1 &&
               point.getRow() >= 0 && point.getRow() <= numRows - 1;
    }

    public Color getChainColor(Point point) {
        Chain string = grid.get(point);
        return (string == null) ? null : string.getColor();
    }

    public Chain getChain(Point point) {
        return grid.get(point);
    }

    private void removeString(Chain string) {
        for (Point point : string.getStones()) {
            for (Point neighbor : point.getNeighbors(numCols)) {
                Chain neighborString = grid.get(neighbor);
                if (neighborString != null && neighborString != string) {
                    neighborString.addLiberty(point);
                }
            }
            grid.put(point, null);
        }
    }


    public String[][] getBoardState() {
        String[][] boardArray = new String[numRows][numCols];
        for (int col = 0; col < numCols; col++) {
            for (int row = 0; row < numRows; row++) {
                Point point = new Point(col, row);
                Chain chain = grid.get(point);
                if (chain == null) {
                    boardArray[col][row] = ".";
                } else {
                    boardArray[col][row] = chain.getColor() == Color.BLACK ? "B" : "W";
                }
            }
        }
        return boardArray;
    }

    public Board deepCopy() {
        Board copy = new Board(this.numCols, this.numRows);
        for (Map.Entry<Point, Chain> entry : this.grid.entrySet()) {
            copy.grid.put((Point) entry.getKey().clone(), entry.getValue() == null ? null : entry.getValue().clone());
        }
        return copy;
    }

    public Map<Point, Chain> getGrid() {
        return this.grid;
    }

    public int getDim() {
        return numCols;
    }
}