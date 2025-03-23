const express = require('express');
const route = require('./route/route');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;



// Sample route
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', route);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
