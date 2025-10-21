import express from "express";
import { v4 as uuidv4 } from "uuid";
import auth from "../middleware/auth.js";
import { docClient } from "../db.js";
import { PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();
const FLASHCARDS_TABLE = "Flashcards";

// --- Get all flashcards for a user (Protected) ---
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;
  const params = {
    TableName: FLASHCARDS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  };
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    res.json(Items);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// --- Create a new flashcard (Protected) ---
router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const { question, answer } = req.body;
  const cardId = uuidv4();
  if (!question || !answer) {
    return res.status(400).json({ message: "Question and answer are required." });
  }
  const newCard = {
    userId, cardId, question, answer, createdAt: new Date().toISOString(),
  };
  const params = { TableName: FLASHCARDS_TABLE, Item: newCard };
  try {
    await docClient.send(new PutCommand(params));
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// --- Delete a flashcard (Protected) ---
router.delete("/:cardId", auth, async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.params;
  const params = {
    TableName: FLASHCARDS_TABLE,
    Key: { userId, cardId },
  };
  try {
    await docClient.send(new DeleteCommand(params));
    res.json({ message: "Card deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;