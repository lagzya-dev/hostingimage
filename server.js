const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer, {
	maxHttpBufferSize: 1e50
});
httpServer.listen(3000, () => {
	console.log("Init");
})
const fs = require("fs");
var imageinfo = require('imageinfo');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/images/*', (req, res) => {
  console.log(req.url + '' + res)
  res.sendFile(__dirname + '/public'+ req.url);
});

io.on("connection", async (socket) => {
  socket.on("upload", async (file, callback) => {
    try{
      // <Buffer 25 50 44 ...>
      let info = imageinfo(file);
      
      console.log('1')
      if(info == undefined){
        return
      }
      console.log(info.format)
      console.log('2')
      if(info.format == undefined) return
      console.log('3')
      // save the content to the disk, for example
      let id = makeid(10);
      console.log('start')
      await fs.writeFile(`./public/images/${id}.${info.format.toLowerCase()}`, file, async (err) => {
        console.log(err)
        callback({ message: err ? "failure" : `${id}.${info.format.toLowerCase()}`, });
        
         console.log('finish')
      });
    }
    catch(e){
      console.log(e)
    }
  });
  loadImage(socket);
});
function loadImage(socket){
  fs.readdir("./public/images", (err, files) => {
      files.forEach((file) => {
        socket.emit("addImage", file)
      })
  })
}
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  if(fs.existsSync("./public/images/" + result + ".png" || "./public/images/" + result + ".jpg" || "./public/images/" + result + ".gif")) return makeid(length);
  return result;
}
