import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export default async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_1234567890');
    
    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists, authorization denied.',
      });
    }

    // Attach user context to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.',
    });
  }
}
