/**
 * 旅游容器内的相关js bridge
 * @author yanbin01@baidu.com
 */

/**
 * @class
 * @ignore
 */
var bridge = {

    /**
     * 打开登录界面
     */
    toLogin: function(){
        window.location.href = "lv://Panel?type=login";
    },

    /**
     * 调用分享组件
     * @param params: 参数对象，包括分享标题、内容、图片、链接等信息
     */
    share: function(params){
        window.shareData_webview = {
	        bigPicUrl: params.bigimgUrl || params.imgUrl, //weibo
	        thumbPicUrl: params.imgUrl, //weichat
	        title: params.title || '',
	        content: params.content || '',
	        webpageUrl: params.url || window.location.href,
	        type: 2
	    };
	    window.shareIos = function() {
	        return JSON.stringify(shareData_webview);
	    }

	    if (window.delegate) {
	        delegate.setShareValue(shareData_webview.bigPicUrl, shareData_webview.thumbPicUrl, shareData_webview.title, shareData_webview.content, shareData_webview.webpageUrl, shareData_webview.type);
	    }
	    location.href = 'lv://Panel?type=send_to_friend';
    }

};

module.exports = bridge;


