const $ = require('jquery');
const {remote, shell, webFrame} = require('electron');
const request = require('request');
const cp = require('child_process');
const path = require('path');

$(function() {
    console.log('JQuery Initialized.');
    init();
})

function init() {
    frameEvent();
}

function frameEvent() {
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
