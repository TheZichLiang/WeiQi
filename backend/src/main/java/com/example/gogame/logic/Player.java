package com.example.gogame.logic;

import java.awt.Color;

import com.fasterxml.jackson.annotation.JsonIgnore;

public enum Player {
    BLACK(1, Color.BLACK),
    WHITE(2, Color.WHITE); 

    private final int value;
    
    @JsonIgnore
    private final Color color;

    Player(int value, Color color) {
        this.value = value;
        this.color = color;
    }

    public int getValue() {
        return value;
    }

    public Color getColor() {
        return color;
    }
    
    public Player other() {
        return this == BLACK ? WHITE : BLACK;
    }
}

