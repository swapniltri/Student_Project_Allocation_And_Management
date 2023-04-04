const validator = require("validator");
const bcrypt = require("bcryptjs");

const student=require("../models/student");
const teacher=require("../models/teacher");
const project=require("../models/project");
const team=require("../models/team");

exports.entry=function(req,res){
    res.render("entry",{condition:false,message:"",User:req.session.username});
}

exports.signup=function(req,res){
    res.render("signup",{condition:false,message:"",User:req.session.username});
}

exports.student_login=async function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    await student.findOne({ username: username }, async function (err, foundUser) {
        if (err) {
            console.log("Error occured in finding user");
        } else {
            if (foundUser) {
                if (bcrypt.compareSync(password, foundUser.password)) {
                    req.session.isAuth = true;
                    req.session.username = username;
                    req.session.isTeacher = false;
                    res.redirect("/projects");
                } else {
                    res.render("entry", { condition: true, message: "Invalid Password",User:req.session.username });
                }
            } else {
                res.render("entry", { condition: true, message: "User not found, If you haven't signup! please signup first" ,User:req.session.username});
            }
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.student_signup=async function(req,res){
    const username = (req.body.username).trim();
    const email = req.body.email;
    const password = req.body.password;
    const rollno = req.body.rollno;
    const branch = req.body.branch;

    await student.findOne({ username: username }, async function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                res.render("signup", { condition: true, message: "Username already in use",User:req.session.username });
            } else {
                await student.findOne({ email: email }, function (err, foundMail) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (foundMail) {
                            res.render("signup", { condition: true, message: "Email already in use" ,User:req.session.username});
                        } else {
                            if (!validator.isEmail(email)) {
                                res.render("signup", { condition: true, message: "Please use authentic email" ,User:req.session.username});
                            } else {
                                var hash = bcrypt.hashSync(password, 8);
                                const signUpUser = new student({
                                    username: username,
                                    email: email,
                                    password: hash,
                                    rollno: rollno,
                                    branch: branch
                                });

                                try {
                                    signUpUser.save();
                                    req.session.isAuth = true;
                                    req.session.username = username;
                                    req.session.isTeacher = false;
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

exports.projects=async function(req,res){
    let projects = await project.find({});
    res.render("projects",{username:req.session.username,projects:projects,User:req.session.username});
}

exports.profile=async function(req,res){
    if(req.session.isTeacher===true){
        await teacher.findOne({username:req.session.username},async function(err,foundTeacher){
            if(err){
                console.log(err);
            }else{
                if(foundTeacher.topics.length===0)
                res.render("profileT",{username:req.session.username,domain:{},projects:{},User:req.session.username});
                else{
                    const current = foundTeacher.project_undertaken;
                    let temp = [];
                    await current.map(each => temp.push(each.project_id));
                    let projects = await project.find({_id:{"$in":temp}});
                    res.render("profileT",{username:req.session.username,domain:foundTeacher.topics,projects:projects,User:req.session.username});
                }
            }
        }).clone().catch(function (err) { console.log(err) });

    }else{
        await student.findOne({username:req.session.username},async function(err,foundStudent){
            if(err){
                console.log(err);
            }else{
                if(foundStudent){
                    await team.findOne({team_name:foundStudent.team},function(err,foundTeam){
                        if(err){
                            console.log(err);
                        }else{
                            if(foundTeam){
                                res.render("profileS",{condition1:false,message:"",teamName:foundTeam.team_name,username:foundStudent.username,rollno:foundStudent.rollno,branch:foundStudent.branch,member:foundTeam.team_members.length===null?[]:foundTeam.team_members,condition3:true,condition2:(foundTeam.project===""?true:false),nameOfProject:foundTeam.project,User:req.session.username});
                            }else{
                                res.render("profileS",{condition1:false,message:"",teamName:"",username:foundStudent.username,rollno:foundStudent.rollno,branch:foundStudent.branch,member:[],condition3:false,condition2:false,nameOfProject:"",User:req.session.username});
                            }
                        }
                    }).clone().catch(function (err) { console.log(err) });
                }else{
                    console.log("Student not found");
                }
            }
        }).clone().catch(function (err) { console.log(err) });
    }
}

exports.addMember=async function(req,res){
    const username=req.body.username;
    const teamName=req.params.teamName;
    await student.findOne({username:username},async function(err,foundStudent){
        if(err){
            console.log(err);
        }else{
            await team.findOne({team_name:teamName},async function(err,found){
                if(err){
                    console.log(err);
                }else{
                    if(req.session.username===found.team_leader){
                        if(foundStudent){
                            if(foundStudent.team===""){
                                found.team_members.push({
                                    name:username
                                });
                                await found.save();
                                foundStudent.team=teamName;
                                await foundStudent.save();
                                res.render("team",{condition1:false,teamName:teamName,member:found.team_members,User:req.session.username});
                            }else{
                                res.render("team",{condition1:true,message:"Student is already in some other team",teamName:teamName,member:found.team_members,User:req.session.username});
                            }
                        }else{
                            res.render("team",{condition1:true,message:"Student not found",teamName:teamName,member:found.team_members,User:req.session.username});
                        }
                    }else{
                        res.render("team",{condition1:true,message:"Only Team Leader can add or remove Members",teamName:teamName,member:found.team_members,User:req.session.username});
                    }
                }
            }).clone().catch(function (err) { console.log(err) }); 
        }
    }).clone().catch(function (err) { console.log(err) });   
}

exports.get_addMember=async function(req,res){
    const teamName=req.params.teamName;
    await team.findOne({team_name:teamName},function(err,found){
        if(err){
            console.log(err);
        }else{
            res.render("team",{condition1:false,teamName:teamName,member:found.team_members,User:req.session.username});
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.createTeam=async function(req,res){
    const teamName=req.body.teamName;

    await team.findOne({team_name:teamName},async function(err,foundTeam){
        if(err){
            console.log(err);
        }else{
            if(foundTeam){
                await student.findOne({username:req.session.username},async function(err,foundStudent){
                    if(err){
                        console.log(err);
                    }else{
                        if(foundStudent){
                            await team.findOne({team_name:foundStudent.team},function(err,foundTeam){
                                if(err){
                                    console.log(err);
                                }else{
                                    if(foundTeam){
                                        res.render("profileS",{condition1:true,message:"Team name is already taken",teamName:foundTeam.teamName,username:foundStudent.username,rollno:foundStudent.rollno,branch:foundStudent.branch,member:foundTeam.team_members.length===null?[]:foundTeam.team_members,condition3:true,condition2:(foundTeam.project===""?true:false),nameOfProject:foundTeam.project,User:req.session.username});
                                    }else{
                                        res.render("profileS",{condition1:true,message:"Team name is already taken",teamName:"",username:foundStudent.username,rollno:foundStudent.rollno,branch:foundStudent.branch,member:[],condition3:false,condition2:false,nameOfProject:"",User:req.session.username});
                                    }
                                }
                            }).clone().catch(function (err) { console.log(err) });
                        }else{
                            console.log("Student not found");
                        }
                    }
                }).clone().catch(function (err) { console.log(err) });
            }else{
                const new_team = new team({
                    team_name: teamName,
                    team_leader: req.session.username
                });
                await new_team.save();
                await team.findOne({team_name:teamName},async function(err,found){
                    if(err){
                        console.log(err);
                    }else{
                        found.team_members.push({
                            name:req.session.username
                        });
                        await found.save();
                        res.render("team",{condition1:false,member:found.team_members,teamName:teamName,User:req.session.username});
                    }
                }).clone().catch(function (err) { console.log(err) });
                await student.findOne({username:req.session.username},async function(err,foundStudent){
                    if(err){
                        console.log(err);
                    }else{
                        foundStudent.team=teamName;
                        await foundStudent.save();
                    }
                }).clone().catch(function (err) { console.log(err) });
            }
        }
    }).clone().catch(function (err) { console.log(err) });

}

exports.deleteMember = async function(req,res){
    await student.findOne({username:req.session.username},async function(err,found){
        if(err){
            console.log(err);
        }else{
            await team.findOne({team_name:found.team},async function(err,foundTeam){
                if(err){
                    console.log(err);
                }else{
                    if(foundTeam.team_leader===req.session.username){
                        if(req.params.memberName===foundTeam.team_leader){
                            res.render("team",{condition1:true,message:"Team leader cannot be removed",member:foundTeam.team_members,teamName:found.team,User:req.session.username});
                        }else{
                            await student.findOne({username:req.params.memberName},async function(err,foundMem){
                                if(err){
                                    console.log(err);
                                }else{
                                    foundMem.team="";
                                    await foundMem.save().then(async result=>{
                                        await team.findOne({team_name:found.team},async function(err,foundTm){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                await foundTm.team_members.pull({
                                                    name:req.params.memberName
                                                });
                                                await foundTm.save().then(async result=>{
                                                    await res.render("team",{condition1:false,member:result.team_members,teamName:found.team});
                                                }).catch(err=>console.log(err));
                                                // res.render("team",{condition1:false,member:foundTm.team_members,teamName:found.team});
                                            }
                                        }).clone().catch(function (err) { console.log(err) });
                                    }).catch(err=>console.log(err));
                                    // await team.findOne({team_name:found.team},async function(err,foundTm){
                                    //     if(err){
                                    //         console.log(err);
                                    //     }else{
                                    //         await foundTm.team_members.pull({
                                    //             name:req.params.memberName
                                    //         });
                                    //         await foundTm.save().then(result=>{
                                    //             res.render("team",{condition1:false,member:result.team_members,teamName:found.team});
                                    //         }).catch(err=>console.log(err));
                                    //         // res.render("team",{condition1:false,member:foundTm.team_members,teamName:found.team});
                                    //     }
                                    // }).clone().catch(function (err) { console.log(err) });
                                }
                            }).clone().catch(function (err) { console.log(err) });
                            
                            // await team.findOne({team_name:found.team},async function(err,foundTm){
                            //     if(err){
                            //         console.log(err);
                            //     }else{
                            //         res.render("team",{condition1:false,member:foundTm.team_members,teamName:found.team});
                            //     }
                            // }).clone().catch(function (err) { console.log(err) });
                        }
                    }else{
                        res.render("team",{condition1:true,message:"Only team leader can remove the members",member:foundTeam.team_members,teamName:found.team,User:req.session.username});
                    }
                }
            }).clone().catch(function (err) { console.log(err) });
        }
    }).clone().catch(function (err) { console.log(err) });
}




exports.logout = function (req, res) {
    req.session.destroy(err => {
        console.log(err);
    });
    res.redirect("/");
}