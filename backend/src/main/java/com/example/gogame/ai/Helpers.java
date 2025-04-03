package com.example.gogame.ai;

import com.example.gogame.logic.*;
import java.util.*;
import java.awt.Color;

public class Helpers{

    public static boolean isPointAnEye(Board board, Point point, Color color) {
        if (board.getChain(point)!= null) {
            return false;
        }
        for (Point neighbor : point.getNeighbors(board.getDim())) {
            if (board.isOnGrid(neighbor) && board.getChainColor(neighbor) != color) {
                return false;
            }
        }

        int friendlyCorners = 0;
        int offBoardCorners = 0;
        List<Point> corners = Arrays.asList(
            new Point(point.getCol() - 1, point.getRow() - 1),
            new Point(point.getCol() - 1, point.getRow() + 1),
            new Point(point.getCol() + 1, point.getRow() - 1),
            new Point(point.getCol() + 1, point.getRow() + 1)
        );

        for (Point corner : corners) {
            if (!board.isOnGrid(corner)) {
                offBoardCorners++;
            } else if (board.getChainColor(corner) == color) {
                friendlyCorners++;
            }
        }
        if (offBoardCorners > 0) {
            return offBoardCorners + friendlyCorners == 4;
        }
        return friendlyCorners >= 3;
    }
}

