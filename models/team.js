const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema(
    {
        team_name:{
            type: String,
            required: true
        },
        team_leader:{
            type: String,
            required: true
        },
        team_members:[
            {
                name:{
                    type: String,
                }
            },
        ],
        project:{
            type: String,
            default: ""
        }
    }
);

const Team = mongoose.model('team',TeamSchema);

module.exports = Team;