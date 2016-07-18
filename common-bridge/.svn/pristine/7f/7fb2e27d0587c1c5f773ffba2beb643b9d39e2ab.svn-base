/**
 * 糯米容器内的相关js bridge
 * @author yanbin01@baidu.com zoujing@baidu.com
 */

/**
 * @class
 * @ignore
 */
var bridge =  {

    /**
     * 页面路由，页面名称的配置参数
     */
    pageConfig: {
        "orderFill":{
            "nuomi":"bainuo://component?compid=lvyou&comppage=orderfill"
        },
        "poiDetail":{
            "nuomi":"bainuo://component?compid=lvyou&comppage=index"
        },
        'poiList':{
            'nuomi':'bainuo://component?compid=lvyou&comppage=scenerylist'
        },
        'skuDetail':{
            'nuomi':'bainuo://component?compid=lvyou&comppage=detail'
        }
    },

    /**
     * 调用分享组件
     * @param params: 参数对象，包括分享标题、内容、图片、链接等信息
     */
    share: function(params){
        params.onSuccess = params.callback || function(){
            BNJS.ui.toast.show('分享成功');
        };
        params.onFail = params.fallback || function(){
            BNJS.ui.toast.show('分享成功');
        };
        BNJS.ui.share(params);
    },

    /**
     * 打开糯米bar右上角的分享功能，设置分享功能
     * @param optionsArr
     */
    initShare: function(params){
        BNJS.ui.title.addActionButton({
            tag: '123',
            text: '分享',
            icon: 'share',
            callback: function(){
                /*点击回调分享功能*/
                params.onSuccess = params.callback || function(){
                    BNJS.ui.toast.show('分享成功');
                };
                params.onFail = params.fallback || function(){
                    BNJS.ui.toast.show('分享成功');
                };
                BNJS.ui.share(params);
            }
        });
    },

    /**
     * 新开一个页面，包括新开一个组件化线上页面或者新开一个组件业务页面
     * @param params: url打开页面链接 data需要传递到下一个页面的参数
     */
    pushWindow: function(params){
        var self = this;
        if(params.page) {
            self._pageGoTo(params);
        }
        else {
            BNJS.page.start(params.nuomi, params.data || {});
        }
    },

    /**
     * 提供页面名称直接跳转，供旅游项目内部使用
     * @param params
     * @private
     */
    _pageGoTo: function(params) {
        var self = this;
        if(self.pageConfig[params.page]) {
            BNJS.page.start(self.pageConfig[params.page]['nuomi'], params.data['nuomi'] || {});
        }
        return;
    },

    Data:{
        getParamsData:function(callback){
            BNJS.env.network(function(res){
                if(res.network == "non"){
                    BNJS.ui.showErrorPage();
                }else{
                    BNJS.page.getData(callback);
                }
            })

        }
    },


    /**
     * 拿到当前省份的sid
     */
    /*getProvinceSid: function(callback){
        var self = this;
        var city_code = BNJS.location.selectCityCode;
        self.Loader.get({
            url: 'http://lvyou.baidu.com/business/ajax/ticket/getsidbynuomi?city_code=' + city_code,
            success: function(res){
                callback && callback(res.data.sid);
            }
        })
    },*/


    /**
     * 根据定位拿到当前省份的sid
     * @param callback
     */
    getProvinceSid: function(callback){
        var self = this;
        this.getCity(function(data){
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
     * 以NA作为代理和服务器进行数据交互
     */
    Loader: {
        /**
         * 对get异步请求的封装
         */
        get: function(data){
            BNJS.http.get({
                url: data.url,
                params: data.data || {},
                onSuccess: data.success || function(){},
                onFail: data.fail || function(){},
            });
        },
        /**
         * 对post异步请求的封装
         */
        post: function(data){
            BNJS.http.post({
                url: data.url,
                params: data.data || {},
                onSuccess: data.success || function(){},
                onFail: data.fail || function(){},
            });
        }
    },

    /**
     * 打开登录界面
     * @param
     * @param  {function} success  登录成功回调函数
     * @param  {function} fail  登录失败回调函数
     */
    toLogin: function(params){
        var params = params || {};
        var callback = params.success || function(){};
        var fallback = params.fail || function(){};

        BNJS.account.login({
            onSuccess: function(){
                callback && callback();
            },
            onFail: function(res){
                fallback && fallback();
            }
        });
    },

    /**
     * 判断用户是否登录,BNJS的方法不好用，先注释掉了
     * @param callback
     */
    /*isLogin: function(callback){
        var login = BNJS.account.isLogin;
        callback && callback(login);
    },*/

    /**
     * 在糯米端获得客户端信息
     */
    getNativeInfo: function(callback){
        callback && callback({
            "bduid":BNJS.account.uid,
            "cuid":BNJS.env.cuid,
            "ov":BNJS.env.appVersion,
            "bduss":BNJS.account.bduss
        });
    },

    /**
     * 返回当前经纬度信息
     */
    getGeocoder: function(callback){
        callback && callback({
            'x':BNJS.location.latitude,
            'y':BNJS.location.longitude
        });
    },

    /**
     * 返回当前城市名称
     */
    getCityName: function(callback){
        callback && callback(BNJS.location.cityName);
    },

    /**
     * 设置页面的title
     * @param title
     */
    setTitle: function(title){
        BNJS.ui.title.setTitle(title);
    },

    /**
     * toast弱提示
     */
    toast: function(title){
        BNJS.ui.toast.show(title);
    },

    /**
     * alert强提示
     */
    alert: function(options){
        BNJS.ui.dialog.show(options)
    }

};

module.exports = bridge;