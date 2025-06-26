package com.example.gogame.inference;

import java.io.*;

public class GPT2Client {
    private final String difficulty;

    public GPT2Client(String difficulty) {
        this.difficulty = difficulty;
    }

    public String predict(String prompt) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "/home/ec2-user/miniconda3/bin/python",
                "/home/ec2-user/inference/GPT2Predict.py",
                difficulty
            );
            Process process = pb.start();

            // Send prompt to Python script via stdin
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                writer.write(prompt + "\n");
                writer.flush();
            }

            // Read only the move output from stdout
            String move = "PASS";
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().isEmpty()) {
                        move = line.trim(); // Expecting output like "B[cc]" or "PASS"
                    }
                }
            }

            // Handle Python error stream if needed
            try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String errLine;
                while ((errLine = errorReader.readLine()) != null) {
                    System.err.println("Python STDERR: " + errLine);
                }
            }

            process.waitFor();
            return move;
        } catch (Exception e) {
            e.printStackTrace();
            return "PASS"; // fallback on error
        }
    }
}