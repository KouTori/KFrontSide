const electron = require("electron");
const app = electron.app;

let red,yellow;
let before = "",now = "";

const notifier = require('node-notifier');

const BrowserWindow = electron.BrowserWindow;
let mainWindow;
let ifmainWindowShow = false;

console.log(__dirname);

const w = require(__dirname +"/GetWarningModule/index");

const interval = setInterval(()=>{
    w.getWarning().then((result)=>{
        var array = JSON.parse(result);
        before = now;
        now = result;
        red = Object.keys(array).filter(item => array[item] == "発表" && item.includes("警報"));
        red += Object.keys(array).filter(item => array[item] == "継続" && item.includes("警報"));
        yellow = Object.keys(array).filter(item => array[item] == "発表" && item.includes("注意報"));
        yellow += Object.keys(array).filter(item => array[item] == "継続" && item.includes("注意報"));
        if(now != before){
            if(mainWindow != null || mainWindow != undefined){
                mainWindow.loadURL("http://localhost:8089/");
            }
            notifier.notify({
                "title" : "気象警報・注意報が更新されました。",
                "message" : "アプリを開く。",
                "sound": "Morse",
                "icon" : __dirname + "/icon.png"
            });
        }
    });
},7000);

const express = require("express");
let appe = express();

//require other modules
//var helmet = require("helmet");
const cookiePaser = require('cookie-parser');
const ejs = require("ejs");

//express setting
appe.use(express.json());
appe.use(express.urlencoded({ extended: false }));
appe.use(cookiePaser());
//appe.use(helmet());
appe.set('trust proxy', 1);

//ejs setting
appe.set("view engine", "ejs");

appe.get('/',(req,res)=>{
    w.getWarning().then((result)=>{
        var array = JSON.parse(result);
        red = Object.keys(array).filter(item => array[item] == "発表" && item.includes("警報"));
        red += Object.keys(array).filter(item => array[item] == "継続" && item.includes("警報"));
        yellow = Object.keys(array).filter(item => array[item] == "発表" && item.includes("注意報"));
        yellow += Object.keys(array).filter(item => array[item] == "継続" && item.includes("注意報"));
        res.render(__dirname +"/views/mainWindow.ejs", {red: red,yellow:yellow });
    });
});

//http server setting
const PORT = process.env.PORT || 8089;
var protocol = require("http");
var server = protocol.createServer(appe);

//server start
server.listen(PORT);

notifier.on("click", (notifierObject, options)=>{
    if(mainWindow == null || mainWindow == undefined){
        mainWindow = new BrowserWindow({width: 500,height: 150});
        mainWindow.loadURL("http://localhost:8089/");
        ifmainWindowShow = true;
    }else{
        mainWindow.show();
        ifmainWindowShow = true;
    }
})

app.on("window-all-closed", () =>{
    if(process.platform != "darwin"){
        app.quit();
    }
});

app.on("ready", () =>{
    mainWindow = new BrowserWindow({width: 500,height: 150});
    mainWindow.hide();
    mainWindow.loadURL("http://localhost:8089/");

  //const myNotification = new Notification( 'Title' , { body : 'Lorem Ipsum Dolor Sit Amet' }) 
  mainWindow.on('close', (event) => {
      if(ifmainWindowShow == true){
        event.preventDefault();
        mainWindow.hide();
        ifmainWindowShow = false;
      }else{
        mainWindow = null;
      }
  });
});

app.on('activate', () => {
    if(mainWindow == null || mainWindow == undefined){
        mainWindow = new BrowserWindow({width: 500,height: 150});
        mainWindow.loadURL("http://localhost:8089/");
        ifmainWindowShow = true;
    }else{
        mainWindow.show();
        ifmainWindowShow = true;
    }
});