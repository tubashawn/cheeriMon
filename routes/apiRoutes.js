var cheerio = require("cheerio");
var request = require("request");
var db = require("../models");
var axios = require("axios");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var app = express();

