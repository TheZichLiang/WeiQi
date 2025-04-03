package com.example.gogame.scoring;

import com.example.gogame.logic.*;
import java.util.*;

public class GameResult {
    private int blackPoints;
    private int whitePoints;
    private double komi;
    private Set<Point> blackTerritoryPoints;
    private Set<Point> whiteTerritoryPoints;

    public GameResult(int blackPoints, int whitePoints, double komi, Set<Point> blackTerritoryPoints, Set<Point> whiteTerritoryPoints) {
        this.blackPoints = blackPoints;
        this.whitePoints = whitePoints;
        this.komi = komi;
        this.blackTerritoryPoints = blackTerritoryPoints;
        this.whiteTerritoryPoints = whiteTerritoryPoints;
    }

    public Player getWinner() {
        if (blackPoints > whitePoints + komi) {
            return Player.BLACK;
        }
        return Player.WHITE;
    }

    public double getWinningMargin() {
        double whiteScore = whitePoints + komi;
        return Math.abs(blackPoints - whiteScore);
    }

    @Override
    public String toString() {
        double whiteScore = whitePoints + komi;
        if (blackPoints > whiteScore) {
            return "B+" + (blackPoints - whiteScore);
        } else {
            return "W+" + (whiteScore - blackPoints);
        }
    }

    public int getWhitePoints() {
        return whitePoints;
    }

    public int getBlackPoints() {
        return blackPoints;
    }

    public double getKomi() {
        return komi;
    }
    public Set<Point> getBlackTerritoryPoints() {
        return blackTerritoryPoints;
    }

    public Set<Point> getWhiteTerritoryPoints() {
        return whiteTerritoryPoints;
    }
}