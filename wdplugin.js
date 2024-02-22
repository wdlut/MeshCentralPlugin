/** 
* @description MeshCentral Plugin
* @author JKru
* @copyright 
* @license 
*/

"use strict";

module.exports.wdplugin = function (parent) {
    var obj = {};
    obj.parent = parent;
    obj.meshServer = parent.parent;
    obj.debug = obj.meshServer.debug;
    obj.onlineNodes = [];
    
    obj.server_startup = function() {
    };
    
    obj.hook_processAgentData = function() {
    };
       
    obj.hook_userLoggedIn = function(user) {
        obj.rcookie = parent.parent.encodeCookie({ userid: user._id, domainid: user.domain }, obj.meshServer.loginCookieEncryptionKey);
        obj.debug('PLUGIN', 'wdplugin', 'User logged in... Processing');
        obj.onlineNodes = Object.keys(obj.meshServer.webserver.wsagents);
    };
    
    obj.hook_agentCoreIsStable = function(myparent, gp) { // check for remaps when an agent logs in
                    var onlineUsers = Object.keys(obj.meshServer.webserver.wssessions);
                    obj.startRoute(myparent.dbNodeKey);
                    
    };
    
    obj.startRoute = function(comp) {
        const command = {
            action: 'plugin',
            plugin: 'wdplugin',
            pluginaction: 'loglevel',
            loglevel: '4'
        };
        //obj.debug('PLUGIN', 'RoutePlus', 'Mapping route to ', map.toNode);
        try { 
            obj.debug('PLUGIN', 'wdplugi', 'Starting route  to ' + comp);
            obj.meshServer.webserver.wsagents[comp].send(JSON.stringify(command)); 
        } catch (e) { 
            obj.debug('PLUGIN', 'wdplugin', 'Could not send map to ' + comp); 
        }
    };
    
    obj.uiCustomEvent = function(command, parent) {
        console.log( "uiCustomEvent. Element: "+command.element+" User: "+
        command.userid+ " Devices: "+ command.src.selectedDevices.length );
        switch(command.element) {
            case 'sharedatei':
                createShareDatei( command );
                //displayNotificationMessage("Datei erzeugt", null, null, null, 14);
                sendEmailIfPossible( command, obj.meshServer );
                break;
            default:
                console.log("Element "+command.element+ " nicht unterstuetzt.");
        }            
    };  
    return obj;
}

function createShareDatei(command) {
    if ((command.src != null) && (Array.isArray(command.src.selectedDevices))) {
 
        for (var i=0; i<command.src.selectedDevices.length; ++i){
            const nodeId = command.src.selectedDevices[i].substr(6); // Entferne "[node//]563..."
            console.log( "NodeId: " + nodeId );
            const fabrikNr="23-123F";
            const adresse="Kai Mustermann;Winkeweg2;22334 Ewkikenberg;Germany";
            const email=command.values.email.trim();
            const zusatzInfos=command.values.zusatzinfos;
            const gueltigkeitTage=ermitteleGueltigkeit(command.values.gueltigkeit);
            const shellCommand="~/MeshCentralPlugin/DeviceSharing/createDeviceSharing.sh"
            execShellCommand(`${shellCommand} '${nodeId}' '${fabrikNr}' '${adresse}' '${email}' '${zusatzInfos}' ${gueltigkeitTage}`);
        }
    }
}

function ermitteleGueltigkeit(gueltigkeitNr) {
    let retVal=0;
    switch( gueltigkeitNr ) {
      case '1': return( "365" ); //ein Jahr
      case '2': return(  "31" ); //einen Monat
      case '3': return(   "7" ); //eine Woche
      case '4': return(   "1" ); //einen Tag
      case '5': return(   "0" ); //unendlich
      default:  return( "0");
  }
}

function execShellCommand( command )
{
    const { exec } = require("child_process");
    exec( command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        return;
    });
}
 
function sendEmailIfPossible(command, meshServer)
{
    const email=command.values.email.trim();
    const msg="Diese Mail enthaelt die Zugangsdaten zu Ihrem Remote-Zugang."
    const file=__dirname+"/WEDA_RemoteControl*";

    if( email != "" && (meshServer.mailserver != null))
    {
        const attachmentArry = [ { path: file } ];
        meshServer.mailserver.sendMail(email, "Remote", msg, null, attachmentArry);

    }
}

