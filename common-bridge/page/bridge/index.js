var $ = require('zepto');
var Bridge = require('Bridge');
screenLog.init();
console.log('hello world');
Bridge.setTitle('百度旅游common-bridge');

$('.J_Share').on('tap', function(){
    Bridge.initShare({
        title:"分享测试",
        content: "分享内容测试",
        imgUrl:"http://x.hiphotos.baidu.com/baidu/pic/item/b64543a98226cffc6c530d19be014a90f603ea24.jpg",
        url: "https://www.baidu.com/",
        success: function() {
            alert('成功啦');
        },
        cancel: function() {
            alert('失败啦');
        }
    });
     Bridge.share({
         title:"分享测试",
         content: "分享内容测试",
         imgUrl:"http://x.hiphotos.baidu.com/baidu/pic/item/b64543a98226cffc6c530d19be014a90f603ea24.jpg",
         url: "https://www.baidu.com/"
     }, function(){
         alert('成功啦');
     }, function(){
         alert('失败啦');
     });
});

$('.J_Get').on('tap', function(){
    Bridge.Loader.get({
        url: Bridge.host + '/business/ajax/ticket/getsidbynuomi',
        dataType: 'json',
        data: {
            city_code: 100010000
        },
        success: function(res){
            alert('返回城市数据：' + res.data.name);
        },
        fail: function(){
            alert('失败啦');
        }
    });
});

$('.J_Jsonp').on('tap', function(){
    Bridge.Loader.get({
        url: 'http://lvyou.baidu.com/business/ajax/dailysale/getsidbycityid',
        dataType: 'jsonp',
        data: {
            map_city_id: 131
        },
        success: function(res){
            alert('返回sid：' + res.data.sid);
        },
        fail: function(){
            alert('失败啦');
        }
    });
});

$('.J_Sid').on('tap', function(){
    Bridge.getProvinceSid(function(sid){
        alert(sid);
    });
});

$('.J_Tologin').on('tap', function(){
    Bridge.toLogin({
        tpl: 'ma',
        success: function() {
            alert('login success!');
        }
    });
});

$('.J_Islogin').on('tap', function(){
    Bridge.isLogin(function(status){
        alert('用户是否登录：' + status);
    });
});

$('.J_Native').on('tap', function(){
    Bridge.getNativeInfo(function(data){
        alert(JSON.stringify(data));
    });
});

$('.J_Zujian').on('tap', function(){
    if(Bridge.isIos()) {
        Bridge.requestBdApi('bdapi://getComponentVersion?component_id=map.iphone.baidu.scenery',function(data){
            alert('组件版本号:' + data.componentVersion);
        });
    }
    else if(Bridge.isAndroid()) {
        Bridge.requestBdApi('bdapi://getComponentVersion?component_id=map.android.baidu.scenery', function(data){
            alert('组件版本号:' + data.componentVersion);
        });
    }
});

$('.J_Title').on('tap', function(){
    Bridge.setTitle('哈哈哈哈哈');
});


$('.J_InitShare').on('tap', function(){
    Bridge.initShare({
        title: "分享测试",
        content: "分享内容测试",
        imgUrl: "http://x.hiphotos.baidu.com/baidu/pic/item/b64543a98226cffc6c530d19be014a90f603ea24.jpg",
        url: "http://www.baidu.com"
    });
});

$('.J_Yw').on('tap', function(){
    Bridge.getGeocoder(function(res){
        alert(JSON.stringify(res));
    });
});

$('.J_Cityname').on('tap', function(){
    Bridge.getCity(function(res){
        alert(JSON.stringify(res));
    });
});

