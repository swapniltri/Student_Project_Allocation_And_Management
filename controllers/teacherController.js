const validator = require("validator");
const bcrypt = require("bcryptjs");

const student=require("../models/student");
const teacher=require("../models/teacher");
const project=require("../models/project");
const team=require("../models/team");

//Teacher's profile is handled in userController.

exports.teacher_login=async function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    await teacher.findOne({ username: username }, async function (err, foundUser) {
        if (err) {
            console.log("Error occured in finding user");
        } else {
            if (foundUser) {
                if (bcrypt.compareSync(password, foundUser.password)) {
                    req.session.isAuth = true;
                    req.session.username = username;
                    req.session.isTeacher = true;
                    res.redirect("/projects");
                } else {
                    res.render("entry", { condition: true, message: "Invalid Password" ,User:req.session.username});
                }
            } else {
                res.render("entry", { condition: true, message: "User not found, If you haven't signup! please signup first",User:req.session.username });
            }
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.teacher_signup=async function(req,res){
    const username = (req.body.username).trim();
    const email = req.body.email;
    const password = req.body.password;

    await teacher.findOne({ username: username }, async function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                res.render("signup", { condition: true, message: "Username already in use",User:req.session.username });
            } else {
                await teacher.findOne({ email: email }, function (err, foundMail) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (foundMail) {
                            res.render("signup", { condition: true, message: "Email already in use",User:req.session.username });
                        } else {
                            if (!validator.isEmail(email)) {
                                res.render("signup", { condition: true, message: "Please use authentic email" ,User:req.session.username});
                            } else {
                                var hash = bcrypt.hashSync(password, 8);
                                const signUpUser = new teacher({
                                    username: username,
                                    email: email,
                                    password: hash
                                });

                                try {
                                    signUpUser.save();
                                    req.session.isAuth = true;
                                    req.session.username = username;
                                    req.session.isTeacher = true;
                                    res.redirect("/projects");
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }
                }).clone().catch(function (err) { console.log(err) });
            }
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.addDomain = async function(req,res){
    const domain=(req.body.domain).trim();
    const number=(req.body.number).trim();
    await teacher.findOne({username:req.session.username},async function(err,foundTeacher){
        if(err){
            console.log(err);
        }else{
            foundTeacher.topics.push({
                topic_title:domain,
                remainingProjects:number
            });
            await foundTeacher.save();
            res.redirect("/profile");
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.deleteDomain = async function(req,res){
    await teacher.findOneAndUpdate({username:req.session.username},{$pull:{topics:{topic_title:req.params.domainTitle}}},function(err,done){
        if(err){
            console.log(err);
        }else{
            res.redirect("back");
        }
    }).clone().catch(function (err) { console.log(err) });
}