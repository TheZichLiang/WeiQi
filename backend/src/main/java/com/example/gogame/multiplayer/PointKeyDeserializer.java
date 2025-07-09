package com.example.gogame.multiplayer;

import com.example.gogame.logic.Point;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.KeyDeserializer;

import java.io.IOException;

public class PointKeyDeserializer extends KeyDeserializer {
    @Override
    public Point deserializeKey(String key, DeserializationContext ctxt) throws IOException {
        try {
            // key looks like: "Point{col=2, row=3}"
            key = key.replace("Point{col=", "").replace(" row=", "").replace("}", "");
            String[] parts = key.split(",");
            int col = Integer.parseInt(parts[0].trim());
            int row = Integer.parseInt(parts[1].trim());
            return new Point(col, row);
        } catch (Exception e) {
            throw new IOException("Failed to deserialize Point key: " + key, e);
        }
    }
}
