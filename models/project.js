const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        project_title:{
            type: String,
            required: true
        },
        project_description:{
            type: String,
            required: true
        },
        project_major:{
            type:String,
            required:true
        },
        project_team:{
            type: String,
            required: true
        }
    }
);

const Project = mongoose.model('project',ProjectSchema);

module.exports = Project;