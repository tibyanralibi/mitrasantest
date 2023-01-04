const express=require("express");
const body_parser=require("body-parser");
const res = require("express/lib/response");
const req = require("express/lib/request");
const axios=require("axios");
require('dotenv').config();


const token=process.env.TOKEN; //for sending the request
const myToken=process.env.MYTOKEN; //for webhook verification
const port=process.env.PORT || 8000;

//create app from express
const app=express().use(body_parser.json());
app.listen(port,()=>{
    console.log("webhook is listening on port " + port);
});

//to verify the callback url from dashboard side (cloud api side)
app.get("/webhook",(req,res)=>{
    let mode=req.query["hub.mode"];
    let challenge=req.query["hub.challenge"];
    let verify_token=req.query["hub.verify_token"];

    if(mode && token){
        if(mode=="subscribe" && verify_token==myToken){
            res.status(200).send(challenge);
        }else{
            res.status(403);
        }
    }
});

app.post("/webhook",(req,res)=>{
    let body_param=req.body;
    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside the body param");
        if(body_param.entry &&
             body_param.entry[0].changes &&
              body_param.entry[0].changes[0].value.messages &&
              body_param.entry[0].changes[0].value.messages[0]
              ){
                    let phone_number_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                    let from = body_param.entry[0].changes[0].value.messages[0].from;
                    let message_body = body_param.entry[0].changes[0].value.messages[0].text.body;

                    console.log("Phone Number ID : " + phone_number_id);
                    console.log("FROM : " + from);
                    console.log("MESSAGE BODY : " + message_body);


                    //Put The logic to read the message here
                    //End Put The logic to read the message here

                    //Reply the user message
                    axios({
                        method:"POST",
                        url:"https://graph.facebook.com/v15.0/"+phone_number_id+"/messages?access_token="+token,
                        data:{
                            messaging_product:"whatsapp",
                            to:from,
                            text:{
                                body:"Hi, Thank you for your message."
                            }
                        },
                        headers:{
                            "Content-Type":"application/json"
                        }
                    });

                    res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }
    }
});

app.get("/",(req,res)=>{
    res.status(200).send("Hello this is webhook setup");
});

app.get("/ping",(req,res)=>{
    res.send("Pong");
});