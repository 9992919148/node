const isAuthenticated = (req, res, next) => {
    // Check if the user is logged in by checking the session
    if (!req.session.userId) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }
    next();  // Continue to the protected route if logged in
};
module.exports=isAuthenticated;