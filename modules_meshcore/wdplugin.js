/** 
* @description MeshCentral wdplugin
* @author 
* @copyright 
* @license 
*/

"use strict";
var mesh;
var obj = this;
var _sessionid;
var currentLogLevel = 0;
var fs = require('fs');
var os = require('os');

var log = function(loglevel, str) {
    if (currentLogLevel < loglevel) return;
    
    var logStr = '\n'+new Date().toISOString()+': '+ str;
    var fs = require('fs');
    var logStream = fs.createWriteStream('wdpluginlog.txt', {'flags': 'a'});
    // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
    logStream.write('\n'+new Date().toISOString()+': '+ str);
    logStream.end('\n');
}



function consoleaction(args, rights, sessionid, parent) {
    mesh = parent;
    _sessionid = sessionid;

    sendConsoleText("test", sessionid);
    console.log("plugin");
    switch (args.pluginaction) {
        case 'togui':

            break;
        case 'loglevel':
            currentLogLevel = args.loglevel;
            console.log("New loglevel: "+currentLogLevel);
            break;
        case 'exec':
            shellExec( arg.command );
            break;
        default:
            console.log('Unknown action: '+ args.pluginaction + ' with data ' + JSON.stringify(args));
        break;
    }
}



function sendConsoleText(text, sessionid) {
    if (typeof text == 'object') { text = JSON.stringify(text); }
    mesh.SendCommand({ "action": "msg", "type": "console", "value": text, "sessionid": sessionid });
}

function shellExec( command ) {
    var child = require('child_process').execFile('/bin/sh', ['sh']);
    child.stdout.str = '';
    child.stdout.on('data', function (chunk) { this.str += chunk.toString(); });
    child.stderr.str = ''; 
    child.stderr.on('data', function (chunk) { this.str += chunk.toString(); });

    child.stdin.write( command );
    child.waitExit();
    
    var stdOutString="";

    if (child.stdout.str.trim() != '')
    {
        stdOutString = child.stdout.str.trim();
        console.log("Command: "+command+" stdout: "+stdOutString);
    }
    if (child.stderr.str.trim() != '')
    {
        var stdErrSting = child.stdout.str.trim();
        console.log("Command: "+command+" stderr: "+stdErrSting);
    }
    return stdOutString;
}

module.exports = { consoleaction : consoleaction };