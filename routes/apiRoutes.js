var cheerio = require("cheerio");
var request = require("request");
var db = require("../models");
var axios = require("axios");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var app = express();

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/technology").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];
        $("h2.headline").each(function (i, element) {
            var title = $(element).text().trim();
            var summary = $(element).siblings("p.summary").text().trim();
            var author = $(element).siblings("p.byline").text().trim();
            var link = $(element).parent().parent().attr("href");
            var imgLink = $(element).find("a").find("img").attr("src");
            db.cheeriMonDB.insert({
                title: title,
                summary: summary,
                author: author,
                link: link,
                imgLink: imgLink
            });
            console.log(results);
            res.send("Scrape complete");
            // db.cheeriMonDB.insert(results);
        });
    });
});

// After looping through each element found, log the results to the console
// console.log(results);
var loadedDB = db.cheeriMonDB.find().pretty();
console.log(loadedDB);
