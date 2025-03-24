const express = require('express');
const route = require('./route/route');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;



// Sample route
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key', // Change this to a secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 ,  // Set session timeout to 10 minutes (in milliseconds)
    httpOnly: true,           // Helps prevent client-side access to the cookie
    secure: false             // Set to true if you're using HTTPS
}
}));
app.use('/uploads', express.static('uploads'));
app.use('/', route);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
