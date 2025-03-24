const dbcon=require('../db');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save the uploaded files in the 'uploads' folder
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Add a timestamp to the file name to avoid overwriting
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5 MB
}).single('img'); // 'img' is the name of the file input field


const index=async(req,res)=>{
    const [rows] = await dbcon.promise().query('SELECT * FROM users');
    const data={
        username: req.session.username,
        totalUsers: rows.length,
        activeSessions: rows.length, 
        pendingNotifications: rows.length
    }
    res.render('dashboard', { errorMessage: null, data: data });
}
const showLogin=(req,res)=>{
    res.render('login', { errorMessage: null });
}
const logout=(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error destroying session');
        }
        // Redirect the user to the login page after logging out
        res.redirect('/login');
    });
}
const loginUser=async (req,res)=>{
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('login', { errorMessage: 'All fields are required.' });
    }
    try{
        const [rows] = await dbcon.promise().query('SELECT * FROM users WHERE email = ? and password = ?', [email,password]);
        if (rows.length > 0) {
            //console.log(rows);
            const user = rows[0];
            console.log(user);
            req.session.userId = user.id;
            req.session.username = user.name;
            return res.redirect('/');
        }
        else
        {
            res.render('login', { errorMessage: 'Invalid username or password'});
        }
    }
    catch(err)
    {
        console.error('Error registering user:', err);
        res.render('login', { errorMessage: err});
    }
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
        //await dbcon.promise().
        //const db = await connectToDatabase();  // Await for the connection

        // Step 2: Check if the email is already in use
        // const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const [rows] = await dbcon.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.render('register', { errorMessage: 'Email is already registered.', successMessage: null });
        }

        // Step 3: Hash the password (e.g., using bcrypt)
        // const hashedPassword = await bcrypt.hash(password, 10);  // Uncomment if you use bcrypt

        // Step 4: Insert the new user into the database
        await await dbcon.promise().query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, password]);

        // Step 5: Redirect to login page with a success message
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.render('register', { errorMessage: err, successMessage: null });
    }
};
const allUser=async(req, res) =>{
    try{
        const [rows]=await dbcon.promise().query('select * from users');
        res.render('all-users', { data: rows});

    }catch(err){}
}
const addUserForm=async(req, res) =>{
    res.render('add-user', { errorMessage: null, successMessage: null});
}
const saveUser=async(req, res) =>{
    console.log(req.body);
    upload(req, res, async (err) => {
        if (err) {
          return res.status(400).send({ message: err.message });
        }
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.render('add-user', { errorMessage: 'All fields are required.' });
    }
    try{
        const imagePath = req.file ? path.basename(req.file.path) : null;
        const [rows] = await dbcon.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.render('add-user', { errorMessage: 'Email is already registered.', successMessage: null });
        }
        await dbcon.promise().query('INSERT INTO users (name, email, password, img) VALUES (?, ?, ?, ?)', [name, email, password, imagePath]);
        res.redirect('/all-users');
    }catch(err){}
});
}
const editUserForm=async(req, res) =>{
    const id=req.params.id;
    
    const [row]=await dbcon.promise().query('select * from users where id= ?', [id]);
    res.render('edit-user', { data: row[0]});
}
const updateUser=async(req, res) =>{
    console.log(req.body);
    upload(req, res, async (err) => {
        if (err) {
          return res.status(400).send({ message: err.message });
        }
    const { name, email, password, id } = req.body;
    if (!name || !email || !password) {
        return res.render('edit-user', { errorMessage: 'All fields are required.' });
    }
    try{
        const imagePath = req.file ? path.basename(req.file.path) : null;
        const [rows] = await dbcon.promise().query('SELECT * FROM users WHERE email = ? and id != ?', [email,id]);
        if (rows.length > 0) {
            return res.render('edit-user', { errorMessage: 'Email is already registered.', successMessage: null });
        }
        await dbcon.promise().query('update users set name = ?, email = ?, password = ?, img = ? where id = ?', [name, email, password, imagePath, id]);
        res.redirect('/all-users');
    }catch(err){}
});
}
module.exports={ index,loginUser,showLogin,showRegister,registerUser,logout,allUser,addUserForm,saveUser,editUserForm,updateUser };