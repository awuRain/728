define.cmd = 'cmd';

var ready = function(callback){
    //糯米
    if(/nuomi/i.test(navigator.userAgent)) {
        if (callback && typeof callback == 'function') {
            if (window.BNJS && typeof window.BNJS == 'object' && BNJS._isAllReady) {
                callback();
            } else {
                document.addEventListener('BNJSReady', function () {
                    callback();
                }, false)
            }
        }
    }
    //微信
    else if(/micromessenger/i.test(navigator.userAgent)) {
        if(window.wxReady) {
            callback && callback();
            return;
        }
        //如果是微信容器，加载微信的jssdk
        require.async(['/lib/jweixin.js','zepto'], function(wx, $){
            var config = {};
            var url = 'http://lvyou.baidu.com/wechat/ajax/getwechatsignpackage';
            //初始化微信权限验证配置
            $.ajax({
                'url': url,
                'method': "get",
                'dataType': 'jsonp',
                'data': {
                    url: location.href
                },
                'success': function (res) {
                    config = res.data;
                    wx.config({
                        debug: false,
                        appId: config.appId,
                        timestamp: config.timestamp,
                        nonceStr: config.nonceStr,
                        signature: config.signature,
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'chooseImage',
                            'previewImage',
                            'uploadImage',
                            'previewImage'
                        ]
                    });
                }
            });

            wx.error(function (res) {
                console.log(res);
            });

            wx.ready(function(){
                window.wxReady = true;
                callback && callback();
            });
        });
    }
    //other
    else {
        if(window.DOMContentReady) {
            callback && callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", function(){
            window.DOMContentReady = true;
            callback && callback();
        }, false);
    }
}