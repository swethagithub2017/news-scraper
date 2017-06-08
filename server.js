var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var expresshandlebars = require("express-handlebars");

// Requiring models
var Notes = require("./models/Notes.js");
var myStory = require("./models/myStory.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var app = express();
var port = process.env.PORT || 8080;

app.use(express.static(process.cwd() + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
var databaseUri = "mongodb://localhost/mongonews";
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
    }else{
    mongoose.connect(databaseUri);
  }

// mongoose.connect("mongodb://localhost/mongonews");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, logs a success message
db.once("open", function() {
  console.log("Mongoose connection is successful.");
});

//Routes
app.get("/", function(req, res) {

      var query = myStory.find({}).sort({$natural: -1}).limit(10);
      query.exec(function(err, docs){
          if(err){
            throw error;
          }
          res.render("index",{mystory: docs});
      });
    });

//Scraping Articles from NY Times
app.get("/scrape", function(req, res) {
    request('https://www.nytimes.com/pages/dining/index.html', function(error, response, html) {
    var $ = cheerio.load(html);

    $("article.story").each(function(i, element) {
          var result = {};

          result.title = $(this).find("div.mystory-body").find("h2.headline").find("a").text();
          result.link =  $(this).find("a").attr("href");
          result.image = $(this).find("a").find("img").attr("src");
          console.log(result);

          var entry = new Story(result);
          entry.save(function(err, doc) {   
            if (err) {
              console.log(err);
            }
            else {
              console.log(doc);
            }
      });// closing entry.save
    });//closing article.story
  });// closing request
  res.redirect("/");
});// closing app.get

//Get Articles from DB
app.get("/stories", function(req, res) {
// Grab every doc in the Articles array
  myStory.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/stories/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  myStory.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


app.get("/saved", function(req,res){
    myStory.find({saved:true}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("saved",{mystory: doc});
    }
  });
});

// Change from false to true
app.post("/updates/:id", function(req,res){
  myStory.where({ _id: req.params.id }).update({ $set:{saved: true }})
    .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc)
    }
  });
});

// Change from true to false
app.post("/updates/:id/:saved", function(req,res){

  myStory.where({_id: req.params.id, saved:true }).update({ $set:{saved: false }})
    .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
    res.json(doc)
    }
  });
});

// Post notes
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  console.log(newNote);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      myStory.findOneAndUpdate({ "_id": req.params.id },{ "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
        // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

// Grab an article by it's ObjectId
app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  myStory.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.listen(port, function() {
  console.log("App running on port " + port);
});
