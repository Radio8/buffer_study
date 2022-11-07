 
const { myCLass } = require("./streamClassImplementation.js");
const fs = require('fs');
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5050;

let monStream = new myCLass;
monStream.launchStream()


app.get("/stream", (req, res) => {
	console.log('req header ', req.headers);
	
	const range = req.headers.range || "0";
	const videoPath = "../Streamer/tuto-radio_mini/Europe1.mp3"; // Fonctionne
  
	const videoSize = fs.statSync(videoPath).size;
	const chunkSize = 1 * 1e6; // -> 1MB
	const start = Number(range.replace(/\D/g, ""));
	const end = Math.min(start + chunkSize, videoSize - 1);
  
	const contentLength = end - start + 1;
  
	const headers = {
	  "Content-Range": `bytes ${start}-${end}/${videoSize}`,
	  "Accept-Ranges": "bytes",
	  "Content-Length": contentLength,
	  // "Content-Type": "video/mp4", // in Node.Js
	  "Content-Type": "audio/mpeg", 
	};
	res.writeHead(206, headers);
  
	const stream = fs.createReadStream(videoPath, { start, end });
	stream.pipe(res);
  });
  
  app.listen(PORT, console.log("Started on port 5050"));