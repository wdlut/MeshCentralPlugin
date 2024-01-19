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
    obj.VIEWS = __dirname + '/views/';
    obj.exports = [
      'onWebUIStartupEnd',
      'openSettings',
      'goPageStart',
      'mapUpdate',
      'resizeContent',
      'onDeviceRefreshEnd',
    ];
    
    obj.server_startup = function() {
    };
    
    obj.onWebUIStartupEnd = function() {
        var ld = document.querySelectorAll('#p10html > p.mL')[0];
        var as = Q('plugin_WdPluginStart');
        if (as) as.parentNode.removeChild(as);
        var x = '<input type="button" value="WEDA" title="Weda-Aktion" onclick="showShareDevice()">';
        ld.innerHTML += x;
        //pluginHandler.routeplus.updateUserRdpLinks();
    };
       
    obj.hook_userLoggedIn = function(user) {
        var myComp = null;
        const rcookie = parent.parent.encodeCookie({ userid: user._id, domainid: user.domain }, obj.meshServer.loginCookieEncryptionKey);
        obj.debug('PLUGIN', 'wdplugin', 'User logged in... Processing');
        obj.onlineNodes = Object.keys(obj.meshServer.webserver.wsagents);
        //console.log('s1', obj.meshServer.webserver.wssessions);
        //console.log('s2', Object.keys(obj.meshServer.webserver.wssessions2));
    };
    
    obj.hook_agentCoreIsStable = function(myparent, gp) { // check for remaps when an agent logs in
    };
    
    obj.openSettings = function() {
        let spage = `<div id="routePlusSettings" style="height:100%;">
            <div><div class="backButton" tabindex=0 onclick="go(2);" title="Back" onkeypress="if (event.key == 'Enter') go(2);"><div class="backButtonEx"></div></div></div>
            <h1>My Server Plugins - <span>RoutePlus</span></h1>
            <iframe id="routePlusiframe" src="/pluginadmin.ashx?pin=routeplus" frameBorder=0 style="width:100%;height:calc(100vh - 245px);max-height:calc(100vh - 245px)"></iframe>
        </div>`;
        QV('p2', 0);
        xxcurrentView = null;
        document.getElementById('column_l').insertAdjacentHTML( 'beforeend', spage );
    };
    
    obj.goPageStart = function(pageNum, event) {
        let r = Q('routePlusSettings');
        if (r) r.parentNode.removeChild(r);
    };
    
    obj.resizeContent = function() {
        var iFrame = document.getElementById('routePlusiframe');
        var newHeight = 800;
        var sHeight = iFrame.contentWindow.document.body.scrollHeight;
        if (sHeight > newHeight) newHeight = sHeight;
        iFrame.style.height = newHeight + 'px';
    };
    
    obj.handleAdminReq = function(req, res, user) {
    };
    
    obj.removeMapFromComp = function(id) {
    };
    obj.endRoute = function (mapId) {
    };
    obj.sendUpdateToUser = function(user, msg) {
        if (obj.meshServer.webserver.wssessions[user] != null) {
            obj.meshServer.webserver.wssessions[user].forEach(function(sess) {
                obj.meshServer.webserver.wssessions2[sess.sessionId].send(JSON.stringify(msg));
            });
        }
    };
    obj.serveraction = function(command, myparent, grandparent) {
    };
    
    return obj;
}