var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var logger = require("morgan");
var mongojs = require("mongojs");
var request = require("request");
var methodOverride = require("method-override");

// var Promise = require("bluebird");
// var mongoose = require("mongoose");
// var axios = require("axios");
// mongoose.Promise = Promise;
// var routes = require("./routes");
// var models = require("./models"); 

var PORT = process.env.PORT || 3000;

var app = express();

var databaseUrl = "articles";
var collections = ["cheeriMonDB"];
var db = mongojs(databaseUrl, collections);

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(methodOverride("_method"));

// Need to figure out why I can;t get mongoose to work
// mongoose.connect("mongodb://localhost/cheeriMonDB");
// var db = mongoose.connection;
// db.once("open", function() {
//     console.log("Mongoose connection successful");
// });
db.on("error", function (error) {
    console.log("Database Error: ", error);
});

app.use(express.static("public"));
app.listen(PORT, function () {
    console.log("App running port " + PORT);
});

app.get("/", function (req, res) {
    res.render("main");
});


app.get("/scrape", function (req, res) {
    // console.log("test");
    request("https://www.nytimes.com/section/technology", function (err, response, html) {
        var $ = cheerio.load(html);
        var results = [];
        $("h2.headline").each(function (i, element) {
            var title = $(element).text().trim();
            var summary = $(element).siblings("p.summary").text().trim();
            var author = $(element).siblings("p.byline").text().trim();
            var link = $(element).parent().parent().attr("href");
            // var imgLink = $(element).find("a").find("img").attr("src");

            db.cheeriMonDB.insert({
                    title: title,
                    summary: summary,
                    author: author,
                    link: link,
                    // imgLink: imgLink
                },
                function (error, inserted) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(inserted);
                    }
                });
        });
    });
    res.send("Scrape complete");
});

app.get("/all", function (req, res) {
    db.cheeriMonDB.find({}, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            res.json(found);
        }
    });
});