const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeacherSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        topics:[
            {
                topic_title:{
                    type: String,
                },
                remainingProjects:{
                    type: Number,
                    default: 5
                }
            }
        ],
        project_undertaken:[
            {
                project_id:{
                    type: String,
                }
            }
        ]
    }
);

const Teacher = mongoose.model('teacher',TeacherSchema);

module.exports = Teacher;