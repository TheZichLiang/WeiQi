package com.example.gogame.scoring;

import java.util.*;
import java.awt.Color;
import com.example.gogame.logic.*;

public class Score{
    public static Territory evaluateTerritory(Board board) {
        Map<Point, String> status = new HashMap<>();
        for (int col = 0; col < board.getDim(); col++) {
            for (int row = 0; row < board.getDim(); row++) {
                Point p = new Point(col, row);
                if (status.containsKey(p)) {
                    continue;
                }
                Color stoneColor = board.getChainColor(p);
                if (stoneColor != null) {
                    String stoneStr = stoneColor == Color.BLACK ? "black" : "white";
                    status.put(p, stoneStr);
                } else {
                    Region region = collectRegion(p, board, new HashMap<>());
                    Set<Point> group = region.getGroup();
                    Set<Color> neighbors = region.getNeighbors();
                    String fillWith;
                    if (neighbors.size() == 1) {
                        Color neighborColor = neighbors.iterator().next();
                        fillWith = neighborColor == Color.BLACK ? "territory_b" : "territory_w";
                    } else {
                        fillWith = "dame";
                    }
                    for (Point pos : group) {
                        status.put(pos, fillWith);
                    }
                }
            }
        }
        return new Territory(status);
    }

    public static Region collectRegion(Point start, Board board, Map<Point, Boolean> visited) {
        Set<Point> allPoints = new HashSet<>();
        Set<Color> allBorders = new HashSet<>();
        if (visited.containsKey(start)) {
            return new Region(new HashSet<>(), new HashSet<>());
        }
        allPoints.add(start);
        visited.put(start, true);
        Color here = board.getChainColor(start);
        int[][] deltas = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] delta : deltas) {
            int nextRow = start.getRow() + delta[0];
            int nextCol = start.getCol() + delta[1];
            Point neighbor = new Point(nextCol, nextRow);
            if (!board.isOnGrid(neighbor)) {
                continue;
            }
            Color neighborColor = board.getChainColor(neighbor);
            if (neighborColor == here) {
                Region region = collectRegion(neighbor, board, visited);
                allPoints.addAll(region.getGroup());
                allBorders.addAll(region.getNeighbors());
            } else {
                allBorders.add(neighborColor);
            }
        }
        return new Region(allPoints, allBorders);
    }

    public static GameResult computeGameResult(Board board) {
        Territory territory = evaluateTerritory(board);
        int blackPoints = territory.getNumBlackTerritory() + territory.getNumBlackStones();
        int whitePoints = territory.getNumWhiteTerritory() + territory.getNumWhiteStones();
        double komi = 7.5;
        if (territory.getNumBlackStones() == 1 && territory.getNumWhiteStones() == 0) {
            blackPoints = 1;
            whitePoints = 0;
            Set<Point> blackTerritoryPoints = new HashSet<>();
            for (Point p : board.getGrid().keySet()) {
                if (board.getChainColor(p) != null) {
                    blackTerritoryPoints.add(p);
                    break;
                }
            }
            return new GameResult(blackPoints, whitePoints, komi, blackTerritoryPoints, new HashSet<>());
        }
        return new GameResult(blackPoints, whitePoints, komi, territory.getBlackTerritoryPoints(), territory.getWhiteTerritoryPoints());
    }

    public static class Region {
        private Set<Point> group;
        private Set<Color> neighbors;

        public Region(Set<Point> group, Set<Color> neighbors) {
            this.group = group;
            this.neighbors = neighbors;
        }

        public Set<Point> getGroup() {
            return group;
        }

        public Set<Color> getNeighbors() {
            return neighbors;
        }
    }
}
