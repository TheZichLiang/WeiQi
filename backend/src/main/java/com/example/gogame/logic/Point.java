package com.example.gogame.logic;

import java.util.*;

public class Point implements Cloneable {
    private final int col;
    private final int row;

    public Point(int col, int row) {
        this.col = col;
        this.row = row;
    }

    public Set<Point> getNeighbors(int n) {
        Set<Point> neighbors = new HashSet<>();
        if (row > 0) {
            neighbors.add(new Point(col, row - 1));
        }
        if (row < n - 1) {
            neighbors.add(new Point(col, row + 1));
        }
        if (col > 0) {
            neighbors.add(new Point(col - 1, row));
        }
        if (col < n - 1) {
            neighbors.add(new Point(col + 1, row));
        }
        return neighbors;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point point = (Point) o;
        return row == point.row && col == point.col;
    }

    @Override
    public int hashCode() {
        return Objects.hash(col, row);
    }

    @Override
    public String toString() {
        return "Point{" +
                "col=" + col +
                ", row=" + row +
                '}';
    }

    @Override
    public Point clone() {
        try {
            return (Point) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}