package com.example.gogame.multiplayer;


import java.util.ArrayList;
import java.util.List;

public class SessionManager {
    private static final List<MultiplayerSession> sessions = new ArrayList<>();

    public static synchronized MultiplayerSession getOrCreateSession(String playerId, int boardSize) {
        // Try to find a waiting session
        for (MultiplayerSession session : sessions) {
            if (session.getPlayer2Id() == null && !session.getPlayer1Id().equals(playerId)) {
                session.setPlayer2Id(playerId);
                return session;
            }
        }

        // Create a new session
        MultiplayerSession newSession = new MultiplayerSession(boardSize);
        newSession.setPlayer1Id(playerId);
        sessions.add(newSession);
        return newSession;
    }

    public static MultiplayerSession getSession(String playerId) {
        for (MultiplayerSession session : sessions) {
            if (playerId.equals(session.getPlayer1Id()) || playerId.equals(session.getPlayer2Id())) {
                return session;
            }
        }
        return null;
    }
}
