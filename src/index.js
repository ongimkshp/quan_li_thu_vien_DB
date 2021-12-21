const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const port = 3000;

const route = require('./routers');
const db = require('./config/pg_db');

route(app);
db.connect();
// Set views engine
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
        //helpers: require('./helper/hanldebars'),
    }),
    );
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'resources', 'views'));
    
// Public file tĩnh
app.use(express.static(path.join(__dirname, 'public')));
    
// Lấy body qua method POST
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser('conchimxanh874'));

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
