const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const ejse = require('ejs-electron');

let frame;

app.on("ready", () => {
  if(process.platform === "darwin"){
    frame = new BrowserWindow({
      width: 900,
      height: 300,
      frame: true,
      titleBarStyle: "hiddenInset",
      backgroundColor: '#2f3640',
      maximizable: false
    });
  } else {
    frame = new BrowserWindow({
      width: 900,
      height: 300,
      frame: false,
      backgroundColor: '#2f3640'
    });
  }

  frame.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'app.ejs'),
    protocol: 'file:',
    slashes: true
  }));

  frame.webContents.openDevTools({mode: "detach"})

  frame.setMenu(null);
  frame.setResizable(false);

  frame.on('closed', () => {
    frame = null;
  });
});
