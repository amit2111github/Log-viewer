var express = require('express');
var router = express.Router();
var fs = require('fs');
const path = require("path");

router.post("/logs",(req , res , next)=> {
  try {
    const {method , keyword , date} = req.body;
    // console.log(method , keyword , date); 
    
    const dir = path.join( __dirname,"../" , "logs");
    let fileNames = fs.readdirSync(dir).filter(name => name.indexOf("log") != -1); 
    if(date && date.length > 0) {
      fileNames = fileNames.filter(name => +(name.indexOf(date+"")) !== -1);
    } 

    fileNames = fileNames.map(fileName => fs.readFileSync(path.join(dir ,"/",fileName)));
    fileNames = fileNames.map(data => data.toString().split("\n"));
    let data = [];

    for(let arr of fileNames) {
      for(let i = 0;i < arr.length-1;i++) {
        if(arr[i].length > 0 ) data.push(arr[i]);
      } 
    }

    if(keyword && keyword.length > 0) {
      data = data.filter(name => {
        return name.indexOf(keyword) !== -1;
      })
    }
    data = data.map(item => JSON.parse(JSON.stringify(item)));

    if(method.length > 0)  {
      data = data.filter(g => {
        if(g.indexOf("{") == -1 || g.indexOf("�") != -1) return false;
        const obj = JSON.parse(g);
        return obj.meta.req.method.toLowerCase() === method.toLowerCase();

      });  
    }

    if(data.length <= 0) return res.json({data:[]});  

    return res.json({data});  
  }
  catch(err) {
    console.log(err);
    return res.json({error : err});
  }
});
router.get('/logs/', async (req, res, next) => {
  const dir = path.join( __dirname,"../" , "logs");
  let fileNames = fs.readdirSync(dir).filter(name => name.indexOf("log") != -1);
  fileNames = fileNames.map(fileName => fs.readFileSync(path.join(dir ,"/",fileName)));
  fileNames = fileNames.map(data => {
    return data.toString().split("\n");
  });
  const data = [];
  for(let arr of fileNames) {
    for(let i = 0;i < arr.length-1;i++) {
      if(arr[i].indexOf("{") == -1 || arr[i].indexOf("�") != -1) continue;
      data.push(JSON.parse(arr[i]));
      if(data.length >= 100) break;
    }
  }
  res.render("index",{title : "Logo" , data});
});

module.exports = router;
