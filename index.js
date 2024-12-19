//Dependencies 
var express = require('express')
let ejs = require('ejs');
var app = express();
const mongoose = require('mongoose');
const pmysql = require('promise-mysql');
//To parse data from forms
app.use(express.urlencoded({ extended: true }));

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
    //Query mysql and sort ascending sid
    const rows = await pool.query('SELECT * FROM student ORDER BY sid ASC');
  
    //Send data to students.ejs
    res.render('students', { students: rows });
  });

//Route to grades page
app.get("/grades", (req, res) => {
    res.send("<h1>Grades</h1>");
});

//Route to lecturers page (MongoDB)
app.get("/lecturers", async (req, res) => {
    //Query the MonogDB data and sort by ascending id
    const lecturers = await Lecturer.find({}).sort({ _id: 1, lid: 1 });

    res.render("lecturers", { lecturers });
});

//Route to delete lecturer (MongoDB)
app.get('/lecturers/delete/:lid', async (req, res) => {
    const lid = req.params.lid;
    //Find lecturer 
    const lecturer = await Lecturer.findById(lid);

    //If statement to determine if you can delete
    if (lecturer.did) {
      return res.render('deleteLecturer', { lid });
    }

    //Delete lecturer if they have no modules
    await Lecturer.deleteOne({ _id: lid });
    //Redirect
    res.redirect('/lecturers');  
});

//Route to addStudent page - GET request is sent to /students/add
app.get('/students/add', (req, res) => {
    res.render('addStudent', { errorMessages: [], formData: {} });
  });
  
//Route to handle form submission
app.post('/students/add', async (req, res) => {
    const { sid, name, age } = req.body;
    const errorMessages = [];
    const formData = { sid, name, age };
    
    //If loops to check entered data
    if (!sid || sid.length !== 4) {
      errorMessages.push("Student ID should be 4 characters");
    }
    if (!name || name.length < 2) {
      errorMessages.push("Student Name should be at least 2 chaarcters");
    }
    if (!age || isNaN(age) || parseInt(age) < 18) {
      errorMessages.push("Age should be 18 or older");
    }
  
    if (errorMessages.length > 0) {
      //Re-render the form 
      return res.render('addStudent', { errorMessages, formData });
    }
  
    //Making sure student ID is unique
    const existing = await pool.query('SELECT * FROM student WHERE sid = ?', [sid]);

    if (existing.length > 0) {
      errorMessages.push("Student ID already in use. Must be unique.");
      return res.render('addStudent', { errorMessages, formData });
    }
  
    //Insert student into the mysql database
    await pool.query('INSERT INTO student (sid, name, age) VALUES (?, ?, ?)', [sid, name, age]);
  
    //Redirect back to students
    res.redirect('/students');
});

//Route to editStudent page - GET request is sent to /students/edit/:sid
app.get('/students/edit/:sid', async (req, res) => {
    const sid = req.params.sid;
    //Query mysqql
    const student = await pool.query('SELECT * FROM student WHERE sid = ?', [sid]);

    if (student.length > 0) {
      res.render('editStudent', { 
        student: student[0], 
        errorMessages: [], 
      });
    } else {
      console.log('Error:', err);
    }
});

//post method to handles information from button click
app.post('/students/edit/:sid', async (req, res) => {
    const sid = req.params.sid;
    const { name, age } = req.body;
    const errorMessages = [];

    //If statements to make sure details entered match criteria - send error message if they do not
    if (!name || name.length < 2) {
      errorMessages.push('Student Name should be at least 2 characters');
    }
    if (!age || isNaN(age) || age < 18) {
     errorMessages.push('Student Age should be at least 18');
    }

    if (errorMessages.length > 0) {
     //Return the user with the appropriate error messages, and previous data entered.
      return res.render('editStudent', { 
        student: { sid, name, age }, 
       errorMessages 
      });
    }

    //Update student in mysql database
    await pool.query(
      'UPDATE student SET name = ?, age = ? WHERE sid = ?',[name, age, sid]
    );

    //Redirect back to students
    res.redirect('/students');
});
