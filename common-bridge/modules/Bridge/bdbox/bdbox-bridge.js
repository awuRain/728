/**
 * 手机百度客户端内的相关js bridge
 * @author yanbin01@baidu.com zoujing@baidu.com
 */

/**
 * @class
 * @ignore
 */
var $ = require('zepto');


/**
 * @class
 * @ignore
 */
var bridge =  {

	/**
     * 获取版本号
     * @return {String} version 返回手机百度的版本号
     */
	getVersion: function() {
		var back = 0;
	    if (window.baiduboxapp_version) {
	        back = window.baiduboxapp_version;
	    } else {
	        var str = navigator.userAgent;
	        var a;

	        if (a = /([\d+.]+)_(?:diordna|enohpi)_/.exec(str)) {
	            a = a[1].split('.');
	            back = a.reverse().join('.');
	        } else if (a = /baiduboxapp\/([\d+.]+)/.exec(str)) {
	            back = a[1];
	        }
	    }
	    return back;
	},

	/**
     * 版本号对比
      * @param  {String} version1 第一个版本号
 	  * @param  {String} version2 第二个版本号
 	  * @return {Nubmer} num  version1==version2返回0；version1>version2返回1；小于返回-1
     */
	version_compare: function(version1, version2) {
		version2 += '';
	    version1 += '';

	    var a = version1.split('.'),
	        b = version2.split('.'),
	        i = 0,
	        len = Math.max(a.length, b.length);

	    for (; i < len; i++) {
	        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
	            return 1;
	        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
	            return -1;
	        }
	    }
	    return 0;
	},

	iosInvoke: function(action, params, callback) {
		if (!action) {
	        return;
	    }

	    var url = [];
	    if ($.isFunction(params)) {
	        callback = params;
	    } else {
	        for (var i in params) {
	            url.push(i + '=' + params[i]);
	        }
	    }
	    if ($.isFunction(callback)) {
	        var funcName = '_bdbox_js_' + $.getId();
	        window[funcName] = function() {
	            callback.apply(window, ([]).slice.call(arguments, 0));
	            /*delete window[funcName];*/
	        };
	        url.push('func=' + funcName);
	    } else {
	        if (callback) {
	            url.push('func=' + callback);
	        }
	    }
	    url = 'baiduboxapp://' + action + '?' + url.join('&');
	    var id = '_bdbox_ios_jsbridge';
	    var $node = document.getElementById(id);
	    if ($node) {
	        $node.src = url;
	    } else {
	        $node = document.createElement('iframe');
	        $node.style.display = 'none';
	        $node.id = id;
	        $node.src = url;
	        (document.body || document.getElementsByTagName('body')[0]).appendChild($node);
	    }

	},

	androidInvoker: function(name, func, args) {
		var self = this;

	    if (args && !$.isArray(args)) {
	        args = Array.prototype.slice.call(arguments, 0).slice(2);
	    }
	    //如果存在就执行，如果不存在就通过版本号来判断
	    if (window[name] && window[name][func]) {
	        var result = window[name][func].apply(window[name], args);
	        //直接调用
	        return {
	            error: 0,
	            result: result,
	            __from: 'js' //打个标记
	        };
	    }
	    var version = self.getVersion();
	    if (self.version_compare(version, 4.8) >= 0) {
	        //调用方法拿4.8版本来判断
	        //prompt调用一个不存在的接口，也不会报错，只是调用无效
	        //但有错误值
	        var back = self.execCaller(name, func, args);

	        back = back ? JSON.parse(back) : {};
	        back.__from = 'app';
	        return back;
	    } else if (version === '4.7.1' || version == '4.7') {
	        //需要给4.7加个特殊标记
	        //对于4.8出现的接口或者不存在的接口，在4.7内调用
	        //会进入下面的逻辑，但是有风险！！！！！
	        //4.7~4.7.1对于不存在的接口，使用prompt调用会出现假死状态
	        //无法解决，因为无解……
	        //只能在使用4.8之后的js接口，在invokeApp之前提前做判断
	        //例如：bd_searchbox_interface.sendLog方法是4.8引入的
	        //在使用4.7中使用invokeApp调用，会走到的逻辑，然后假死！！！切记！！！！
	        var rs = execCaller(name, func, args);

	        return {
	            error: 0,
	            result: rs,
	            __from: 'app4.7'
	        };
	    }
	    return {
	        error: 200
	    };
	},

	execCaller: function(nameSpace, funcName, funcArgs) {
		var self = this;

	    if (!self.isBdbox) {
	        return {
	            error: 201
	        };
	    } else if (!self.isAndroid) {
	        return {
	            error: 202
	        };
	    }
	    //保证要有[]
	    var caller = {
	        obj: nameSpace,
	        func: funcName,
	        args: funcArgs ? funcArgs : []
	    };
	    try {
	        return window.prompt('BdboxApp:' + JSON.stringify(caller));
	    } catch (e) {
	        return {
	            error: 201
	        };
	    }
	},

	handleCallback: function (cb) {
		var self = this;
	    cb = cb || 'console.log';
	    if ($.isFunction(cb)) {
	        var cbname = '_shareCB_' + self.getRandomKey();
	        window[cbname] = cb;
	        cb = cbname;
	    }
	    return cb;
	},

	_setShareOpt: function(params) {
		var defalutOpt = {
	            'mediaType': 'all',
	            'title': document.title,
	            'content': document.title,
	            'linkUrl': location.href,
	            'imageUrl': '',
	            'iconUrl': '',
	            'source': 'lvyou',
	            'type': 'url'
	        };
	    var _opts = $.extend(defalutOpt, params);

		//字段名字merge
	    if(!!_opts.imgUrl) {
	    	_opts.imageUrl = _opts.imgUrl;
	    	_opts.iconUrl = _opts.imgUrl;
	    	delete _opts.imgUrl;
	    }
	    if(!!_opts.url) {
	    	_opts.linkUrl = _opts.url;
	    	delete _opts.url;
	    }
	    
	    return _opts;
	},

	/**
     * 设置手百端里的分享功能
     * @param optionsArr
     */
    initShare: function(params){
    	var self = this;
        var sucName = self.handleCallback(params.success),
	        failName = self.handleCallback(params.cancel);
	    delete params.success;
	    delete params.cancel;

	    var _opts = self._setShareOpt(params);

	    //native和顶部[...]分享配置
	    var BoxShareData = {
	        //成功回调函数名，经过测试and6.5以上微信分享success可用，ios可用
	        successcallback: sucName,
	        //失败回调函数名，android6.5及其以下分享fail均不可用
	        errorcallback: failName,
	        options: _opts
	    };
	    if ($.isAndroid && version_compare(version, '6.5') < 0) {
	        //android有了imageUrl就是图片分享，但是去掉，微博就是截图分享，orz
	        delete BoxShareData.options.imageUrl;
	    }

	    window.BoxShareData = BoxShareData;
    },

    /**
     * 调用分享组件
     * @param params: 参数对象，包括分享标题、内容、图片、链接等信息
     */
    share: function(params, success, error){
    	var self = this;
        var version = self.getVersion();

        var successcallback = self.handleCallback(success),
	        errorcallback = self.handleCallback(error);

	    params = self._setShareOpt(params);

	    if(self.version_compare(version, '5.3.5') >= 0) {

	    	if(self.isIos()) {
	    		params.imageUrl = encodeURIComponent(params.imageUrl);
	    		params.linkUrl = encodeURIComponent(params.linkUrl);
	    		opt = JSON.stringify(params);
	            self.iosInvoke('callShare', {
	                'params': encodeURIComponent(opt),
	                'successcallback': successcallback,
	                'errorcallback': errorcallback
	            });
	    	}else {
	            if (self.version_compare(version, '6.5') < 0) {
	                //android有了imageUrl就是图片分享，但是去掉，微博就是截图分享，orz
	                delete params.imageUrl;
	            }
	            self.androidInvoker('Bdbox_android_utils', 'callShare', [JSON.stringify(params), successcallback, errorcallback]);
	        }
	    }

    },

    /**
     * toast弱提示
     */
    toast: function(str){
    	var self = this;

    	if (self.isIos()) {
	        if (self.version_compare(self.getVersion(), '6.0') < 0){
	        	alert(str);
	            return;
	        }

	        self.iosInvoke("utils",{
	            "action":"toast",
	            "string":str,
	            "minver":"6.0.0.0"
	        });

	    }else{
	        if (self.version_compare(self.getVersion(), '4.6') < 0){
	        	alert(str);
	            return;
	        }

	        self.androidInvoker('Bdbox_android_utils','toast',[str]);
	    }
    },

    /**
     * 打开登录界面
     * @param
     * @param {Obj} param.href 登录成功后跳转url，默认为当前url
     */
    toLogin: function(param){
    	var self = this;
    	param = param || {};

        var defalutOpt = {
	            callback: '',
	            url: location.href,
	            tpl: '',
	            login_type: '',
	            third_login: '0' /*第三方登录6.5新增，支持1，不支持0*/
	        },
	        attr;

	    for (attr in defalutOpt) {
	        if (!param.hasOwnProperty(attr)) {
	            param[attr] = defalutOpt[attr];
	        }
	    }

	    /*5.5版本支持js调起native登录*/
	    if (self.version_compare(self.getVersion(), '5.5') >= 0) {

	        if (self.isIos()) {
	            param.func = param.callback;
	            delete param.callback;
	            param = JSON.stringify(param);
	            self.iosInvoke("account", {
	                "action": "logindialog",
	                "params": encodeURIComponent(param),
	                "minver": "5.5.0.0"
	            });

	        } else {
	            self.androidInvoker('Bdbox_android_account', 'loginDialog', [JSON.stringify(param), param.callback]);
	        }

	        /*5.5以下版本跳转至baidu passport web页登录 不支持回调*/
	        /*添加支持短信登录*/
	    } else {
	        var passurl = 'http://wappass.baidu.com/?adapter=1&regLink=1';
	        if ('sms' === param.login_type) {
	            passurl += '&sms=1';
	        }
	        if (param.subpro) {
	            passurl += '&subpro=' + param.subpro;
	        }
	        if(param.tpl != ""){
	            passurl += '&tpl=' + param.tpl;
	        }
	        window.location.href = passurl + '&u=' + encodeURIComponent(param.url);
	    }
    }

};

module.exports = bridge;