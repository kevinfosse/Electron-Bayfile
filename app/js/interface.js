const $ = require('jquery');
const {remote, clipboard} = require('electron');
const {dialog} = remote;
const fs = require('fs');
const {exec} = require('child_process');
const platformFolders = require("platform-folders");
const path = require('path');
let file = null;
let isuploading = false;
let url;

$(function() {
  console.log('JQuery Initialized.');
  init();
})

function init() {
  frame();
  app();
}

function frame() {
  $("#frame-button-close").click(function() {
    const window = remote.getCurrentWindow();
    window.close();
  });
  $("#frame-button-minimize").click(function() {
    const window = remote.getCurrentWindow();
    window.minimize();
    document.activeElement.blur();
  });
}

function app() {
  $("#select").click(async function() {
    if(isuploading) return;
    file = await dialog.showOpenDialog({defaultPath: platformFolders.getDocumentsFolder(), properties: ['openFile']});
    if(file === undefined){
      document.getElementById("select").setAttribute("value", "Please select a file !");
      file = null;
    } else {
      file = file[0];
      isupload = false;
      document.getElementById("linkafterupload").setAttribute("style", "visibility: hidden;");
      document.getElementById("select").setAttribute("value", path.basename(file));
    }
  });
  $("#upload").click(async function() {
    if(file === null) return document.getElementById("select").setAttribute("value", "Please select a file !");
    isuploading = true;
    document.getElementById("progress").setAttribute("style", "visibility: visible;");
    console.log("req");
    /*console.log(path.join(__dirname, "bin", `curl${(process.platform === "win32") ? ".exe" : ""}`))
    let child = exec(`"${path.join(__dirname, "bin", `curl${(process.platform === "win32") ? ".exe" : ""}`)}" -# -F "file=@${file}" https://api.bayfiles.com/upload`);
    child.stdout.on("data", data => {
      data = JSON.parse(data);
      zeropass = false;
      isuploading = false;
      if(data.error) throw err;
      url = data.data.file.url.short;
      document.getElementById("linkafterupload").setAttribute("style", "visibility: visible;");
      document.getElementById("linkafterupload").setAttribute("value", url);
      document.getElementById("progress").setAttribute("style", "visibility: hidden;");
      document.getElementById("upload").setAttribute("value", "Upload");
      document.getElementById("progress").setAttribute("value", 0);
    });
    let pourcent = 0;
    child.stderr.on("data", data => {
      var pourcen = parseFloat(data.split("%")[0].split(" ").slice(-1)[0].replace(",", "."));
      if(isNaN(pourcen)) return;
      if(pourcen >= pourcent){
        pourcent = pourcen;
        document.getElementById("upload").setAttribute("value", pourcent + "%");
        document.getElementById("progress").setAttribute("value", pourcent);
      }
    });*/

    function genBoundary() {
      var boundary = '------------------------';
      for (var i = 0; i < 16; i++) {
        boundary += Math.floor(Math.random() * 10).toString(16);
      }
      return boundary;
    }

    const fs = require('fs')
    //const util = require('util')
    const HttpsProxyAgent = require('https-proxy-agent');
    const axios = require('axios');
    const FormData = require('form-data');
    const fetch = require("node-fech");
    const Progress = require('node-fetch-progress');

    const fileStream = fs.createReadStream(file);
    const fileStats = fs.statSync(file);
    const fileLength = fileStats.size;
    const form = new FormData()
    form.append('file', fileStream, { knownLength: fileLength });

    /*axios.post('https://api.bayfiles.com/upload', form, {
      headers: form.getHeaders(),
      proxy: {
        host: '127.0.0.1',
        port: 8888
      }
    }).then(result => {
      console.log(result);
    });

    /*var xhr = new XMLHttpRequest();
    xhr.open('POST', "https://api.bayfiles.com/upload", true);
    xhr.upload.addEventListener("progress", function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        percentComplete = parseInt(percentComplete * 100);
        console.log(percentComplete);

        if (percentComplete === 100) {
          console.log(evt)
        }

      }
    }, false);
    xhr.onload = function () {
      console.log(JSON.parse(xhr.response));
    };
    xhr.send(form);

    /*process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    let res = await fetch("https://api.bayfiles.com/upload", {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    if (!res.ok && res.status !== 400) {
      console.log("hmm");
    } else {
      const { status, error, data } = await res.json()
      console.log(data);
    }*/
  });
  $("#linkafterupload").click(function() {
    console.log('click');
    clipboard.writeText(url);
    document.getElementById("linkafterupload").setAttribute("value", "Copied !");
    setTimeout(() => {
      document.getElementById("linkafterupload").setAttribute("value", url);
    }, 2500)
  })
}

function getcurl() {
  if(process.platform === "win32"){
    return path.join(__dirname, "bin", "curl.exe");
  } else {
    return path.join(__dirname, "bin", "curl");
  }
}
