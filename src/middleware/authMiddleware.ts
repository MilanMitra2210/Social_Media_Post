import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Protected Routes, Token Based
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(' ')[1];
  //   console.log(req.headers.authorization);


  if (token == null) {
    // console.log(currentToken);
    return res.status(403).json({ message: 'You are Unauthorized - please provide token' });
  }
  const jwt_secret = process.env.JWT_SECRET || "";

  // Verify the token in the header
  jwt.verify(token, jwt_secret, (err, user) => {

    
    if (err) {
      return res.status(403).json({ message: 'Access Forbidden' });
    }
    if (typeof user === 'object' && user !== null) {

      // console.log(user.id);
      req.body.id = user.id;
      next();
    } else {
      next();
    }
  });
}

export { authenticateToken };
