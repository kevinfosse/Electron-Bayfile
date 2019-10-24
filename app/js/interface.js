const $ = require('jquery');
const {remote, shell, webFrame} = require('electron');
const {dialog} = remote;
const fs = require('fs');
const {exec} = require('child_process');
const platformFolders = require("platform-folders");
const path = require('path');
let file = null;
let isupload = false;
let isuploading = false;

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
      document.getElementById("select").setAttribute("value", path.basename(file));
    }
  });
  $("#upload").click(async function() {
    if(file === null) return document.getElementById("select").setAttribute("value", path.basename(file));
    isuploading = true;
    document.getElementById("progress").setAttribute("style", "visibility: visible;");
    console.log("req")
    let child = exec(`"${path.join(__dirname, "bin", `curl${(process.platform === "win32") ? ".exe" : ""}`)}" -# -F "file=@${file}" https://api.bayfiles.com/upload`);
    child.stdout.on("data", data => {
      data = JSON.parse(data);
      zeropass = false;
      isuploading = false;
      isupload = true;
      if(data.error) throw err;
      document.getElementById("linkafterupload").setAttribute("value", data.data.file.url.full);
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
    });
  });
  $("#copy").click(function() {

  })
}

function getcurl() {
  if(process.platform === "win32"){
    return path.join(__dirname, "bin", "curl.exe");
  } else {
    return path.join(__dirname, "bin", "curl");
  }
}
