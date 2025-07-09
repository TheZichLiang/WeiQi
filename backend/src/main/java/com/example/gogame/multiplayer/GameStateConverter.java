package com.example.gogame.multiplayer;

import com.example.gogame.logic.GameState;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class GameStateConverter implements AttributeConverter<GameState, String> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(GameState gameState) {
        try {
            return mapper.writeValueAsString(gameState);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error serializing GameState", e);
        }
    }

    @Override
    public GameState convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, GameState.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error deserializing GameState", e);
        }
    }
}
