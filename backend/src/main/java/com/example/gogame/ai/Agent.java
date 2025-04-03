package com.example.gogame.ai;

import com.example.gogame.logic.*;

public interface Agent {
    Move selectMove(GameState gameState);
}
