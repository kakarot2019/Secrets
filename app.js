//jshint esversion:6
//.dotenv must be added on top and it need no variable to store
//creating a .env file now that will contain the variables that we wanted to encrypt by obeying its naming convention
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require("mongoose");
const md5=require("md5"); // a hashing function

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1:27017/SecretDB', {useNewUrlParser: true,  useUnifiedTopology: true});
var connection = mongoose.connection;

const userschema=new mongoose.Schema({
  email:String,
  password: String
});


const User=mongoose.model("User",userschema);

app.get("/", function(req, res){
  res.render("home");
});
app.get("/login", function(req, res){
  res.render("login");
});
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=md5(req.body.password);//converting it to hash to comapared with the hashed password
  User.findOne({name : username}, function(err,founduser){
    if(err)
      console.log(err);
    else{
      if(founduser){
        if(password === founduser.password){
          res.render("secrets");
        }
        else
          console.log("ur pass:" + password +" db pass:"+founduser.email);
      }
    }
  })
})
app.get("/register", function(req, res){
  res.render("register");
});
app.post("/register", function(req,res){
  const newuser= new User({
    email:req.body.username,
    password:md5(req.body.password) //storing a hashed value
  });
  newuser.save(function(err){
    if(!err)
      res.render("secrets");
    else
      console.log(err);
  })
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
