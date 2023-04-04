const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StudentSchema = new Schema(
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
        rollno:{
            type: String,
            required: true
        },
        branch:{
            type: String,
            required: true
        },
        team:{
            type: String,
            default: ""
        }
    }
);

const Student = mongoose.model('student',StudentSchema);

module.exports = Student;