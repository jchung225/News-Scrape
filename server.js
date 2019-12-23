var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection established!");
});

// A GET request to scrape the selected website
app.get("/scrape", function(req, res) {
  request("http://www.echojs.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article h2").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  res.send("Scrape Completed!");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("");
  console.log("All The News Scrapper App Now Running on Port 3000!");
  console.log("---------------------------------------------------------------");
});