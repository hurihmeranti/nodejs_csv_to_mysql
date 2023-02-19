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
    database : "lelaki_pakedata"
}); 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.post("/import-csv", upload.single("file"), (req, res) => {
    console.log(req.file.path);
    uploadCsv(__dirname + "/uploads/" + req.file.filename);
    res.send(`upload data success`);
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
                let query ="INSERT INTO efict_table (Name,Given_Name,Additional_Name,Family_Name,Yomi_Name,Given_Name_Yomi,Additional_Name_Yomi,Family_Name_Yomi,Name_Prefix,Name_Suffix,Initials,Nickname,Short_Name,Maiden_Name,Birthday, Gender,Location,Billing_Information,Directory_Server,Mileage,Occupation,Hobby,Sensitivity,Priority,Subject,Notes,Language,Photo,Group_Membership,E_mail_1_Type,E_mail_1_Value,E_mail_2_Type,E_mail_2_Value,E_mail_3_Type,E_mail_3_Value,E_mail_4_Type,E_mail_4_Value,IM_1_Type,IM_1_Service,IM_1_Value,Phone_1_Type,Phone_1_Value,Phone_2_Type,Phone_2_Value,Phone_3_Type,Phone_3_Value,Address_1_Type,Address_1_Formatted,Address_1_Street,Address_1_City,Address_1_PO_Box,Address_1_Region,Address_1_Postal_Code,Address_1_Country,Address_1_Extended_Address,Organization_1_Type,Organization_1_Name,Organization_1_Yomi_Name,Organization_1_Title,Organization_1_Department,Organization_1_Symbol,Organization_1_Location,Organization_1_Job_Description,Website_1_Type,Website_1_Value,Website_2_Type,Website_2_Value) VALUES ?";
                connection.query(query, [csvDataColl], (error, res) => {
                    //console.log(error || res);
                })
            } 
        });
    });
    stream.pipe(fileStream)
}

app.listen(7000,() => {
    console.log("App is running in port 6347!");
})