const express = require("express");
const router = express.Router();

const teacherController = require("./controllers/teacherController");
const userController = require("./controllers/userController");
const projectController = require("./controllers/projectController");

router.get("/", userController.entry);
router.get("/projects",userController.projects);
router.get("/signup",userController.signup);
router.get("/logout",userController.logout);
router.get("/profile",userController.profile);
router.get("/addMember/:teamName",userController.get_addMember);
router.get("/createProject",projectController.createProject);
router.get("/project/:project_id",projectController.showProject);
router.get("/changeProject/:nameOfProject",projectController.changeProject);

router.post("/teacher_login",teacherController.teacher_login);
router.post("/student_login",userController.student_login);
router.post("/teacher_signup",teacherController.teacher_signup);
router.post("/student_signup",userController.student_signup);
router.post("/createTeam",userController.createTeam);
router.post("/addMember/:teamName",userController.addMember);
router.post("/addDomain",teacherController.addDomain);
router.post("/deleteDomain/:domainTitle",teacherController.deleteDomain);
router.post("/deleteMember/:memberName",userController.deleteMember);
router.post("/generateProject",projectController.generateProject);
router.post("/requestTeacher/:project_id",projectController.requestTeacher);
router.post("/editProject/:project_id",projectController.editProject);

module.exports = router;