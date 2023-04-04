const express = require('express');
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//Socket
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//Session setup
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session); //Local storage in mongoDB to store information about the session

//Routes
const routes = require("./routes");

//Config
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"});

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

const DB = process.env.DB_URL;

mongoose.set("strictQuery", false);
mongoose.connect(DB,{useNewUrlParser:true,useUnifiedTopology:true}).then(() => {
    console.log("Success");
}).catch((err) => console.log("Failed"));


//Establishing the session connection with mongoDB, after connecting the application to mongoDB

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        uri: DB,
        collection: "session"
    }),
    cookie:{
        maxAge: 1000 * 60 * 60 * 24 //1 day in milisec.
    }
}));


app.use("/", routes);



io.sockets.on('connection', function (socket) {
    socket.on('chat_message', (msg) => {
        io.emit('chat_message', msg);
    });
})

server.listen(process.env.PORT || 4000, function(){
    console.log(`listening on port: ${process.env.PORT}`);
});

// app.listen(4000,function(){
//     console.log("running on port 4000");
// });

