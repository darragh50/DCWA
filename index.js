//Dependencies 
var express = require('express')
let ejs = require('ejs');
var app = express();

//Set view engine
app.set('view engine', 'ejs')

/*var employees = [{ id: "X103", name: "John Smith", salary: 45000 },
    { id: "XT92", name: "Mary Murphy", salary: 41750 },
    { id: "B10C", name: "Alan Collins", salary: 40000 },
    { id: "YY12", name: "Brian Brogan", salary: 43250 } ]*/

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
app.get("/students", (req, res) => {
    res.send("<h1>Students</h1>");
});

//Route to grades page
app.get("/grades", (req, res) => {
    res.send("<h1>Grades</h1>");
});
