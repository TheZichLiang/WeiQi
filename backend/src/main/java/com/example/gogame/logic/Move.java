package com.example.gogame.logic;

public class Move {
    private Point point;
    private boolean isPlay;
    private boolean isPass;
    private boolean isResign;

    public Move(Point point, boolean isPass, boolean isResign) {
        assert (point != null) ^ isPass ^ isResign;
        this.point = point;
        this.isPlay = (point != null);
        this.isPass = isPass;
        this.isResign = isResign;
    }

    public static Move play(Point point) {
        return new Move(point, false, false);
    }

    public static Move passTurn() {
        return new Move(null, true, false);
    }

    public static Move resign() {
        return new Move(null, false, true);
    }

    public Point getPoint() {
        return point;
    }

    public boolean isPlay() {
        return isPlay;
    }

    public boolean isResign() {
        return isResign;
    }

    public boolean isPass() {
        return isPass;
    }
    
    @Override
    public String toString() {
        if (isPlay) {
            return "Move: Play at " + point;
        } else if (isPass) {
            return "Move: Pass";
        } else if (isResign) {
            return "Move: Resign";
        } else {
            return "Move: Invalid";
        }
    }
}
