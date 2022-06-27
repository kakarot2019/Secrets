//jshint esversion:6
//.dotenv must be added on top and it need no variable to store
//creating a .env file now that will contain the variables that we wanted to encrypt by obeying its naming convention
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose= require("mongoose");
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//this should be added exactly here i.e, above mongoose declaration and below app.use()
//this line tells the app to use session(that we initialized value) with some intial configuration to begin  
app.use(session({
  secret: 'some random secret',
  resave: false,
  saveUninitialized: true,
}));
//this line tells to initialize passport
app.use(passport.initialize());
//this line tells app to use passport for dealing with the session
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/SecretDB', {useNewUrlParser: true,  useUnifiedTopology: true});
var connection = mongoose.connection;

const userschema=new mongoose.Schema({
  email:String,
  password: String
});
//enabling passportlocalmongoose as a plugin for schema
userschema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userschema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
//creates a strategy which is blindly copied from docs
passport.use(User.createStrategy());
//serialise-- creating cookies and binding info into it
//deserialise-- breaking cookies and extracting all info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function(req, res){
  res.render("home");
});

//////////all gets//////////////////
app.get("/login", function(req, res){
  res.render("login");
});
app.post("/login",function(req,res){
  const user= new User({
    username:req.body.username,
    password:req.body.password
  });

  //we will use a login( by passport to authenticate our credentials)
  req.login(user , function(err){
    if(err)
      console.log(err);
    else{
      //authenticate the password and use secret page directly
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  }); 
})
app.get("/secrets", function(req,res){
  //if the request is authenticated then only open secrets else redirect to login page
  //authenticated means if are logged in then the session will save a cookie of user 
  //and we can use this until we are logged in to see directly secret page without being able to login again
  // cookies ka kammal..! 
  if(req.isAuthenticated())
    res.render("secrets");
  else
    res.redirect("/login");
});

app.get("/register", function(req, res){
  res.render("register");
});
/*
app.get("/logout",function(req,res,next){
  //this line loggs u out and user have to agin login to see secrets
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
  //redirecting to home page
  res.redirect("/");
})
*/
app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});

app.post("/register", function(req,res){
  //instead of writing all below info , we can simply use .register() under passposrtlocalmongoose
  /*const newuser= new User({
    email:req.body.username,
    password:md5(req.body.password) //storing a hashed value
  });
  newuser.save(function(err){
    if(!err)
      res.render("secrets");
    else
      console.log(err);
  })*/
  User.register({username  :req.body.username },req.body.password, function(err, user){
    if(err)
    {
      console.log(err);
      res.redirect("/register");
    }
    else{
      //authenticate the password and use secret page directly
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  } )
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
