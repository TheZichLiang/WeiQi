package com.example.gogame;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import com.example.gogame.logic.*;
import com.example.gogame.ai.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class GogameApplicationTests {

    @Test
     void testBasicPrediction9x9() {
        GameState state = GameState.newGame(9);
        state = state.applyMove(Move.play(new Point(3, 3))); // B[dd]
        state = state.applyMove(Move.play(new Point(5, 5))); // W[ff]
        state = state.applyMove(Move.play(new Point(4, 4))); // B[ee]
        state = state.applyMove(Move.play(new Point(5, 4))); // W[fe]

        GPT2Bot bot = new GPT2Bot("ddk");
        Move aiMove = bot.selectMove(state);

        System.out.println("GPT2Bot predicted: " + aiMove);

        assertNotNull(aiMove);
        assertTrue(aiMove.isPlay() || aiMove.isPass());
        assertTrue(state.isValidMove(aiMove));
    }
        
    @Test
    void testBotDoesNotResign() {
        GameState state = GameState.newGame(19);
        GPT2Bot bot = new GPT2Bot("ddk");
        Move move = bot.selectMove(state);
        assertFalse(move.isResign()); // Bot should never resign on its own
    }

    @Test
    void testBotOnEmptyBoard() {
        GameState state = GameState.newGame(19);
        GPT2Bot bot = new GPT2Bot("ddk");
        Move move = bot.selectMove(state);
        assertNotNull(move);
        assertTrue(move.isPlay() || move.isPass());
    }

    @Test
    void testBotMoveLegalityInHistory() {
        GameState state = GameState.newGame(9);
        state = state.applyMove(Move.play(new Point(3, 3)));
        state = state.applyMove(Move.play(new Point(4, 3)));
        state = state.applyMove(Move.play(new Point(3, 4)));
        state = state.applyMove(Move.play(new Point(4, 4)));

        GPT2Bot bot = new GPT2Bot("ddk");
        Move aiMove = bot.selectMove(state);
        assertTrue(state.isValidMove(aiMove));
    }

    @Test
    void testAIGameFlowWithCapturesAndPasses() {
        GameState game = GameState.newGame(19);
        game = game.applyMove(Move.play(new Point(2, 2))); // B[cc]

        GPT2Bot bot = new GPT2Bot("ddk");
        Move aiMove = bot.selectMove(game);

        assertNotNull(aiMove);
        assertTrue(aiMove.isPlay() || aiMove.isPass());
        assertTrue(game.isValidMove(aiMove));

        System.out.println("GPT-2 Bot move: " + aiMove);
    }
}