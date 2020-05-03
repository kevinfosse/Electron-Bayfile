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
      isuploading = false;
      document.getElementById("linkafterupload").setAttribute("style", "visibility: hidden;");
      document.getElementById("select").setAttribute("value", path.basename(file));
    }
  });
  $("#upload").click(async function() {
    if(file === null) return document.getElementById("select").setAttribute("value", "Please select a file !");
    isuploading = true;
    document.getElementById("progress").setAttribute("style", "visibility: visible;");
    console.log("req");

    function genBoundary() {
      var boundary = '--------------------------';
      for (var i = 0; i < 16; i++) {
        boundary += Math.floor(Math.random() * 10).toString(16);
      }
      return boundary;
    }

    const fs = require('fs');
    const axios = require('axios');

    const fileStream = fs.createReadStream(file);
    let boundary = genBoundary();
    axios.request({
      method: "post",
      url: "https://bayfiles.com/api/upload",
      data: `--------------------------65b951bd86ed119f\nContent-Disposition: form-data; name="file"; filename="${path.basename(file)}"\nContent-Type: application/octet-stream\n\n${fs.readFileSync(file,"utf8")}\n\n--------------------------65b951bd86ed119f`,
      headers:{"Content-Type":'multipart/form-data; boundary=------------------------65b951bd86ed119f'},
      onUploadProgress: (p) => {
        document.getElementById("progress").setAttribute("value", p.loaded/p.total);
      }
    }).then(data => {
      document.getElementById("progress").setAttribute("style", "visibility: hidden;");
      document.getElementById("linkafterupload").setAttribute("style", "visibility: visible;");
      document.getElementById("linkafterupload").setAttribute("value", data.data.data.file.url.short);
      url = data.data.data.file.url.short;
      isuploading = false;
    })
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
