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
    console.log("req")
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
    });
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
