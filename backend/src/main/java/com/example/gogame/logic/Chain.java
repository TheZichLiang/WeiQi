package com.example.gogame.logic;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.awt.Color;

public class Chain implements Cloneable{
    private Color color;
    private Set<Point> stones;
    private Set<Point> liberties;

    public Chain(){}
    public Chain(Color color, Set<Point> stones, Set<Point> liberties) {
        this.color = color;
        this.stones = new HashSet<>(stones);
        this.liberties = new HashSet<>(liberties);
    }

    public void removeLiberty(Point point) {
        liberties.remove(point);
    }

    public void addLiberty(Point point) {
        liberties.add(point);
    }

    public Chain mergedWith(Chain other) {
        assert other.color == this.color;
        Set<Point> combinedStones = new HashSet<>(this.stones);
        combinedStones.addAll(other.stones);
        Set<Point> combinedLiberties = new HashSet<>(this.liberties);
        combinedLiberties.addAll(other.liberties);
        combinedLiberties.removeAll(combinedStones);
        return new Chain(this.color, combinedStones, combinedLiberties);
    }

    public int getNumLiberties() {
        return liberties.size();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Chain chain = (Chain) o;
        return color == chain.color &&
                stones.equals(chain.stones) &&
                liberties.equals(chain.liberties);
    }

    @Override
    public int hashCode() {
        return Objects.hash(color, stones, liberties);
    }


    public Color getColor(){
        return color;
    }

    public Set<Point> getStones(){
        return stones;
    }

    public Set<Point> getLiberties(){
        return liberties;
    }

    @Override
    public Chain clone() {
        try {
            Chain cloned = (Chain) super.clone();
            cloned.stones = new HashSet<>(this.stones); 
            cloned.liberties = new HashSet<>(this.liberties);
            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(); 
        }
    }
}
