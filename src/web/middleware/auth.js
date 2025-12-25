const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../../utils/logger');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, config.security.jwtSecret, (err, user) => {
        if (err) {
            logger.warn('Invalid token attempt:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
}

function generateToken(userId) {
    return jwt.sign(
        { userId: userId },
        config.security.jwtSecret,
        { expiresIn: config.security.jwtExpiration }
    );
}

module.exports = {
    authenticateToken,
    generateToken
};
