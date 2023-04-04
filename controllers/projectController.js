const validator = require("validator");
const bcrypt = require("bcryptjs");

const student = require("../models/student");
const teacher = require("../models/teacher");
const project = require("../models/project");
const team = require("../models/team");

exports.createProject = async function (req, res) {
    let teacherDomainNames = [];
    let spare = [];
    await teacher.find({}, async function (err, result) {
        if (err) {
            console.log(err);
        } else {
            await result.map(function (each) {
                each.topics.map(ech => teacherDomainNames.push(ech.topic_title));
            });
            spare = [...new Set(teacherDomainNames)];
            res.render("create_project", { major: spare,condition1: false,message:"",User:req.session.username });
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.generateProject = async function (req, res) {
    const title = req.body.title;
    const description = req.body.body;
    const major = req.body.major;

    await project.findOne({project_title:title},async function(err,foundProject){
        if(err){
            console.log(err);
        }else{
            if(foundProject){
                let teacherDomainNames = [];
                let spare = [];
                await teacher.find({}, async function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        await result.map(function (each) {
                            each.topics.map(ech => teacherDomainNames.push(ech.topic_title));
                        });
                        spare = [...new Set(teacherDomainNames)];
                        res.render("create_project", { major: spare,condition1: true,message:"A project with the same name already exists",User:req.session.username });
                    }
                }).clone().catch(function (err) { console.log(err) });
            }else{
                const data = await student.findOne({ username: req.session.username });

                const newProject = new project({
                    project_title: title,
                    project_description: description,
                    project_major: major,
                    project_team: data.team
                });
                try {
                    await newProject.save();
                    await team.findOne({team_name:data.team},async function(err,foundTeam){
                        if(err){
                            console.log(err);
                        }else{
                            foundTeam.project=title;
                            await foundTeam.save();
                        }
                    }).clone().catch(function (err) { console.log(err) });
                    const filteredTeachers = await teacher.find({ "topics": { $elemMatch: { topic_title: major, remainingProjects: { $gt: 0} } } });
                    const filteredTeacherNames = filteredTeachers.map(teacher => teacher.username);
                    const project_id = newProject._id;
                    res.render("teachers_list",{filteredTeachers:filteredTeacherNames,id:project_id,User:req.session.username});
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }).clone().catch(function (err) { console.log(err) });

    
}

exports.requestTeacher = async function(req,res){
    const selectedTeacher = req.body.selectedTeacher;
    const project_id = req.params.project_id;

    const decrease = await project.findOne({_id:project_id});
    const majorOfTeacherToBeDecreased = decrease.project_major;
    
    await teacher.findOne({username:selectedTeacher},async function(err,foundTeacher){
        if(err){
            console.log(err);
        }else{
            foundTeacher.project_undertaken.push({
                project_id:project_id
            });
            await foundTeacher.save();
        }
    }).clone().catch(function (err) { console.log(err) });
    await teacher.updateOne({username:selectedTeacher,"topics.topic_title":majorOfTeacherToBeDecreased},{$inc:{"topics.$.remainingProjects":-1}});
    res.redirect("/profile");
}

exports.showProject = async function(req,res){
    const id=req.params.project_id;
    await project.findOne({_id:id},function(err,foundProject){
        if(err){
            console.log(err);
        }else{
            res.render("single_project_screen",{title:foundProject.project_title,major:foundProject.project_major,content:foundProject.project_description,User:req.session.username});
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.changeProject = async function(req,res){
    const name = req.params.nameOfProject;
    await project.findOne({project_title:name},function(err,foundProject){
        if(err){
            console.log(err);
        }else{
            res.render("editable_project",{condition:false,message:"",project_id:foundProject._id,major:foundProject.project_major,project_title:foundProject.project_title,project_description:foundProject.project_description,User:req.session.username});
        }
    }).clone().catch(function (err) { console.log(err) });
}

exports.editProject = async function(req,res){
    const id = req.params.project_id;
    const title = req.body.title;
    const description = req.body.description;

    await project.findOne({_id:id},async function(err,foundProject){
        if(err){
            console.log(err);
        }else{
            await team.findOne({team_name:foundProject.project_team},async function(err,foundTeam){
                if(err){
                    console.log(err);
                }else{
                    if(foundTeam.team_leader===req.session.username){
                        foundProject.project_title = title;
                        foundProject.project_description = description;
                        await foundProject.save();
                        foundTeam.project = title;
                        await foundTeam.save();
                        res.redirect("/profile");
                    }else{
                        res.render("editable_project",{condition:true,message:"Only team leader can edit project",project_id:foundProject._id,major:foundProject.project_major,project_title:foundProject.project_title,project_description:foundProject.project_description,User:req.session.username});
                    }
                }
            }).clone().catch(function (err) { console.log(err) });
        }
    }).clone().catch(function (err) { console.log(err) });
}