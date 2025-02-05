// Initializing Express
const express = require("express");
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool");
app.set("view engine", "ejs");
app.use(express.static("public"));
//const bodyParser=require("body-parser");
//app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

// Global variables
var id = 0;
var message = "";
var updateFlag = false;

// routes
// Display main screen
app.get('/', (req, res) => {
  message = "";
  res.render('index');
});

// Display form for input author information
app.get("/author/new", (req, res) => {
  message = "";
  /*
  if (updateFlag == true){
    message = "Author added!";
    updateFlag = false;
  }
  */
  res.render("newAuthor", {"message": message});
});

// Add a new author to the database
app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let sex = req.body.sex;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate;
  let country = req.body.country;
  let portrait = req.body.portrait;
  let profession = req.body.profession;
  let biography = req.body.biography;
  let sql = "INSERT INTO q_authors (firstName, lastName, sex, dob, dod, country, portrait, profession, biography) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, sex, birthDate, deathDate, country, portrait, profession, biography];
  let rows = await executeSQL(sql, params);
  //updateFlag = true;
  res.render("newAuthor", {"message": "Author added!"});
});

// Display the list of authors with edit and delete options
app.get("/authors", async function(req, res){
  let sql = `SELECT *
            FROM q_authors
            ORDER BY firstName, lastName`;
  let rows = await executeSQL(sql);
  res.render("authorList", {"authors":rows});
});

// Display data of the selected author to edit
app.get("/author/edit", async function(req, res){
  console.log(req.query);
  message = "";
  let authorId = req.query.authorId;
  if (!authorId) {
    authorId = id;
    message = "Author Updated!";
  }
  console.log("authorId: " + authorId); 
  let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
            DATE_FORMAT(dod, '%Y-%m-%d') dodISO
            FROM q_authors
            WHERE authorId =  ${authorId}`;
  let rows = await executeSQL(sql);
  res.render("editAuthor", {"authorInfo":rows, "message":message});
});

// Update the modified record for the selected author in the database
app.post("/author/edit", async function(req, res){
  let authorId = req.body.authorId;
  id = authorId;
  let sql = `UPDATE q_authors
            SET firstName = ?,
               lastName = ?,
               dob = ?,
               dod = ?,
               sex = ?,
               country = ?,
               portrait = ?,
               profession = ?,
               biography = ?
            WHERE authorId =  ?`;
  let params = [req.body.fName, req.body.lName, 
                req.body.dob, req.body.dod,
                req.body.sex, req.body.country, 
                req.body.portrait,
                req.body.profession,
                req.body.biography, authorId];         
  let rows = await executeSQL(sql,params);
  console.log("updated!");
  sql = `SELECT *, 
          DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
          DATE_FORMAT(dod, '%Y-%m-%d') dodISO
          FROM q_authors
          WHERE authorId = ${authorId}`;
  rows = await executeSQL(sql);
  console.log("Get updated info!");
  res.render("editAuthor", {"authorInfo":rows, "message":"Author Updated!"});
});

// Delete the selected author from the database
app.get("/author/delete", async function(req, res){
  let authorId = req.query.authorId;
  let sql = `DELETE
             FROM q_authors
             WHERE authorId =  ${req.query.authorId}`;
  let rows = await executeSQL(sql);
  res.redirect("/authors");
});

// Display form for input quote information
app.get("/quote/new", async function(req, res){
  message = "";
  /*
  if (updateFlag) {
    message = "Quote added!";
    updateFlag = false;
  }
  */
  let sql = `SELECT authorId, firstName, lastName 
            FROM q_authors`;
  let authors = await executeSQL(sql);
  sql = `SELECT DISTINCT category 
            FROM q_quotes`;
  let categories = await executeSQL(sql);
  res.render("newQuote", {"authors":authors, "categories": categories, "message":message});
});

// Add a new quote to the database
app.post("/quote/new", async function(req, res){
  let authorId = req.body.author;
  let quote = req.body.quote;
  let category = "";
  let categoryInput = req.body.categoryInput;
  if (categoryInput.length > 0) {
    category  = categoryInput;
  }
  else {
    category = req.body.category;
  }
  let likes = req.body.likes;
  let sql = `INSERT INTO q_quotes (quote, category, authorId, likes) VALUES (?, ?, ?, ?);`;
  let params = [quote, category, authorId, likes];
  let rows = await executeSQL(sql, params);
  //updateFlag = true;
  res.render("newQuote", {"message": "Quote added!"});
});

// Display the list of quotes with edit and delete options
app.get("/quotes", async function(req, res){
  let sql = `SELECT quote, category, quoteId, likes, firstName, lastName 
            FROM q_quotes q
            NATURAL JOIN q_authors a
            WHERE q.authorId = a.authorId
            ORDER BY firstName, lastName;`;
  let rows = await executeSQL(sql);
  res.render("quoteList", {"quotes":rows});
});

// Display data of the selected quote to edit
app.get("/quote/edit", async function(req, res){
  console.log(req.query);
  console.log("quoteId: " + req.query.quoteId);
  message = "";
  let quoteId = req.query.quoteId;
  if (!quoteId) {
    quoteId = id;
    message = "Quote Updated!";
  }
  let sql = `SELECT *
            FROM q_quotes
            WHERE quoteId =  ${quoteId}`;
  let quotes = await executeSQL(sql);
  sql = `SELECT * FROM q_authors`;
  let authors = await executeSQL(sql);
  sql = `SELECT DISTINCT category
    FROM q_quotes`;
  let categories = await executeSQL(sql);
  res.render("editQuote", {"quoteInfo":quotes, "categories":categories, "authors":authors, "message":message});
});

// Update the modified record for the selected quote in the database
app.post("/quote/edit", async function(req, res){
  let quoteId = req.body.quoteId;
  id = quoteId;
  let sql = `UPDATE q_quotes
            SET authorId= ?, quote = ?, category= ?, likes = ?
            WHERE quoteId =  ?`;
  let params = [req.body.author, req.body.quote, req.body.category, req.body.likes, quoteId];         
  let rows = await executeSQL(sql,params);
  console.log("updated!");
  sql = `SELECT *
          FROM q_quotes
          WHERE quoteId = ${quoteId}`;
  rows = await executeSQL(sql);
  console.log("Get updated info!");
  res.render("editQuote", {"quoteInfo":rows, "message":"Quote Updated!"});
});

// Delete the selected quote from the database
app.get("/quote/delete", async function(req, res){
  let quoteId = req.query.quoteId;
  let sql = `DELETE
             FROM q_quotes
             WHERE quoteId = ${quoteId}`;
  let rows = await executeSQL(sql);
  res.redirect("/quotes");
});

// Test database
app.get("/dbTest", async function(req, res){
  let sql = "SELECT CURDATE()";
  let rows = await executeSQL(sql);
  res.send(rows);
});// dbTest

// Functions
async function executeSQL(sql, params){
  return new Promise (function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
        resolve(rows);
    });
  });
}// executeSQL

// start server
app.listen(3000, () => {
  console.log("Expresss server running...")
});

