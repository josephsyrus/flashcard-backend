// backend/routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { docClient } from "../db.js"; // Make sure this import is present
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();
const USERS_TABLE = "Users";

// --- Register a new user ---
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[Register] Attempting registration for: ${email}`); 
  if (!email || !password) {
    console.error("[Register] Missing email or password"); 
    return res.status(400).json({ message: "Email and password are required." });
  }

  try { 
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[Register] Password hashed successfully."); 

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
    };

    const params = {
      TableName: USERS_TABLE, // Ensure this matches exactly
      Item: newUser,
      ConditionExpression: "attribute_not_exists(email)", 
    };

    console.log("[Register] Preparing to send PutCommand with params:", JSON.stringify(params, null, 2)); 
    
    // Use the imported docClient
    await docClient.send(new PutCommand(params)); 
    
    console.log("[Register] PutCommand executed successfully."); 
    
    res.status(201).json({ message: "User registered successfully." });

  } catch (error) {
    console.error("[Register] >>> CAUGHT ERROR <<<:", error); 
    if (error.name === "ConditionalCheckFailedException") {
      return res.status(409).json({ message: "User with this email already exists." });
    }
    // In production, avoid sending detailed errors back to the client
    res.status(500).json({ message: "Internal server error" }); 
  }
});

// --- Login a user ---
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
    
      const params = {
        TableName: USERS_TABLE,
        Key: {
          email: email.toLowerCase(),
        },
      };
    
      try {
        // Use the imported docClient
        const { Item: user } = await docClient.send(new GetCommand(params)); 
    
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials." });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials." });
        }
    
        // Create JWT Token
        const payload = {
          id: user.email, 
        };
        
        // Use process.env for the secret
        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
          expiresIn: "1d", // Token expires in 1 day
        });
    
        res.json({
          token,
          user: {
            email: user.email,
          },
        });
      } catch (error) {
        console.error("[Login] Error during login:", error); 
        res.status(500).json({ message: "Internal server error" });
      }
});

export default router;