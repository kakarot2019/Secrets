//jshint esversion:6
//.dotenv must be added on top and it need no variable to store
//creating a .env file now that will contain the variables that we wanted to encrypt by obeying its naming convention
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");

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

//storing secreat message and attaching it to password of the schema 
//so that password is stored as some encrypted string in the database 
//const secret="Encryption will took place with the help of this random text";
//calling SECRET from .env file
//.env file should not be committed on git for which we use gitignore on which copypaste template from github for nodejs
userschema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:["password"]});

const User=mongoose.model("User",userschema);

app.get("/", function(req, res){
  res.render("home");
});
app.get("/login", function(req, res){
  res.render("login");
});
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({name : username}, function(err,founduser){
    if(err)
      console.log(err);
    else{
      if(founduser){
        if(password === founduser.password){
          res.render("secrets");
        }
        else
          console.log("Incorrect password");
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
    password:req.body.password
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
