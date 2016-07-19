
/**
 * @lends Bridge.Utils
 */
var utils = {

    now: (+new Date()),

    //初始化，做环境嗅探，系统判断，私有函数，不继承
    _init: function(){
        this.device = this.isIos()?'ios': (this.isAndroid()?'android':'other');
        if(this.isBaiduMap()) {
            this.client = 'map';
        }
        else if(this.isNuomi()) {
            this.client = 'nuomi';
        }
        else if(this.isBaiduTravel()) {
            this.client = 'lv';
        }
        else if(this.isWechat()) {
            this.client = 'wechat';
        }
        else if(this.isBdbox()) {
            this.client = 'bdbox';
        }
        else {
            this.client = 'webapp';
        }
    },

    /**
     * @function isBaiduTravel
     * @memberOf Bridge.Utils
     * @description 判断是百度旅游客户端
     * @returns {Boolean} 旅游客户端：true   非旅游客户端：false 
     *
     */
    isBaiduTravel: function(){
        return /baidutravel/i.test(navigator.userAgent);
    },

    /**
     * @function isBaiduMap
     * @memberOf Bridge.Utils
     * @description 判断是百度地图客户端
     * @returns {Boolean} 地图客户端：true   非地图客户端：false 
     *
     */
    isBaiduMap: function(){
        return /baidumap/i.test(navigator.userAgent);
    },

    /**
     * @function isNuomi
     * @memberOf Bridge.Utils
     * @description 判断是否是糯米客户端
     * @returns {Boolean} 糯米客户端：true   非糯米客户端：false 
     *
     */
    isNuomi: function(){
        return /Nuomi/i.test(navigator.userAgent);
    },

    /**
     * @function isWechat
     * @memberOf Bridge.Utils
     * @description 判断是否是微信客户端
     * @returns {Boolean} 微信客户端：true   非微信客户端：false 
     *
     */
    isWechat: function() {
        return /micromessenger/i.test(navigator.userAgent);
    },

    /**
     * @function isBdbox
     * @memberOf Bridge.Utils
     * @description 判断是否手机百度客户端
     * @returns {Boolean} 手百客户端：true   非手百客户端：false 
     *
     */
    isBdbox: function() {
        return /baiduboxapp\//i.test(navigator.userAgent);
    },

    /**
     * @function isIos
     * @memberOf Bridge.Utils
     * @description 当前系统是否为ios
     * @returns {Boolean}  ios：true   非ios：false 
     *
     */
    isIos: function(){
        return !!window.navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    },

    /**
     * @function isAndroid
     * @memberOf Bridge.Utils
     * @description 当前系统是否为android
     * @returns {Boolean}  Android：true   非Android：false 
     *
     */
    isAndroid: function(){
        return window.navigator.userAgent.indexOf('Android') > -1 || window.navigator.userAgent.indexOf('Adr') > -1;
    },

    /**
     * @function isString
     * @memberOf Bridge.Utils
     * @description  判断是否字符串
     * @returns {Boolean} 
     *
     */
    isString: function(it) {
        var ostring = Object.prototype.toString;
        return ostring.call(it) === '[object String]';
    },

    /**
     * @function getRandomKey
     * @memberOf Bridge.Utils
     * @description  获取唯一id，用于一些随机数
     * @return {Number} id 随机数
     * @example
     * var jsonpFnName = '_lv_' + Bridge.Utils.getRandomKey();
     */
    getRandomKey: function() {
        var self = this;
        return ((self.now++) + '').slice(-3);
    },

    /**
     * @function appendParam
     * @memberOf Bridge.Utils
     * @description  向url添加参数
     * @returns {String}  url
     * @example
     * loginUrl = Bridge.Utils.appendParam(loginUrl, {"from": "aaa"});
     */
    appendParam: function(url, param){
        var self = this;
        if (self.isNull(param)) {
            return url;
        }
        if (self.objectType(param) == "Object") {
            param = self.stringifyObject(param);
        }
        if (!url) {
            url = "";
        }
        if (self.endWith(url, "?")) {
            url += param;
        } else if (self.endWith(url, "&")) {
            if (url.indexOf("?") >= 0) {
                url += param;
            } else {
                url += "?" + param;
            }
        } else {
            if (url.indexOf("?") >= 0) {
                url += "&" + param;
            } else {
                url += "?" + param;
            }
        }
        return url;
    },

    /**
     * @function objectType
     * @memberOf Bridge.Utils
     * @description  获取一个object的真实类型，如function(){}就是Function、{}是Object
     * @returns {String}  type
     * @example
     *  var aFunc = function() {};
     *  console.log(Bridge.Utils.objectType(aFunc));
     *  //输出字符串 'Function' 
     */
    objectType: (function() {
        var objectTypeReg = /^\[object (.*)\]$/;
        return function(obj) {
            if (typeof obj == "object" || typeof obj == "function") {
                return Object.prototype.toString.call(obj).match(objectTypeReg)[1];
            } else {
                return undefined;
            }
        }
    })(),

    endWith:function(str, endStr) {
        if (!str || !endStr || str.length == 0 || (endStr.length > str.length))
            return false;
        if (str.substr(str.length - endStr.length) == endStr)
            return true;
        else
            return false;
    },

    stringifyObject:function(obj) {
        var self = this;
        if (self.objectType(obj) !== "Object") {
            if (self.isBlank(obj) || (typeof obj !== "string")) {
                return "";
            }
            return obj;
        }
        var r = "";
        self.hasOwn(obj, function(key, value) {
            r += "&" + key + "=" + encodeURIComponent(value);
        });
        return r.substr(1);
    },

    /**
     *遍历对象的所有自有属性，执行回调函数fn(key,value)
     */
    /**
     * @function hasOwn
     * @memberOf Bridge.Utils
     * @description  遍历对象的所有自有属性，执行回调函数fn(key,value)
     * @params {Object} obj 传入需要遍历的对象
     * @params {Function} func  回调函数
     * @example
     *  Bridge.Utils.hasOwn(obj, function(key, value) {
     *      r += "&" + key + "=" + encodeURIComponent(value);
     *  });
     */
    hasOwn: function(obj, fn) {
        var k, v;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                v = obj[k];
                fn && (fn.call(window, k, v));
            }
        }
    },

    /**
     * @function isNull
     * @memberOf Bridge.Utils
     * @description  是否为NULL
     * @returns {Boolean}  
     *
     */
    isNull:function(o) {
        return (!o && (o !== false) && (o !== 0));
    },

    /**
     * @function getRequestParams
     * @memberOf Bridge.Utils
     * @description  获取url参数
     * @params {String} uri   传入url
     * @returns {Object}  返回参数，若无参数返回空数组
     *
     */
    getRequestParams: function(uri){
        var search = location.search.substring(1);
        search = uri || search;
        return search ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value) {
            return key === "" ? value : decodeURIComponent(value);
        }) : {};
    },

    /**
     * @function isPlainObject
     * @memberOf Bridge.Utils
     * @description  是否是纯object对象
     * @param  {Object}  obj 要判断的对象
     * @returns {Boolean}
     */
    isPlainObject: function(obj) {
        return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    
};

utils._init();

module.exports = utils;

