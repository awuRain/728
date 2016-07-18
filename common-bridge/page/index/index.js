var $ = require('zepto');
var Bridge = require('Bridge');

Bridge.getProvinceSid(function(sid){
    alert(sid);
});