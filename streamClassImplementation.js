
const fs = require('fs');
// const Blob = require('node-blob'); // Non c de la merde ça d'ailleurs tu l'as installé
const { Blob, Buffer } = require ('node:buffer');
const { Readable } = require('stream');
let request = require('request');
let output_file_name = fs.createWriteStream("output_file.mp3");
const cp = require('child_process');

class myCLass extends Readable {
    constructor(options) {
        if (!options) {
            console.log("Pas d'option"); 
            options = {};
        }
        options.objectMode = true;
        super(options);
        this.bufferSize = 0
        this.value2 = 2
        this.buffer = [] // Buffer.alloc(10e6);
        // this.on("data", (data) => { // Same as "stream.on('data',(...)"
        //     console.log('data is : ', data);
        // })
    }

    async launchStream() {
      const self = this;

      let stream = request.get('http://start-voltage.ice.infomaniak.ch/start-voltage-high.mp3');
      stream.on("response", function(response) {
          console.log('response received');
          let start_time = Date.now();
        
          stream.on('data', function(chunk) {
            // console.log('data received', chunk);

            self.buffer.push({data : chunk, size : chunk.length})
            // self.buffer.push(chunk)

            self.bufferSize += chunk.length;
            // console.log(self.push(chunk)) // Push puis stop : true (* 15) then false
            // self.pipe(output_file_name) // Si les deux sont activé ça rippe & ça lag

            // Calculate the time we have been streaming for
            let cur_time = Date.now();
            let cur_length = cur_time - start_time

            // Abort the stream when the duration (millisec) is passed
            if (cur_length >= 1200/* 000 */) {
              stream.abort();
              // console.log("Finished. Output to:", output_file_name)
            }
          })
          .on('end', function(err) {
            console.log('end stream self.buffer.length : ', self.buffer.length,
                        ' self.bufferSize ', self.bufferSize);

            for (let index = 0; index < self.buffer.length; index++)
              output_file_name.write(self.buffer[index].data)
/*
              // Création du Blob (ça a l'air d'une béquille foireuse coté server)
              const blob = new Blob(self.buffer, { type: "audio/mpeg" });
              // Création du readableStream
              blob.stream()
*/

/*             // console.log("buffer ", self.buffer)
            const buf = new Buffer(self.buffer);
            // const myStream = fs.createReadStream(buf)
            const myStream = Readable.from(buf);
            myStream.pipe(output_file_name); */

              // cp.spawn("ffplay", ["-"], { stdio: ['pipe', 'pipe', 'pipe'] }).stdout.pipe(self.buffer); // NON FONCTIONNEL
            	// const ffprobe = cp.spawn("ffprobe", ["-"], { stdio: ['pipe', 'pipe', 'pipe'] }); //EXEMPLE
            	const fflay = cp.spawn("ffplay", ["-nodisp","-autoexit","-loglevel","quiet","output_file.mp3"], { stdio: ['pipe', 'pipe', 'pipe'] }); // FONCTIONNE
          })
          .on('error', function(err) {
            // handle error
            console.error(err)
          });
          // stream.pipe(output_file_name);
        })
    }

    feedStream() {
        this.push("hello")
    }

    readStream() {
        console.log("readStream", this.value2);
        console.log(this.read());
    }

    _read() {
        // pass
    }

}

exports.myCLass = myCLass;

let monStream = new myCLass;
monStream.launchStream()
// monStream.readStream()

/* 
Mettre le flux ds un buffer // FAIT
Mettre le buffer ds un fichier // FAIT
Ecouter le ficher // FAIT
Garder le buffer en mémoire et pouvoir l'écouter
Envoyer le buffer par bout vers un client
Ecouter le buffer envoyé depuis le client
*/