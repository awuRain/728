
/**
 * @namespace
 * @ignore
 */
var $ = require('zepto');

var utils = require('./utils/utils.js');
var map = require('./map/map-bridge.js');
var nuomi = require('./nuomi/nuomi-bridge.js');
var wechat = require('./wechat/wechat-bridge.js');
var lv = require('./lv/lv-bridge.js');
var webapp = require('./webapp/webapp.js');
var bdbox = require('./bdbox/bdbox-bridge.js');
var Notification = require('ui/notification/index');


/**
 * @namespace Bridge
 * @desc  common-bridge是一个小而美的Bridge类库，为H5组件和NA客户端之间通信的js sdk，支持 **糯米**、**地图**、**微信**、**旅游**、**手百**等容器的环境，向业务代码提供统一的代码，工程师不必关注底层协议。在webapp环境中提供相应的降级处理。
 * > 具体效果请戳 [common-bridge测试页面](http://cp01-qa-lvyou-001.cp01.baidu.com:8080/static/commonbridge/page/bridge/index.html) 查看
 * @author yanbin01@baidu.com zoujing@baidu.com
 * @date 2016-4-10
 */
function Bridge(){
    this.init();
}


$.extend(Bridge.prototype, {

    // 版本号
    version: '0.0.1',

    /** 
     * @memberOf Bridge
     * @alias device
     * ios/android/other
     * @type {String}  
     */
    device: "",

    /**
     * @memberOf Bridge
     * @alias client
     * map/nuomi/lvyou/wechat/webapp
     * @type {String}  
     */
    client: "",

    //所有异步接口可以取该前缀，调试的时候统一修改
    host: "http://lvyou.baidu.com/",

    // 页面路由，页面名称的配置参数
    pageConfig: {
        "orderFill":{
            "nuomi":"http://lvyou.baidu.com/static/foreign/page/ticket/orderFill/orderFill.html?a=1",
            'map':'http://map.baidu.com/mobile/webapp/scope/orderFill/qt=order_input?a=1'
        },
        "poiDetail":{
            "map":"http://map.baidu.com/mobile/webapp/place/detail/foo=bar",
            'nuomi':'http://lvyou.baidu.com/static/foreign/page/ticket/nuoindex/index.html?a=1'
        },
        'poiList':{
            'nuomi':'http://lvyou.baidu.com/static/foreign/page/ticket/scenery_list/list.html?tag_id=0&from=webapp',
            'map':'http://map.baidu.com/mobile/webapp/search/search/foo=bar&qt=s&wd=%E6%99%AF%E7%82%B9'
        },
        'skuDetail':{
            'nuomi':'http://lvyou.baidu.com/static/foreign/page/ticket/detail/detail.html?a=1',
            'map':'http://map.baidu.com/mobile/webapp/scope/ticketDetail/qt=scope_getoneticket&src=qunar'
        }
    },

    init: function(){
        this.urlParams = this.getRequestParams();
    },


    /**
     * @function pushWindow
     * @memberOf Bridge
     * @description 页面跳转协议
     * @param  {Object} params   页面跳转传入参数 <br/>
     * params.nuomi   当打开webapp页需要参数，糯米app打开url协议 <br/>
     * params.nuomi-webapp  当打开webapp页需要参数，糯米webapp的url <br/>
     * params.map-ios  当打开webapp页需要参数，地图ios端打开url协议 <br/>
     * params.map-android   当打开webapp页需要参数，地图Android端打开url协议 <br/>
     * params.map-webapp   当打开webapp页需要参数，地图webapp的url <br/>
     * params.data   当打开webapp页需要参数，打开url携带参数，可省 <br/>
     * params.page   可指定打开`poi列表`，`poi详情`，`sku详情`，`订单填写页`，对应值分别为poiList，poiDetail，skuDetail，orderFill
     *
     * @example
     * //打开webapp url
     *  Bridge.pushWindow({
     *      "nuomi": 'bainuo://component?url=' + url.replace('?', '&'),
     *      "nuomi-webapp": webappUrl,
     *      "map-ios": 'baidumap://map/cost_share?a=1&url=' + url,
     *      "map-android": 'baidumap://map/cost_share?a=1&url=' + url,
     *      "map-webapp": webappUrl,
     *      data: $.extend({}, _params)
     *  });
     * 
     * //打开poi列表页
     * Bridge.pushWindow({
     *      page: 'poiList',
     *      data: {
     *          nuomi: $.extend({
     *              sid: _sid,
     *              tag_id: 0
     *          }, self.params),
     *          'nuomi-webapp': $.extend({
     *              sid: _sid
     *          }, self.params),
     *          'map-webapp': $.extend({
     *              c: _cityid
     *          }, self.params)
     *      }
     *  });
     *
     * //打开poi详情页
     * Bridge.pushWindow({
     *      page: 'poiDetail',
     *      data: {
     *          nuomi: $.extend({
     *              td_id: td_id
     *          }, _params),
     *          map: $.extend({
     *              'uid': uid
     *          }, _params),
     *          'nuomi-webapp': $.extend({
     *              td_id: td_id
     *          }, _params),
     *          'map-webapp': $.extend({
     *              uid: uid,
     *              qt: 'ninf',
     *              industry: 'scope'
     *          }, _params)
     *      }
     *  });
     *
     */
    pushWindow: function(params){
        var self = this;
        if(params.page) {
            self._pageGoTo(params);
        }
        else {
            if(location.host == 'map.baidu.com' || self.urlParams['na_from'] == 'map_scope') {
                location.href = params['map-webapp'];
            }
            else if(location.host == 'lvyou.baidu.com' || self.urlParams['na_from'] == 'nuomi')  {
                location.href = params['nuomi-webapp'];
            }
            else {
                location.href = params['nuomi-webapp'];
            }
        }
    },

    /**
     * @namespace
     * @desc 根据页面名称跳转
     * @ignore
     */
    _pageGoTo: function(params){
        var self = this;
        var url = '';
        if(location.host == 'lvyou.baidu.com' || self.urlParams['na_from'] == 'nuomi') {
            url = self.pageConfig[params.page]['nuomi'] + '&' + $.param(params.data['nuomi-webapp']);
        }
        else if(location.host == 'map.baidu.com'  || self.urlParams['na_from'] == 'map_scope')  {
            url = self.pageConfig[params.page]['map'] + '&' + $.param(params.data['map-webapp']);
        }
        else {
            url = self.pageConfig[params.page]['nuomi'] +  '&' + $.param(params.data['nuomi-webapp']);
        }
        location.href = url;
    },

    /**
     * @namespace Bridge.Loader
     */
    Loader: {
        /**
         * @function get
         * @memberOf Bridge.Loader
         * @description 对get异步请求的封装
         * @param  {Object} params   
         *
         * @example
         *  Bridge.Loader.get({
         *      url : url,
         *      data: data,
         *      success: function(data) {},
         *      error:function() {}
         *  });
         *
         */
        get: function(params){
            params.type = 'get';
            params.dataType = params.dataType || 'json';
            $.ajax(params);
        },

        /**
         * @function post
         * @memberOf Bridge.Loader
         * @description 对post异步请求的封装
         * @param  {Object} params   
         *
         * @example
         *  Bridge.Loader.post({
         *      url : url,
         *      data: data,
         *      success: function(data) {},
         *      error:function() {}
         *  });
         *
         */
        post: function(params){
            params.type = 'post';
            params.dataType = params.dataType || 'json';
            $.ajax(params);
        }
    },


    /**
     * @function setTitle
     * @memberOf Bridge
     * @description 设置页面的title
     * @param  {String} title   页面title
     *
     * @example
     *  Bridge.setTitle('页面title');
     *
     */
    setTitle: function(title){
        document.title = title;
    },


    /**
     * @function isLogin
     * @memberOf Bridge
     * @description 判断用户是否登录
     * @param  {Function} callback   判断是否登录的回调函数
     *
     * @example
     *  Bridge.isLogin(function(status){
     *      if(status = 1) {
     *          // 已登录
     *      } else {
     *          // 未登录
     *      }
     *  });
     *
     */
    isLogin: function(callback){
        var self = this;
        if(location.host == 'lvyou.baidu.com') {
            $.ajax({
                url:"http://lvyou.baidu.com/user/ajax/getuser?t=" + (new Date()).getTime(),
                type:'get',
                dataType:'json',
                success:function(res){
                    if(res.errno == 0){
                        self.login = res.data.user.is_login;
                        callback && callback(self.login);
                    }
                    else {
                        callback && callback(0);
                    }
                }
            });
        }else {
            $.ajax({
                url:"http://map.baidu.com/opn/service/checkuser?t=" + (new Date()).getTime(),
                type:'get',
                dataType:'jsonp',
                success:function(res){
                    if(res.errno == 0){
                        self.login = res.result.uid ? 1 : 0;
                        callback && callback(self.login);
                    }
                    else {
                        callback && callback(0);
                    }
                }
            });
        }
    },


    /**
     * @function toLogin
     * @memberOf Bridge
     * @description 跳转到登录页面进行登录
     *
     * @example
     *  Bridge.toLogin();
     *
     */
    toLogin: function(){
        var self = this;
        var loginUrl, param, data;

        loginUrl = "http://wappass.baidu.com/passport/?", data = {};
        param = {};
        data.tpl = param.tpl || "ma";
        data.authsite = 1;
        data.u = location.href;

        loginUrl = self.appendParam(loginUrl, data);
        location.href = loginUrl;
    },

    /**
     * @function getGeocoder
     * @memberOf Bridge
     * @description   获取当前经纬度信息
     * @param  {Function} callback   获取当前经纬度信息的回调函数
     *
     * @example
     *  Bridge.getGeocoder(function(res){
     *      JSON.stringify(res)
     *  });
     *
     */
    getGeocoder: function(callback){
        $.ajax({
            url: 'http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj',
            method: 'get',
            dataType: 'jsonp',
            success: function(res){
                callback && callback(res.content.point);
            },
            error: function(){

            }
        });
    },


    /**
     * @function getCityName
     * @memberOf Bridge
     * @description 获取当前城市名称
     * @param  {Function} callback   获取当前城市名称的回调函数
     *
     * @example
     *  Bridge.getCityName(function(sname){
     *      // sname已获取
     *  });
     *
     */
    getCityName: function(callback){
        $.ajax({
            url: 'http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj',
            method: 'get',
            dataType: 'jsonp',
            success: function(res){
                callback && callback(res.content.address_detail.city);
            },
            error: function(){
                callback && callback('北京市');
            }
        });
    },


    /**
     * @function getCity
     * @memberOf Bridge
     * @description  根据当前定位获取city信息
     * @param  {Function} callback   获取city信息的回调函数
     *
     * @example
     *  Bridge.getCity(function(data){
     *      // data 数据包含 province、city、cityId、cityCode
     *  });
     *
     */
    getCity: function(callback){
        var self = this;
        $.ajax({
            'url': 'http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj&callback=?',
            'dataType':'jsonp',
            success: function(data){
                if (data && data.status === 0 && data.content && data.content.address_detail) {
                    var data = {
                        cityId : data.content.address_detail.city_code,
                        city : data.content.address_detail.city,
                        province : data.content.address_detail.province
                    };
                    self._getCityCodeByCityId(data, callback);
                }
                else {
                    callback && callback({
                        province: null,
                        city: null,
                        cityId: null
                    });
                }
            },
            fail: function(){
                callback && callback({
                    province: null,
                    city: null,
                    cityId: null
                });
            }
        });
    },


    /**
     * @namespace
     * @desc 根据cityId获取到对应的cityCode,合并getcity方法中的data传给回调函数
     * @ignore
     */
    _getCityCodeByCityId: function(data, callback) {
        var self = this,
            citycode,
            cityid = data.cityId;
        $.ajax({
            url:'http://lvyou.baidu.com/business/ajax/ticket/Getpromotionscene?promotion_scene_type=map_scope&promotion_scene_key=' + cityid,
            type:'get',
            dataType:'jsonp',
            success: function(res){
                if(res.errno == 0) {
                    citycode = res.data.promotion_now.city_code;
                    var result = {
                        "province": data.province,
                        "city": data.city, 
                        "cityId": cityid,
                        "cityCode": citycode, 
                    };
                    callback && callback(result);
                }
            },
            fail: function() {
                callback && callback({
                    "province": data.province,
                    "city": data.city, 
                    "cityId": cityid,
                    "cityCode": null
                });
            }
        });
    },


    /**
     * @function getProvinceSid
     * @memberOf Bridge
     * @description 获取省份sid
     * @param  {Function} callback   获取省份sid的回调函数
     *
     * @example
     *  Bridge.getProvinceSid(function(sid){
     *      // sid已获取
     *  });
     *
     */
    getProvinceSid: function(callback){
        var self = this;
        self.getCity(function(data){
            if(data.cityId){
                $.ajax({
                    url: self.host + "/business/ajax/dailysale/getsidbycityid?map_city_id=" + data.cityId,
                    method: "get",
                    dataType:'jsonp',
                    success: function(res){
                        if(res.errno == 0) {
                            self.sid = res.data.sid;
                            callback && callback(self.sid);
                        }
                        else {
                            callback && callback(null);
                        }
                    },
                    fail: function(){
                        callback && callback(null);
                    }
                });
            }
            else {
                callback && callback(null);
            }
        });
    },

    /**
     * @function initShare
     * @memberOf Bridge
     * @description 设置端分享的分享参数
     * @param  {Object} params   需要传入参数 <br/>
     * params.title   分享title <br/>
     * params.content    分享内容 <br/>
     * params.imgUrl    分享图片 <br/>
     * params.url    分享url，可省，缺省时使用当前url <br/>
     * params.bigimgUrl    分享大图，用于微博分享，only手百需要，缺省时默认使用imgUrl的值  <br/>
     *
     * @example
     *  //开启分享功能
     *  Bridge.initShare({
     *      title: "分享",
     *      content: "分享测试",
     *      imgUrl: "",
     *      url: location.href,
     *      bigimgUrl: ""   //分享大图，用于微博分享，only手百需要，缺省时默认使用imgUrl的值  
     *  });     
     *
     */
    initShare: function(params){
        // 
    },


    /**
     * @function share
     * @memberOf Bridge
     * @description 调用端分享组件
     * @param  {Function} success   分享成功回调函数，可缺省
     * @param  {Function} error   分享成功回调函数，可缺省
     * @param  {Object} params   参数对象 <br/>
     * params.title   分享title <br/>
     * params.content    分享内容 <br/>
     * params.imgUrl    分享图片 <br/>
     * params.url    分享url，可缺省，缺省时使用当前url <br/>
     * params.bigimgUrl    分享大图，可缺省，用于微博分享，only手百需要，缺省时默认使用imgUrl的值  <br/>
     *
     * @example
     *  //开启分享功能
     *  Bridge.share({
     *      title: "分享",
     *      content: "分享测试",
     *      imgUrl: "",
     *      url: location.href,
     *      bigimgUrl: ""   //分享大图，用于微博分享，only手百需要，缺省时默认使用imgUrl的值  
     *  }, function(){
     *      alert('成功啦');
     *  }, function(){
     *      alert('失败啦');
     *  });     
     *
     */
    share: function(params, success, error){
        //
    },

    /**
     * @namespace Bridge.Data
     */
    Data: {
        /**
         * @function getParamsData
         * @memberOf Bridge.Data
         * @description 获取url参数
         * @param  {Function} callback   获取url参数回调函数
         *
         * @example
         *  Bridge.Data.getData(function(res) {
         *      //res为url参数对象
         *      delete res.uid;
         *  )};
         *
         */
        getParamsData: function(callback) {
            var parms = utils.getRequestParams();
            callback(parms);
        }
    },

    /**
     * @function toast
     * @memberOf Bridge
     * @description toast弱提示
     * @param  {String} str   toast提示字符串
     *
     * @example
     *  Bridge.toast('提示字符串');
     *
     */
    toast: function(str){
        Notification.simple(str);
    },

    /**
     * @function alert
     * @memberOf Bridge
     * @description alert强提示，弹窗需要手动关闭
     * @param  {Object} options   需要传入参数 <br/>
     * options.message   弹窗文案 <br/>
     * options.onConfirm    弹窗关闭按钮回调函数 <br/>
     *
     * @example
     *  Bridge.alert({
     *      "message": "确定吗？",
     *      "onConfirm": function() {}
     * });
     *
     */
    alert: function(options) {
        var notification = Notification.alert(options.message, function() {
            this.hide();
            options.onConfirm && options.onConfirm();
        });
        notification.show();
    }
});


/**
 * @namespace Bridge.Utils
 */
Bridge.Utils = function() {

};

$.extend(Bridge.prototype, utils);
$.extend(Bridge.Utils.prototype, utils);
eval('$.extend(Bridge.prototype, ' + Bridge.prototype.client + ');');



module.exports = new Bridge();