$('.J_Pushwindow_Order').on('tap', function(){
/*
        Bridge.pushWindow({
            "nuomi":'',
            "nuomi-webapp":"http://www.baidu.com",
            //"map-ios":"baidumap://map/place/detail?uid=550fd5f9f56f1979931fc943&show_type=detail_page",
            "map-ios":'baidumap://map/component?comName=scenery&target=scenery_order_fillout&ldata={"src_from":"xxxxxx”}&param={"partner_id":"qunar","scope_id":"38170","scope_name":"故宫博物院","ticket_id":"3744965222","bid":"06d2dffda107b0ef89f15db6","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"map_scope","is_miaosha":"1"}',
            "map-android":'baidumap://map/component?comName=scenery&target=scenery_detail&uid=550fd5f9f56f1979931fc943',
            "map-webapp":"http://www.taobao.com"
        });
*/

    Bridge.pushWindow({
        'page':'orderFill',
        'data':{
            'nuomi':{
                'ticket_id':'1750433',
                'td_id':'115503',
                'scope_id':'115503',
                'partner_id':'ctripticket'
            },
            'map':{
                "param":'{"partner_id":"qunar","scope_id":"38170","scope_name":"故宫博物院","ticket_id":"3744965222","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"map_scope","is_miaosha":"1"}'
            },
            'nuomi-webapp':{
                td_id: '38170',
                partner_id:'qunar',
                scope_id: '38170',
                ticket_id: '4185477374',
                uid: '3490'
            },
            'map-webapp':{
                partner_id:'ctripticket',
                scope_id:'115503',
                ticket_id:'1750433',
                uid: '33fbfa83eb2f8dc10bf5ebd7'
            }
        }
    });

});

$('.J_Pushwindow_Detail').on('tap', function(){
    /*
    Bridge.pushWindow({
        "nuomi":'bainuo://component?compid=lvyou&comppage=index',
        "nuomi-webapp":"http://lvyou.baidu.com/static/foreign/page/ticket/nuoindex/index.html?td_id=38170",
        "map-ios":"baidumap://map/place/detail?uid=bd5786e83c5e05433904b1b9&show_type=detail_page",
        "map-android":'baidumap://map/component?comName=scenery&target=scenery_detail&uid=bd5786e83c5e05433904b1b9',
        "map-webapp":"http://map.baidu.com/mobile/webapp/place/detail/foo=bar&qt=ninf&industry=scope&uid=bd5786e83c5e05433904b1b9",
        "data":{
            "td_id":"38479"
        }
    });*/

    Bridge.pushWindow({
        'page':'poiDetail',
        'data':{
            'nuomi':{
                ext_from: '',//通过这个统计成单，别忘了写了
                td_id:15909
            },
            'map':{
                'uid':'bd5786e83c5e05433904b1b9'
            },
            'nuomi-webapp':{
                td_id: 38170
            },
            'map-webapp':{
                uid:'33fbfa83eb2f8dc10bf5ebd7',
                qt:'ninf',
                industry:'scope'
            }
        }
    });
});


$('.J_Pushwindow_List').on('tap', function(){
    /*
    if(Bridge.isNuomi()) {
        Bridge.pushWindow({
            "nuomi":'bainuo://component?compid=lvyou&comppage=scenerylist',
            "nuomi-webapp":"http://lvyou.baidu.com/static/foreign/page/ticket/scenery_list/list.html",
            //"map-ios":"baidumap://map/place/detail?uid=550fd5f9f56f1979931fc943&show_type=detail_page",
            "map-ios":'baidumap://map/component?comName=scenery&target=scenery_order_fillout&ldata={"src_from":"呵呵"}&param={"partner_id":"qunar","scope_id":"38170","scope_name":"故宫博物院","ticket_id":"3744965222","bid":"06d2dffda107b0ef89f15db6","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"map_scope","is_miaosha":"1"}',
            "map-android":'baidumap://map/component?comName=scenery&target=scenery_detail&uid=550fd5f9f56f1979931fc943',
            "map-webapp":"http://www.taobao.com",
            "data":{
                "tag_id":0,
                "sid":"795ac511463263cf7ae3def3",
                "ext_from":"nuomi"
            }
        });
    }
    else {
        alert('请在糯米容器中打开');
    }
    */
    Bridge.pushWindow({
        page: 'poiList',
        data: {
            'nuomi':{
                'sid':'795ac511463263cf7ae3def3',
                "tag_id": 0
            },
            'nuomi-webapp':{
                'sid':'795ac511463263cf7ae3def3'
            },
            'map-webapp':{
                'c':131
            }
        }
    });

});

$('.J_Toast').on('tap', function(){
    Bridge.toast('弱提示');
});

$('.J_Alert').on('tap', function(){
    Bridge.alert({
        title:"标题",
        message:"提示内容",
        onConfirm: function(){
            alert('你点了确定');
        }
    })
});
