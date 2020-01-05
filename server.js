const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const exphbs = require("express-handlebars");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine', 'handlebars');
app.engine(
	'handlebars', exphbs({
		defaultLayout: 'main'
	})
);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsscrapper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get('/', (req, res) => {
  res.render('index');
});

app.get("/scrape", function(req, res) {
  axios.get("https://www.theverge.com/tech").then(function(response) {
    const $ = cheerio.load(response.data);

    $("div.c-entry-box--compact--article").each(function(i, element) {
      let result = {};
      result.title = $(element).children("div").children("h2").children("a").text();
      result.link = $(element).children("div").children("h2").children("a").attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
  res.send();
  });
});


app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("articles/save", (req, res) => {
  db.Article.find({
    isSaved: true
  }).then((dbArticle) => {
    res.json(dbArticle);
  }).catch((err) => {
    res.json(err);
  })
})


app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
app.post("/articles/save/:id", (req, res) => {
  db.Article.findOneAndUpdate({_id: req.params.id }, {isSaved: req.body.saved})
  .then((dbArticle) => {
    res.json(dbArticle);
  })
  .catch((err) => {
    res.json(err);
  })
})

app.post("/articles/:id", function(req, res) {
  
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { returnNewDocument: true });
    })
    .then(function(dbArticle) {  
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
