/**
 * Middleware to authorize access based on user roles
 * Should be used AFTER the 'auth' middleware has attached the user to req.user
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Insufficient permissions. Access restricted to roles: [${roles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = { authorizeRole };
