//Dependencies 
var express = require('express')
let ejs = require('ejs');
var app = express();
const mongoose = require('mongoose');
const pmysql = require('promise-mysql');

//Set view engine
app.set('view engine', 'ejs')

//Default mongoose connection url 
mongoose.connect('mongodb://localhost:27017/proj2024MongoDB', {
});

//Define mongoose schema
const lecturerSchema = new mongoose.Schema({
    _id: String,
    name: String,
    did: String
});
const Lecturer = mongoose.model('Lecturer', lecturerSchema);

//Variable saved in .then
let pool;
//Promise-mysql connection pool
pmysql.createPool({
    connectionLimit : 3,
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'proj2024Mysql'
    })
    .then(p => {
    pool = p
    })
    .catch(e => {
    console.log("pool error:" + e)
   })

//Listening on port 3004
app.listen(3004, () => {
console.log("Server is listening")
})

//Debugging
console.log("HERE")

//Default root to home page
app.get("/", (req, res)=>{
    res.render("home")
})

//Route to students page
app.get('/students', async (req, res) => {
    try {
      //Query MySQL, sort by ascending sid
      const [rows] = await pool.query('SELECT * FROM student ORDER BY sid ASC');
      //Pass the students data to students.ejs
      res.render('students', { students: rows });
    } catch (err) {
      console.log(err);
    }
  });

//Route to grades page
app.get("/grades", (req, res) => {
    res.send("<h1>Grades</h1>");
});

//Route to lecturers page (MongoDB)
app.get("/lecturers", async (req, res) => {
    try {
        //Variable that holds all lecturers in proj2024MongoDB database
        const lecturers = await Lecturer.find(); 
        res.render("lecturers", { lecturers });
    } 
    catch (error) {
        console.error("Error finding lecturers:", error);
    }
});
