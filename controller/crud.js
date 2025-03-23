const dbcon=require('../db');

const index=(req,res)=>{
    res.render('dashboard', { errorMessage: null });
}
const login=(req,res)=>{
    res.render('login', { errorMessage: null });
}
const showRegister=(req,res)=>{
    res.render('register', { errorMessage: null, successMessage: null });
}
const registerUser = async (req, res) => {
    console.log(req.body);  // Log the body of the request to debug

    const { username, email, password } = req.body;

    // Step 1: Validate inputs
    if (!username || !email || !password) {
        return res.render('register', { errorMessage: 'All fields are required.' });
    }

    try {
        // Get the database connection
        const db = await connectToDatabase();  // Await for the connection

        // Step 2: Check if the email is already in use
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.render('register', { errorMessage: 'Email is already registered.', successMessage: null });
        }

        // Step 3: Hash the password (e.g., using bcrypt)
        // const hashedPassword = await bcrypt.hash(password, 10);  // Uncomment if you use bcrypt

        // Step 4: Insert the new user into the database
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);

        // Step 5: Redirect to login page with a success message
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.render('register', { errorMessage: err, successMessage: null });
    }
};
module.exports={ index,login,showRegister,registerUser };