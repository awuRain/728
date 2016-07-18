var $ = require('zepto');
var Bridge = require('Bridge');

var pblog = {
    init: function() {
        this.logUrl = "//lvyou.baidu.com/click.gif";

        var hrefArr = location.pathname.replace(/\/$/, '').split("/");
        var len = hrefArr.length;
        hrefArr[len - 1] = hrefArr[len - 1].replace(/\..*$/, '');
        var pageId = hrefArr.splice(3).join('_');
        var fr = location.search.match(/\?.*fr\=([^&]*)/);
        var from = location.search.match(/\?.*from\=([^&]*)/);


        var webview = location.search.match(/\?.*webview\=([^&]*)/);
        var isNative = 0;
        if (webview && webview[1] && webview[1] == '1') {
            isNative = 1;
        }
        this.defaultParams = {
            "product_id": 'lvyou',
            "da_trd": 'event', //模块名
            "lv_src": pageId, //页面名
            "da_abtest": '0', //是否为小流量
            "da_act": "",
            "is_native": isNative,
            "referrer": document.referrer,
            "da_thirdpar": (from && from[1]) || (fr && fr[1]),
            "client_type": 3,
            'parameter': ''
        };
        var mylocation = (window.location.search).replace('?', '');
        this.locationArr = mylocation.split('&');


        this.pvLog();
        this.bindEvent();
    },
    clickLog: function(config, link) {
        var me = this;
        if (typeof(config) == 'string') {
            // var src = me.defaultParams.da_src;
            var block = config;
            config = {
                lv_pos: block
            }
        }
        var parameter = '';
        $.each(me.locationArr, function(index, item) {
            var itemArr = item.split('=');
            var urlField = itemArr[0];
            var urlValue = itemArr[1];
            if (index > 0) {
                parameter = parameter + '.' + urlField + '=' + urlValue;
            } else {
                parameter = parameter + urlField + '=' + urlValue;
            }

            me.defaultParams[urlField] = urlValue
        });
        me.defaultParams['parameter'] = parameter;
        var params = $.extend({}, me.defaultParams, {
            "da_act": "click",
            "t": new Date().getTime()
        }, config);
        if (link) {
            me.imageReq(me.logUrl + '?' + $.param(params), link);
        } else {
            me.imageReq(me.logUrl + '?' + $.param(params));
        }

    },
    companionLog: function(config) {
        var me = this;
        var params = $.extend({}, {
            "product_id": "lvyou",
            "client_type": me.defaultParams.client_type,
            "accur_trd": "companion",
            "accur_thirdpar": me.defaultParams.da_thirdpar,
            "t": new Date().getTime()
        }, config);
        me.imageReq(me.logUrl + '?' + $.param(params));
    },
    showLog: function(config) {
        var me = this;
        if (typeof(config) == 'string') {
            // var src = me.defaultParams.da_src;
            var block = config;
            config = {
                lv_pos: block
            }
        }
        var parameter = '';
        $.each(me.locationArr, function(index, item) {
            var itemArr = item.split('=');
            var urlField = itemArr[0];
            var urlValue = itemArr[1];
            if (index > 0) {
                parameter = parameter + '.' + urlField + '=' + urlValue;
            } else {
                parameter = parameter + urlField + '=' + urlValue;
            }

            me.defaultParams[urlField] = urlValue
        });
        me.defaultParams['parameter'] = parameter;
        var params = $.extend({}, me.defaultParams, {
            "da_act": "show",
            "t": new Date().getTime()
        }, config);

        Bridge.Data.getData(function(res) {
            var fr = res.fr;
            params.da_thirdpar = fr;
            me.imageReq(me.logUrl + '?' + $.param(params));
        });
    },
    _clickHandle: function(target) {
        var me = this;
        var deep = 3;
        var Xpath = [];
        var isValid = 0;

        var findFun = function() {
            if (deep > 0) {
                if (target.attr('pb-id')) {
                    isValid = 1;
                } else {
                    target = target.parent();
                    deep--;
                }

                if (isValid) {
                    var block = target.attr('pb-id');
                    var attrs = {
                        lv_src: block
                    };
                    $.each(target[0].attributes, function(i, item) {
                        if (item.name.match('pb-attr')) {
                            attrs[item.name.replace('pb-attr-', '')] = item.value;
                        }
                    });

                    me.clickLog(attrs);
                    return;
                }
                findFun();
            }
        };
        findFun();

        //区域点击
        var areaParent = target.parents('[pb-area-id]');
        if (areaParent && areaParent.length > 0) {
            var areablock = $(areaParent[0]).attr('pb-area-id');
            me.clickLog(areablock);
        }
    },
    bindEvent: function() {
        var me = this;
        $(document).on('mousedown', function(e) {
            me._clickHandle($(e.target));
        });

        $('[pb-show-id]').each(function(i, item) {
            var showblock = $(item).attr('pb-show-id');
            if (showblock && $(item).size() > 0) {
                var attrs = {
                    da_src: me.defaultParams.da_src + "." + showblock + 'Bk',
                    lv_pos: showblock
                };
                $.each(item.attributes, function(i, it) {
                    if (it.name.match('pb-attr')) {
                        attrs[it.name.replace('pb-attr-', '')] = it.value;
                    }
                });
                me.showLog(attrs);
            }
        });
    },
    imageReq: function(url, link, callback) {
        //图片请求函数，用于统计
        var n = "pblog_" + (new Date()).getTime();
        var c = window[n] = new Image(); //将image对象赋给全局变量，防止被当做垃圾回收，造成请求失败。
        if (link) {
            c.onload = c.onerror = function() {
                window[n] = null; //垃圾回收
                location.href = link;
            };
        } else {
            c.onload = c.onerror = function() {
                window[n] = null; //垃圾回收
                if (callback) {
                    callback();
                }
            };
        }

        c.src = url;
        c = null; //垃圾回收
    },
    pvLog: function(config) {
        var me = this;
        var parameter = '';
        $.each(me.locationArr, function(index, item) {
            var itemArr = item.split('=');
            var urlField = itemArr[0];
            var urlValue = itemArr[1];
            if (index > 0) {
                parameter = parameter + '.' + urlField + '=' + urlValue;
            } else {
                parameter = parameter + urlField + '=' + urlValue;
            }

            me.defaultParams[urlField] = urlValue
        });
        me.defaultParams['parameter'] = parameter;
        var params = $.extend({}, me.defaultParams, {
            "da_act": "pv",
            "lbs_lvyou_pv": 3,
            "t": new Date().getTime()
        }, config);
        Bridge.Data.getData(function(res) {
            var fr = res.fr;
            params.da_thirdpar = fr;
            me.imageReq(me.logUrl + '?' + $.param(params));
        });
    },
    lazyClick: function(config, link) {
        var me = this;
        me.clickLog(config, link);
    }
};

pblog.init();
module.exports = pblog;
