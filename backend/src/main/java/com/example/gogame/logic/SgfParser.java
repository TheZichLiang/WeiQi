package com.example.gogame.logic;

import java.util.regex.*;

public class SgfParser {

    public static GameState applySgf(GameState game, String sgf) {
        sgf = sgf.replace("<|startoftext|>", "").replace("<|endoftext|>", "");
        Pattern pattern = Pattern.compile(";([BW])\\[([a-s])([a-s])\\]");
        Matcher matcher = pattern.matcher(sgf);

        while (matcher.find()) {
            int col = matcher.group(2).charAt(0) - 'a';
            int row = matcher.group(3).charAt(0) - 'a';

            Point p = new Point(col, row);
            Move move = Move.play(p);
            if (game.isValidMove(move)) {
                game = game.applyMove(move);
            }
        }
        return game;
    }
}