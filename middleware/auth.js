import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add the user's ID (which is their email) to the request object
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
};

export default auth;