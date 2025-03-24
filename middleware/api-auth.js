const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; // Use a secure secret key, ideally from environment variables

function authenticateJWT(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({status: false, msg: 'Access denied no token provided'});
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({status: false, msg: 'Access denied token not found'});
        
    }

    try {
        // const decoded = jwt.verify(token, SECRET_KEY);
        const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
        req.user = decoded; // Attach the user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.log(err);
        return res.status(401).json({status: false, msg: 'Access Denied'});
    }
}

module.exports = authenticateJWT;
