package com.example.gogame.scoring;

import java.util.*;
import com.example.gogame.logic.*;

public class Territory {
    private int numBlackTerritory;
    private int numWhiteTerritory;
    private int numBlackStones;
    private int numWhiteStones;
    private int numDame;
    private Set<Point> damePoints;
    private Set<Point> blackTerritoryPoints;
    private Set<Point> whiteTerritoryPoints;

    public Territory(Map<Point, String> territoryMap) {
        this.damePoints = new HashSet<>();
        this.blackTerritoryPoints = new HashSet<>(); 
        this.whiteTerritoryPoints = new HashSet<>(); 
        for (Map.Entry<Point, String> entry : territoryMap.entrySet()) {
            switch (entry.getValue()) {
                case "black":
                    numBlackStones++;
                    blackTerritoryPoints.add(entry.getKey());
                    break;
                case "white":
                    numWhiteStones++;
                    whiteTerritoryPoints.add(entry.getKey());
                    break;
                case "territory_b":
                    numBlackTerritory++;
                    blackTerritoryPoints.add(entry.getKey());
                    break;
                case "territory_w":
                    numWhiteTerritory++;
                    whiteTerritoryPoints.add(entry.getKey());
                    break;
                case "dame":
                    numDame++;
                    damePoints.add(entry.getKey());
                    break;
            }
        }
    }

    public Set<Point> getBlackTerritoryPoints() {
        return blackTerritoryPoints;
    }

    public Set<Point> getWhiteTerritoryPoints() {
        return whiteTerritoryPoints;
    }

    public Set<Point> getDamePoints() {
        return damePoints;
    }

    public int getNumBlackTerritory() {
        return numBlackTerritory;
    }

    public int getNumWhiteTerritory() {
        return numWhiteTerritory;
    }

    public int getNumBlackStones() {
        return numBlackStones;
    }

    public int getNumWhiteStones() {
        return numWhiteStones;
    }

    public int getNumDame() {
        return numDame;
    }
}

