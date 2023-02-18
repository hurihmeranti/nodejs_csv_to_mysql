const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mysql = require("mysql");
const path = require("path");
const csv = require("fast-csv");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({extended : false}))

app.use(bodyParser.json());

//this config multer
let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads/");
    },
    filename:(req, file, callback) => {
        callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
});

let upload = multer({
    storage: storage
});

//this connection server
const db = mysql.createPool({
    host : "localhost",
    user : "root",
    password : "",
    database : "nodejscsv"
}); 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.post("/import-csv", upload.single("file"), (req, res) => {
    console.log(req.file.path);
    uploadCsv(__dirname + "/uploads/" + req.file.filename);
})

function uploadCsv(path){
    let stream = fs.createReadStream(path);
    let csvDataColl = []
    let fileStream = csv
    .parse()
    .on("data", function(data){
        csvDataColl.push(data);
    })
    .on("end", function(){
        csvDataColl.shift();

        db.getConnection((error, connection) => {
            if(error) {
                console.log(error);
            } else {
                let query ="INSERT INTO nodejs_csv (id,name,age,country) VALUES ?";
                connection.query(query, [csvDataColl], (error, res) => {
                    console.log(error || res);
                })
            }
        })
    })
    stream.pipe(fileStream);
}

app.listen(7000,() => {
    console.log("App is running in port 6347!");
})