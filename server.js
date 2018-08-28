var express = require("express");
var bodyParser = require("body-parser");
var handlbars = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var logger = require("morgan");
// var axios = require("axios");
var mongojs = require("mongojs");
var request = require("request");
var routes = require("./routes");

var PORT = process.env.PORT || 3000;

// var db = require("./models");
var app = express();

var databaseUrl = "articles";
var collections = ["cheeriMonDB"];
var db = mongojs(databaseUrl, collections);

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/cheeriMonDB");
db.on("error", function (error) {
    console.log("Database Error: ", error);
});


app.listen(PORT, function () {
    console.log("App running port " + PORT);
});

app.get("/", function (req, res) {
    res.send("test");
});


// app.get("/scrape", function(req, res) {

// });

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