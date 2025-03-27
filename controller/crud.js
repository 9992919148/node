const dbcon=require('../db');
const multer = require('multer');
const path = require('path');
const Parser = require('json2csv');
const fs = require('fs');



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
    const sname=req.query.sname || '';
    try{
        let qry='select * from users';
        if(sname!='') {
            qry+=' where name like ?';
        }
        const [rows]=await dbcon.promise().query(qry, [`%${sname}%`]);
        res.render('all-users', { data: rows});
    }catch(err){
        console.log('error-'+err);
    }
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
    row[0].role = row[0].role ? row[0].role.split(',') : [];
    console.log(row[0]);
    res.render('edit-user', { data: row[0]});
}
const updateUser=async(req, res) =>{
    console.log(req.body);
    upload(req, res, async (err) => {
        if (err) {
          return res.status(400).send({ message: err.message });
        }
    const { name, email, password, id, gender, role } = req.body;
    if (!name || !email || !password) {
        return res.render('edit-user', { errorMessage: 'All fields are required.' });
    }
    try{
        const imagePath = req.file ? path.basename(req.file.path) : req.body.old_img;
        const rolStr = role.join(", ");
        const [rows] = await dbcon.promise().query('SELECT * FROM users WHERE email = ? and id != ?', [email,id]);
        if (rows.length > 0) {
            return res.render('edit-user', { errorMessage: 'Email is already registered.', successMessage: null });
        }
        await dbcon.promise().query('update users set name = ?, email = ?, password = ?, img = ?, gender = ?, role = ? where id = ?', [name, email, password, imagePath, gender, rolStr, id]);
        res.redirect('/all-users');
    }catch(err){}
});
}
const deleteUser=async(req,res) => {
    const id=req.params.id;
    const [rows] = await dbcon.promise().query('delete from users where id=?',[id]);
    res.redirect('/all-users');
}
const getCase=async(req,res) => {
    const id=req.session.userId;
    const [rows] = await dbcon.promise().query("select 14_qry.qry_id, DATE_FORMAT(14_qry.created_at, '%d-%m-%Y') AS created_at,users.name,14_cat.cat_desc from 14_qry inner join users on 14_qry.user_id=users.id inner join 14_cat on 14_cat.cat_id=14_qry.cat_id where user_id=?",[id]);
    console.log(rows);
    res.render('cases', { data: rows});
}
module.exports={ index,
    loginUser,
    showLogin,
    showRegister,
    registerUser,
    logout,
    allUser,
    addUserForm,
    saveUser,
    editUserForm,
    updateUser,
    deleteUser,
    getCase 
};