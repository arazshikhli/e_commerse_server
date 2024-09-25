const jwt = require('jsonwebtoken');
const User = require('../models/Users.js');

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};
module.exports = adminMiddleware;