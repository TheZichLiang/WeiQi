package com.example.gogame.ai;

import com.example.gogame.logic.*;

import java.util.*;

public class BeginnerBot implements Agent{

    public Move selectMove(GameState state){
        Set<Point> candidates = new HashSet<>();
        for (int c = 0; c < state.getBoard().getDim(); c++){
            for (int r = 0; r < state.getBoard().getDim(); r++){
                Point candidate = new Point(c, r);
                if (state.isValidMove(Move.play(candidate)) && !Helpers.isPointAnEye(state.getBoard(), candidate, state.getNextPlayer().getColor())){
                    candidates.add(candidate);
                }
            }
        }

        if (candidates.isEmpty()){
            return Move.passTurn();
        }
        Random random = new Random();
        int randomIndex = random.nextInt(candidates.size());
        int currentIndex = 0;
        for (Point candidate : candidates) {
            if (currentIndex == randomIndex) {
                return Move.play(candidate);
            }
            currentIndex++;
        }
        return Move.passTurn();
    }
}
