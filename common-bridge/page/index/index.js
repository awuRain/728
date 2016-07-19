var $ = require('zepto');
require('../../widgets/lazyload/lazyload.js');
require('../../widgets/lazyelement/lazyelement.js');
var Bridge = require('Bridge');
var Juicer = require('juicer');
var pblog = require('../../widgets/pblog-webapp/pblog-webapp.js');
var CountDown = require('../../widgets/countdown/countdown.js');
var lite = require('../../widgets/lite/lite.js');
var moment = require('moment');

console.log(9921);

var T = (new Date()) - 0,
    DEFAULTACTIVEINFO = {
        sid: '795ac511463263cf7ae3def3',
        sname: '北京',
        city_code: 100000000,
        cityid: 131
    },
    ACTIVEINFO = $.extend({}, DEFAULTACTIVEINFO);

var PAGETEXT = $.parseJSON(localStorage.getItem('pagetext') || '{}');

var numFomat = function(num, length) {
    return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}

Juicer.register('numFomat', numFomat);

// 日期格式化
var dateFomat = function(date) {
    return date.slice(5).replace('-', '.');
}

Juicer.register('dateFomat', dateFomat);

var App = {
    // 判断是否是糯米客户端
    isNuomiNa: function() {
        return /Nuomi/i.test(navigator.userAgent);
    },
    // 判断是否是地图客户端
    isMapNa: function() {
        return /baidumap/i.test(navigator.userAgent);
    },
    cacheData: {},
    baseQuery: {
        request_device: 'webapp',
        promotion_scene_key: ''
    },
    params: {
        device_from: 'webapp',
        ext_from: '728_promotion',
        // from: '728_promotion',
        innerfr: '728_promotion',
        src_from: '728_promotion',
        activity_id: '728_promotion',
        request_fr: '728_promotion',
        // request_device: ''
    },
    is_login: 0, //用户登录状态
    init: function() {
        var me = this;

        Bridge.Data.getData(function(res) {
            me.params = res;

            me.dasouParams = {
                sid: res.sid,
                city_code: res.city_code,
                cityid: res.cityid,
                sname: res.sname
            }

            delete res.uid;
            delete res.comppage;
            delete res.oem;
            delete res.channel;
            delete res.cpu;
            delete res.sv;
            delete res.os;
            delete res.resid;
            delete res.mb;
            delete res.net;
            delete res.ctm;
            delete res.glr;
            delete res.bduid;
            delete res.dpi;
            delete res.glv;
            delete res.ver;
            delete res.screen;
            delete res.cuid;
            delete res.c;
            delete res.loc;
            delete res.b;
            delete res.bc;
            delete res.ssid;
            delete res.sid;
            delete res.city_code;
            delete res.cityid;
            delete res.sname;

            me.cacheData = me.getCacheDataFromSession();

            me.cacheData.channel = me.cacheData.channel || {};
            me.cacheData.channel.name = me.params.na_from || 'nuomi';

            if (location.host == 'map.baidu.com' || me.params.na_from == 'map_scope') {
                me.cacheData.channel.name = 'map_scope';
            } else if (location.host == 'lvyou.baidu.com' || me.params.na_from == 'nuomi') {
                me.cacheData.channel.name = 'nuomi';
            } else {
                me.cacheData.channel.name = 'nuomi';
            }

            me.getPageConfig();
        });

        return me;
    },
    baseOrder: [{
        id: 'promotionList',
        title: '爆款抢购',
        attrs: {
            'section-type': 'promotionList'
        },
        type: 'poi'
    }, {
        id: 'fixPrice',
        title: '爆款折扣',
        activeDate: '2016-07-17',
        endDate: '2016-07-20',
        attrs: {
            'section-type': 'fixPrice'
        },
        type: 'sku'
    }, {
        id: 'mainMeeting',
        title: '嗨翻出游主题趴'
    }, {
        id: 'playflower',
        title: '热门城市玩花样',
        attrs: {
            'section-type': 'playflower'
        }
    }],
    mainMeetingOrder: [{
        id: 'scene_hotel',
        title: '景酒一日游专题',
        meeting: '景酒',
        attrs: {
            'section-type': 'mainMeeting'
        },
        cardNum: 4
    }, {
        id: 'baby',
        title: '亲子分会场',
        meeting: '亲子分会场',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link',
        cardNum: 4
    }, {
        id: 'qixi',
        title: '七夕专题',
        meeting: '七夕',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link',
        cardNum: 4
    }, {
        id: 'slow_life',
        title: '慢生活专题',
        meeting: '慢生活',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link',
        cardNum: 4
    }, {
        id: 'olympic',
        title: '奥运专题',
        meeting: '奥运',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link',
        cardNum: 4
    }, {
        id: 'scenic',
        title: '名胜古迹',
        meeting: '名胜',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'poi',
        cardNum: 4
    }],
    renderLayout: function(opts) { //组织分会场顺序
        var me = this,
            tpl = me.tpl_layout || $('#tpl-layout').html(),
            _settings = opts || {},
            arr_innerHtml = [],
            html = '',
            nowDate = new Date(me.cacheData.now),
            activeDate, endDate, _item, _arr_innerHtml, pageConfigItem, _activeDate, _endDate, _activeTime, _endTime;

        me.tpl_layout = tpl;
        me.baseOrder_Key = {};

        // activeDate = new Date(me.baseOrder[1].activeDate);
        // endDate = new Date(me.baseOrder[1].endDate);

        // if (me.cacheData.now < activeDate || me.cacheData.now > endDate) { //未到模块展现时间,折扣模块不会被渲染
        //     me.baseOrder.splice(1, 1);
        // }

        if (me.cacheData.channel.name == 'map_scope') {
            me.baseOrder.splice(2, 1);
            me.mainMeetingOrder.length = 0;
        }

        for (var i = 0, len = me.mainMeetingOrder.length; i < len; i++) { //调整分会场顺序
            _item = $.extend(me.mainMeetingOrder[i]);
            pageConfigItem = me.cacheData.pageConfig[_item.id] || {};
            _activeDate = pageConfigItem.activeDate;
            if (me.cacheData.now >= new Date(_activeDate) - 0) {
                me.mainMeetingOrder.unshift($.extend(me.mainMeetingOrder[i], {
                    cardNum: 10,
                    className: 'section-item-top'
                }));
                me.mainMeetingOrder.splice(i + 1, 1);
                break;
            }
        }

        for (var i = 0, len = me.baseOrder.length; i < len; i++) { //组织主会场基本模块 layout
            _item = $.extend(me.baseOrder[i]);
            _arr_innerHtml = [];
            pageConfigItem = me.cacheData.pageConfig[_item.id] || {};
            _activeDate = pageConfigItem.activeDate;
            _endDate = pageConfigItem.endDate;
            _activeTime, _endTime;

            me.baseOrder_Key[_item.id] = _item;

            if (_activeDate && _endDate) {
                _activeTime = new Date(_activeDate) - 0;
                _endTime = new Date(_endDate) - 0;

                if (!(me.cacheData.now >= _activeTime && _endTime > me.cacheData.now)) {
                    continue;
                }
            }

            if (_item.id == 'mainMeeting') { //组织分会场
                _arr_innerHtml.push('<div class="J-placeholder J-placeholder-page-tab"></div>');
                me.mainMeetingOrder.forEach(function(jtem, jndex) {
                    pageConfigItem = me.cacheData.pageConfig[jtem.id] || {};
                    jtem.className = jtem.className ? jtem.className + ' section-item-inner' : ' section-item-inner';
                    jtem.activeDate = pageConfigItem.activeDate;
                    me.baseOrder_Key[jtem.id] = jtem;
                    _arr_innerHtml.push(me.createSection(jtem));
                });
                _item.innerHtml = _arr_innerHtml.join('');
            }
            arr_innerHtml.push(me.createSection(_item));
        }

        html = Juicer($('#tpl-layout').html(), {
            cacheData: me.cacheData,
            settings: _settings,
            data: {
                layout: arr_innerHtml.join('')
            }
        });

        $(html).prependTo('.J-page');
        arr_innerHtml.length = 0;

        return me;
    },
    createSection: function(opts) { //创建 section
        var me = this,
            tpl = me.tpl_section || $('#tpl-section').html(),
            _settings = opts || {},
            html = Juicer(tpl, {
                cacheData: me.cacheData,
                settings: _settings
            });
        me.tpl_section = tpl;
        return html
    },
    getPageConfig: function(opts) { //获取文案配置
        var me = this,
            _settings = opts || {},
            deferred = $.Deferred();

        $.getJSON('./config-' + me.cacheData.channel.name + '.json', {
            t: T
        }, function(res) {
            console.log(res);
            me.cacheData.pageConfig = res || {};
            me.getNowTime().then(function() {
                return me.renderLayout();
            }).then(function() {
                me.renderBase()
                me.initReady({
                    pageConfig: res || PAGETEXT,
                    is_init: 1
                });
            });
            deferred.resolve();
        });

        // window.configReady = function(res) { //文案配置 ready 后
        //     me.cacheData.pageConfig = res || {};
        //     me.getNowTime().then(function() {
        //         return me.renderLayout();
        //     }).then(function() {
        //         me.renderBase()
        //             .initReady({
        //                 pageConfig: res || PAGETEXT,
        //                 is_init: 1
        //             });
        //     });
        //     deferred.resolve();
        // };

        // $.getJSON('http://lvyou.baidu.com/event/s/dw_promotion/config-' + me.cacheData.channel.name + '.js?callback=?', {
        //     t: T
        // });

        return deferred;
    },
    initReady: function(opts) {
        var me = this,
            _settings = opts || {},
            rules = {},
            rulesText = '',
            _dataReady = function() {
                me.cacheData.nativeInfo.sv = me.cacheData.nativeInfo.sv || '';
                me.cacheData.nativeInfo.sv = me.cacheData.nativeInfo.sv.replace(/\./ig, '') - 0;
                me.cacheData.ticketDetail_can_go = 0; //标记当前页面是否能跳转到门票详情页
                me.cacheData.orderFill_can_go = 0; //标记当前页面是否能跳转到门票填单页
                me.cacheData.mustUp = 0; //标记当前客户端版本是否需要升级
                me.cacheData.noForeign = 0; //标记显示境外区域
                if (me.isMapNa()) {
                    me.cacheData.ticketDetail_can_go = me.cacheData.nativeInfo.sv > 920 ? 1 : 0; //标记当前页面是否能跳转到门票详情页
                    // me.cacheData.ticketDetail_can_go_ctrip = me.cacheData.nativeInfo.sv > 920 ? 1 : 0; //标记当前页面是否能跳转到门票详情页
                    me.cacheData.orderFill_can_go = me.cacheData.nativeInfo.sv >= 915 && me.cacheData.nativeInfo.sv <= 920 ? 1 : 0; //标记当前页面是否能跳转到填单页
                    me.cacheData.mustUp = me.cacheData.nativeInfo.sv < 915 ? 1 : 0; //标记当前客户端版本是否需要升级
                    me.cacheData.noForeign = me.cacheData.nativeInfo.sv >= 930 ? 0 : 1; //标记是否显示境外区域
                } else {
                    me.cacheData.orderFill_can_go = 1; //标记当前页面是否能跳转到填单页
                    me.cacheData.ticketDetail_can_go = 1; //标记当前页面是否能跳转到门票详情页
                    // if (me.cacheData.channel.name == 'map_scope') {
                    // me.cacheData.noForeign = 1; //标记不显示境外区域
                    // }
                }
                if (me.cacheData.channel.name == 'nuomi') {
                    me.cacheData.ticketDetail_can_go = 1;
                } else { //下面删除节点的操作都是为了美啊 哪里美呢 区块之间的颜色间隔
                    // $('.J-placeholder-oneDayTour').remove();
                    // $('.J-placeholder-sceneryHotel').remove();
                    // if (me.cacheData.noForeign) {
                    //     $('.J-placeholder-foreign').remove();
                    // }
                }
                // me.cacheData.noForeign = me.cacheData.noForeign || 0;
                // me.cacheData.Math = Math;
                me.share()
                    .events()
                    .getDomainList()
                    .showLog();
            };

        if (me.isMapNa()) {
            me.params.ldata = '{"src_from":"728_promotion","activity_id":"728_promotion"}';
        }

        me.cacheData.channel = me.cacheData.channel || {};
        me.cacheData.channel.name = me.params.na_from || 'nuomi';

        if (location.host == 'map.baidu.com' || me.params.na_from == 'map_scope') {
            me.cacheData.channel.name = 'map_scope';
        } else if (location.host == 'lvyou.baidu.com' || me.params.na_from == 'nuomi') {
            me.cacheData.channel.name = 'nuomi';
        } else {
            me.cacheData.channel.name = 'nuomi';
        }
        me.cacheData.channel.activity_id = me.cacheData.channel.name == 'nuomi' ? 40 : 39;
        $('html').addClass(me.cacheData.channel.name);
        rules = me.cacheData.pageConfig.rules || '';
        me.cacheData.rulesText = rules.split('\n') || [];

        if (me.params.debug == 1) {
            me.cacheData.pageConfig.coupon_show = 1;
        }
        if (me.isMapNa()) { //地图客户端需要区分一下版本号
            Bridge.getNativeInfo(function(res) {
                me.cacheData.nativeInfo = $.extend({}, res);
                _dataReady();
            });
        } else {
            me.cacheData.nativeInfo = {};
            _dataReady();
        }

        return me;
    },
    getNowTime: function(opts) { //获取当前时间
        var me = this,
            _settings = opts || {},
            deferred = $.Deferred();
        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/gettime/',
            dataType: 'jsonp',
            data: {
                t: T
            },
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('获取当前时间:' + res.msg);
                    return false;
                }
                me.cacheData.now = res.data.t * 1000;
                _settings.callback && _settings.callback();
                deferred.resolve();
            },
            fail: function() {
                deferred.reject();
                Bridge.toast('获取当前时间失败啦!');
            }
        });
        return deferred;
    },
    checkOnline: function() { //检测网络状态
        var me = this;
        me.online = 1;
        setInterval(function() {
            if (navigator && navigator.onLine) {
                me.online = 1;
            } else {
                me.online = 0;
            }
        }, 2000);
        return me;
    },
    showLog: function() {
        var me = this;
        pblog.showLog({
            'client_type': me.isMapNa() ? '7' : '3',
            'ext_os': Bridge.isAndroid() ? 'android' : 'ios',
            'accur_trd': me.cacheData.channel.name == 'map_scope' ? 'map' : 'nuomi',
            'accur_act': 'pv',
            'accur_thirdpar': me.params.fr,
            'accur_src': me.params.activename || '728_promotion',
            'innerfr_pg': me.params.innerfr,
            'innersubfr_pg': me.params.innersubfr,
            'ext_type': 0
        });
        return me;
    },
    lazyLoadImg: function(wrap, callback) {
        var me = this;
        $(wrap).find('.img-wrap').each(function(index, item) {
            var src = $(this).find('img').attr('src') || '';
            if (src.length) {
                return me;
            }
            var url = $(item).attr("data-purl");
            var tempPic = new Image();
            tempPic.onload = function() {
                var tempObj = {
                    width: tempPic.width,
                    height: tempPic.height
                };
                item.innerHTML = lite.createImage(false, url, tempObj.width, tempObj.height, $(item).width() + 1, $(item).height(), false, true);
            };
            tempPic.src = url;
        });
        callback && callback();
        return me;
    },
    reSizeImg: function(opts) {
        var me = this,
            _settings = opts || {},
            type = _settings.type || 'promotionList',
            data, ctripList, promotionList;
        // return me;
        if (type == 'promotionList') {
            data = me.cacheData.promotionList[me.cacheData.sid] || {};
            ctripList = data.ctripList || {};
            promotionList = data.promotionList || {};
            $.each(promotionList.list || [], function(indx, item) {
                item['picUrl'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=710&height=450&quality=100&align=middle,middle&src=' + item['picUrl'];
            });
        } else if (type == 'ticket') {
            $.each(me.cacheData.ticket, function(indx, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'sceneryHotel') {
            $.each(me.cacheData.sceneryHotel, function(indx, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'oneDayTour') {
            $.each(me.cacheData.oneDayTour, function(indx, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'ctrip') {
            $.each(me.cacheData.ctrip[me.cacheData.ctrip_pn], function(indx, item) {
                item['picUrl'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['picUrl'];
            });
        } else if (type == 'foreign') {
            $.each(me.cacheData.foreign[me.cacheData.foreign_pn], function(indx, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'autotrophy') {
            $.each(me.cacheData.autotrophy[me.cacheData.sid].autotrophy_pn, function(indx, item) {
                item['image'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=240&height=150&quality=100&align=middle,middle&src=' + item['image'];
            });
        }

        return me;
    },
    share: function() {
        var me = this,
            url = 'http://lvyou.baidu.com/event/s/728_promotion/nuomi/?fr=wechat';
        // url = 'http://cp01-qa-lvyou-001.cp01.baidu.com:8080/event/s/728_promotion/nuomi/page/index.html?fr=wechat';
        if (me.cacheData.channel.name == 'map_scope') {
            url = 'http://map.baidu.com/fwmap/upload/728_promotion/map/?fr=wechat';
            // url = 'http://cp01-qa-lvyou-001.cp01.baidu.com:8080/event/s/728_promotion/nuomi/page/index.html?na_from=map_scope&fr=wechat';
        }

        Bridge.initShare({
            title: me.cacheData.pageConfig.share.title,
            content: me.cacheData.pageConfig.share.content,
            imgUrl: me.cacheData.pageConfig.share.imgUrl,
            url: url
        });

        Bridge.setTitle(me.cacheData.pageConfig.title);

        document.title = me.cacheData.pageConfig.title;

        return me;
    },
    getCacheDataFromSession: function() { //从 session 中获取缓存数据
        var me = this;

        var session_cacheStr = sessionStorage.getItem('me.cacheData') || '';
        me.cacheData = session_cacheStr.length ? $.parseJSON(session_cacheStr) : me.cacheData;

        return me.cacheData;
    },
    setCacheDataToSession: function() { //将缓存数据存入 session 中
        var me = this;

        setTimeout(function() {
            sessionStorage.setItem('me.cacheData', JSON.stringify(me.cacheData));
        }, 0);

        return me.cacheData;
    },
    getDomainList: function() { //获取省份/城市列表
        var me = this;

        $('.J-loading').text('正在拉取省份列表...');

        if (me.cacheData.domainList) {
            me.renderDomainList();
            return me;
        }

        Bridge.Loader.get({
            // url: Bridge.host + '/business/ajax/ticket/getpromotionList/',
            url: 'http://cp01-lvyou-pengkuan.epc.baidu.com:8080/business/ajax/promotion/getprovincecity',
            dataType: 'jsonp',
            data: {
                activity_name: 'summer',
                t: T
            },
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('省份列表:' + res.msg);
                    return me;
                }
                me.cacheData.domainList = res.data;
                me.setCacheDataToSession();
                me.renderDomainList();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });
        return me;
    },
    renderDomainList: function() { //渲染省份/城市列表
        var me = this,
            _sid = sessionStorage.getItem('sid') || '',
            _sname = '',
            _fun = function(opts) {
                var _settings = opts || {};
                if (_times > 0) { //防止重复初始化
                    return me;
                }

                clearTimeout(_timeout);

                if (_settings.sid.length == 0 || _settings.sname.length == 0) { //gps 定位失败
                    me.cacheData.gps_success = 0;
                    me.cacheData.gps_sid = DEFAULTACTIVEINFO.sid;
                    me.cacheData.gps_sname = DEFAULTACTIVEINFO.sname;
                } else { //gps 定位成功
                    me.cacheData.gps_sid = _settings.sid;
                    me.cacheData.gps_sname = _settings.sname;
                    me.cacheData.gps_success = 1;
                }
                me.cacheData.sid = me.cacheData.gps_sid;
                me.cacheData.sname = me.cacheData.gps_sname;
                me.setCacheDataToSession();

                try {
                    if (!me.dasouParams.cityid) {
                        sessionStorage.setItem('sid', me.cacheData.sid);
                    }
                } catch (e) {
                    console.log(e);
                }

                $(me).trigger('locationReady');

                _times++;
            },
            _timeout,
            _times = 0;

        $('.J-loading').text('正在获取当前位置...');

        if (_sid.length) {
            if (_sid in me.cacheData.domainList.city) {
                _sname = me.cacheData.domainList.city[_sid].city;
            } else if (_sid in me.cacheData.domainList.province) {
                _sname = me.cacheData.domainList.province[_sid];
            }
            _fun({
                sid: _sid,
                sname: _sname
            });
            return me;
        }
        _timeout = setTimeout(function() {
            clearTimeout(_timeout);

            _fun({
                sid: '',
                sname: ''
            });

            console.warn('getProvinceSid 超时 将已北京作为默认省份');
        }, 5000);

        Bridge.getCityProvince(function(data) { //获取当前位置的城市/省份信息
            clearTimeout(_timeout);
            me.cacheData.gps_city = $.extend({}, data.city);
            me.cacheData.gps_province = $.extend({}, data.province);
            console.log('me.cacheData.gps_city.sid in me.cacheData.domainList.city:', me.cacheData.gps_city.sid in me.cacheData.domainList.city);
            console.log('me.cacheData.gps_city:', me.cacheData.gps_city)
            console.log('me.cacheData.gps_province.sid in me.cacheData.domainList.province:', me.cacheData.gps_province.sid in me.cacheData.domainList.province);
            console.log('me.cacheData.gps_province:', me.cacheData.gps_province)

            if (me.cacheData.gps_city.sid in me.cacheData.domainList.city) { //当前位置在城市列表中
                _sid = me.cacheData.gps_city.sid;
                _sname = me.cacheData.gps_city.sname;
            } else if (me.cacheData.gps_province.sid in me.cacheData.domainList.province) { //当前位置在省份列表中
                _sid = me.cacheData.gps_province.sid;
                _sname = me.cacheData.gps_province.sname;
            }

            _fun({
                sid: _sid,
                sname: _sname
            });
        });
        return me;
    },
    loadDataRelyonLoc: function(opts) { //加载基于地理位置的模块
        var me = this,
            _settings = opts || {};
        me.getPromotionList().always(function() {
            return me.getFixprice()
        }).always(function() {
            return me.getMainMeeting()
        });

        return me;
    },
    getFixprice: function() { //获取爆款折扣
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                deferred.resolve();
            };

        me.cacheData.fixPrice = me.cacheData.fixPrice || {};
        me.cacheData.fixPrice[me.cacheData.sid] = me.cacheData.fixPrice[me.cacheData.sid] || null;

        if (me.cacheData.fixPrice[me.cacheData.sid]) {
            _dataReady();
            return deferred;
        }

        Bridge.Loader.get({
            // url: Bridge.host + '/business/ajax/promotion/getfixprice',
            url: 'http://cp01-lvyou-pengkuan.epc.baidu.com:8080/business/ajax/promotion/getfixprice',
            dataType: 'jsonp',
            data: $.extend({}, {
                sid: me.cacheData.sid,
                promotion_product_show: me.cacheData.channel.name,
                request_device: 'webapp',
                activity_name: 'summer',
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('爆款折扣:' + res.msg);
                    deferred.reject();
                    return deferred;
                }
                me.cacheData.fixPrice[me.cacheData.sid] = res.data || null;
                me.setCacheDataToSession();
                // me.reSizeImg({
                //     type: 'promotionList'
                // });
                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
                deferred.reject();
            }
        });
        return deferred;
    },
    renderFixprice: function(opts) { //获取爆款折扣
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            mainMeeting = me.cacheData.fixPrice || {},
            mainMeeting_sid = mainMeeting[me.cacheData.sid] || {},
            createFlag = function(status) {
                var text, className;
                if (status == 0) {
                    text = '即将开始';
                    className = 'flag-comming';
                } else if (status == 1) {
                    text = '抢购中';
                    className = 'flag-discount';
                } else if (status == 2) {
                    text = '抢购结束';
                    className = 'flag-past';
                }
                return '<em class="' + className + '">' + text + '</em>'
            };

        if ($.isEmptyObject(mainMeeting_sid)) {
            $('.J-placeholder-' + _settings.id).parents('.section-item').removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter($('.J-placeholder-' + _settings.id).parents('.section-item'));
            return me;
        }

        me.tpl_mainMeeting = tpl;

        // me.reSizeImg({
        //     type: 'baby'
        // });

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 1,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        // direction: 'vertical',
                        data: mainMeeting_sid.list || [],
                        flags: [
                            // createFlag(me.cacheData.promotionList[me.cacheData.sid].list[0].status)
                        ],
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html).parents('.section-item').removeClass('hide').addClass('show');
        $('<div class="J-placeholder-' + _settings.id + '-empty" />').remove();
        $(me).trigger('dataLoaded', [{
            name: _settings.id
        }]);

        return me;
    },
    getPromotionList: function() { //获取折扣列表
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                deferred.resolve();
            };

        me.cacheData.promotionList = me.cacheData.promotionList || {};
        me.cacheData.promotionList[me.cacheData.sid] = me.cacheData.promotionList[me.cacheData.sid] || null;

        if (me.cacheData.promotionList[me.cacheData.sid]) {
            _dataReady();
            return deferred;
        }

        Bridge.Loader.get({
            // url: Bridge.host + '/business/ajax/promotion/getdiscountbuying',
            url: 'http://cp01-lvyou-pengkuan.epc.baidu.com:8080/business/ajax/promotion/getdiscountbuying',
            dataType: 'jsonp',
            data: $.extend({}, {
                sid: me.cacheData.sid,
                promotion_product_show: me.cacheData.channel.name,
                request_device: 'webapp',
                activity_name: 'summer',
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('爆款折扣:' + res.msg);
                    deferred.reject();
                    return deferred;
                }
                me.cacheData.promotionList[me.cacheData.sid] = res.data || null;

                me.setCacheDataToSession();

                // me.reSizeImg({
                //     type: 'promotionList'
                // });
                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
                deferred.reject();
            }
        });
        return deferred;
    },
    renderPromotionList: function(opts) { //渲染爆款抢购区域
        var me = this,
            tpl = me.tpl_promotionList || $('#tpl-promotionList').html(),
            _settings = opts || {},
            createFlag = function(status) {
                var text, className;
                if (status == 0) {
                    text = '即将开始';
                    className = 'flag-comming';
                } else if (status == 1) {
                    text = '抢购中';
                    className = 'flag-discount';
                } else if (status == 2) {
                    text = '抢购结束';
                    className = 'flag-past';
                }
                return '<em class="' + className + '">' + text + '</em>'
            },
            promotionList = me.cacheData.promotionList || {},
            promotionList_sid = promotionList[me.cacheData.sid] || {},
            promotionList_sid_list = promotionList_sid.list || [],
            show_tab1, show_tab2, html;

        if (promotionList_sid_list.length == 0) {
            $('.J-placeholder-' + _settings.id).parents('.section-item').removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter($('.J-placeholder-' + _settings.id).parents('.section-item'));
            return me;
        }

        show_tab1 = me.cacheData.now >= promotionList_sid_list[0].start_time * 1000 ? 1 : 0;
        show_tab2 = !show_tab1 ? 1 : 0;
        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                tab1: {
                    id: promotionList_sid_list[0].start_time,
                    rel: promotionList_sid_list[0].start_time,
                    html: me.createTicketList({
                        type: me.baseOrder_Key[_settings.id]['type'],
                        direction: 'horizontal',
                        data: promotionList_sid_list[0].poi_list,
                        attrs: {
                            'tab-id': promotionList_sid_list[0].start_time,
                            'tab-rel': promotionList_sid_list[0].start_time,
                            'style': 'display:' + (show_tab1 ? 'block' : 'none')
                        },
                        flags: [
                            createFlag(promotionList_sid_list[0].status)
                        ]
                    })
                },
                tab2: {
                    id: promotionList_sid_list[1].start_time,
                    rel: promotionList_sid_list[0].start_time,
                    html: me.createTicketList({
                        type: me.baseOrder_Key[_settings.id]['type'],
                        data: promotionList_sid_list[1].poi_list,
                        attrs: {
                            'tab-id': promotionList_sid_list[1].start_time,
                            'tab-rel': promotionList_sid_list[0].start_time,
                            'style': 'display:' + (show_tab2 ? 'block' : 'none')
                        },
                        flags: [
                            createFlag(promotionList_sid_list[1].status)
                        ]
                    })
                }
            })
        });
        me.tpl_promotionList = tpl;
        $('.J-placeholder-' + _settings.id).html(html).parents('.section-item').removeClass('hide').addClass('show');
        $('<div class="J-placeholder-' + _settings.id + '-empty" />').remove();
        $('.J-loading').removeClass('show').addClass('hide');
        $(me).trigger('promotionListReady')
            .trigger('dataLoaded', [{
                name: 'promotion'
            }]);
        return me;
    },
    createTicketList: function(opts) { //创建门票卡片
        var me = this,
            _settings = opts || {},
            tpl = me.tpl_ticketList || $('#tpl-ticketList').html(),
            html = Juicer(tpl, {
                direction: _settings.direction || 'horizontal',
                cacheData: me.cacheData,
                data: _settings.data || [],
                attrs: _settings.attrs || {},
                flags: _settings.flags || [],
                type: _settings.type || '',
                cardNum: _settings.cardNum || 4,
            });
        me.tpl_ticketList = tpl;
        return html;
    },
    getMainMeeting: function() { //获取全量的分会场数据
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                $(me).trigger('mainMeetingBySidDataReady');

                deferred.resolve();
            };

        me.cacheData.mainMeeting = me.cacheData.mainMeeting || {};

        if (me.cacheData.mainMeeting[me.cacheData.sid]) {
            _dataReady();
            deferred.resolve();
            return false;
        }

        Bridge.Loader.get({
            // url: Bridge.host + '/business/ajax/promotion/getmainmeetingdata',
            url: 'http://cp01-lvyou-pengkuan.epc.baidu.com:8080/business/ajax/promotion/getmainmeetingdata',
            dataType: 'jsonp',
            data: {
                sid: me.cacheData.sid,
                activity_name: 'summer',
                promotion_product_show: me.cacheData.channel.name,
                request_device: 'webapp'
            },
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('分会场数据:' + res.err_msg);
                    return false;
                }

                me.cacheData.mainMeeting[me.cacheData.sid] = res.data || null;

                me.setCacheDataToSession();

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
                deferred.reject();
            }
        });
        return deferred;
    },
    renderMainMeeting: function(opts) { //渲染单个分会场数据
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            mainMeeting = me.cacheData.mainMeeting || {},
            mainMeeting_sid = me.cacheData.mainMeeting[me.cacheData.sid] || {},
            mainMeeting_sid_id = mainMeeting_sid[_settings.id] || {},
            createFlag = function(status) {
                var text, className;
                if (status == 0) {
                    text = '即将开始';
                    className = 'flag-comming';
                } else if (status == 1) {
                    text = '抢购中';
                    className = 'flag-discount';
                } else if (status == 2) {
                    text = '抢购结束';
                    className = 'flag-past';
                }
                return '<em class="' + className + '">' + text + '</em>'
            };

        if ($.isEmptyObject(mainMeeting_sid_id) || mainMeeting_sid_id.list.length == 0) {
            $('#' + _settings.id).removeClass('show').addClass('hide')
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter($('#' + _settings.id));
            return me;
        }

        me.tpl_mainMeeting = tpl;

        // me.reSizeImg({
        //     type: 'baby'
        // });

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: mainMeeting_sid_id.list || [],
                        flags: [
                            // createFlag(me.cacheData.promotionList[me.cacheData.sid].list[0].status)
                        ]
                    })
                }
            })
        });
        $('#' + _settings.id).removeClass('hide').addClass('show');
        $('.J-placeholder-' + _settings.id).html(html);
        $('<div class="J-placeholder-' + _settings.id + '-empty" />').remove();
        $(me).trigger('dataLoaded', [{
            name: _settings.id
        }]);
        return me;
    },
    getDiscount: function(opts) { //领券
        var me = this,
            _settings = opts || {},
            url = '',
            _dataReady = function(res) {
                clearInterval(_timer); //终端超时
                if (res.errno != 0) {
                    Bridge.toast('领券:' + res.msg);
                    return false;
                }
                me.renderFlayer({
                    type: 'couponPick',
                    data: res.data,
                    is_show: 1
                });
                if (res.data.is_success == 1 || res.data.err_no == '40108') {
                    $('.coupon-item').filter(function() {
                        if ($(this).data('id') == _settings.id) {
                            return this;
                        }
                    }).addClass('coupon-item-out coupon-item-picked');
                };
            },
            _times = 0,
            _timer = null;
        if (me.cacheData.channel.name == 'nuomi') {
            url = '/business/ajax/ticket/getnuomidiscount/';
        } else if (me.cacheData.channel.name == 'map_scope') {
            url = '/business/ajax/ticket/getmapdiscount/';
        }
        if (navigator && navigator.onLine == 0) { //离线状态
            Bridge.toast('领取失败了，再试一次吧');
            return me;
        }
        _timer = setInterval(function() { //设置超时时间为5秒
            ++_times;
            if (_times >= 5) {
                clearInterval(_timer);
                Bridge.toast('领取失败了，再试一次吧');
                return me;
            }
        }, 1000);
        var promotionList = me.cacheData.promotionList[me.cacheData.sid] || {};
        if (me.cacheData.channel.name == 'nuomi') {
            Bridge.Loader.post({
                url: Bridge.host + url,
                data: $.extend({
                    type: _settings.id,
                    activity_name: 'duanwu'
                }, me.params),
                success: function(res) {
                    _dataReady(res);
                },
                fail: function() {
                    Bridge.toast('领取失败了，再试一次吧');
                }
            });
        } else {
            Bridge.Loader.get({
                url: Bridge.host + url,
                dataType: 'jsonp',
                data: $.extend({
                    type: _settings.id,
                    activity_name: 'duanwu'
                }, me.params),
                success: function(res) {
                    _dataReady(res);
                },
                fail: function() {
                    Bridge.toast('领取失败了，再试一次吧');
                }
            });
        }
        return me;
    },
    getMapDisCountStatus: function() { //获取领券状态
        var me = this,
            coupon_show = me.cacheData.pageConfig.coupon.is_open || 0;
        if (me.cacheData.channel.name == "nuomi" || coupon_show == 0) {
            me.cacheData.mapDisCountStatus = { //糯米端默认都为可领状态
                "1": { "is_can_get": 1 },
                "2": { "is_can_get": 1 },
                "3": { "is_can_get": 1 },
                "4": { "is_can_get": 1 },
                "5": { "is_can_get": 1 }
            };
            me.renderCoupon();
            return me;
        }
        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/ticket/getmapdiscountstatus/',
            dataType: 'jsonp',
            data: $.extend({
                t: T,
                activity_name: 'duanwu'
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    if (res.errno == 1) {
                        me.cacheData.mapDisCountStatus = { //糯米端默认都为可领状态
                            "1": { "is_can_get": 1 },
                            "2": { "is_can_get": 1 },
                            "3": { "is_can_get": 1 },
                            "4": { "is_can_get": 1 },
                            "5": { "is_can_get": 1 }
                        };
                        me.renderCoupon();
                        return false;
                    }
                    Bridge.toast('获取领券状态:' + res.msg);
                    return false;
                }
                me.cacheData.mapDisCountStatus = res.data.list || {};
                me.renderCoupon();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });
        return me;
    },
    renderCoupon: function() { //渲染券列表
        var me = this,
            html,
            coupon_show = me.cacheData.pageConfig.coupon.is_open || 0;
        if (coupon_show == 1) { //根据文案配置决定是否显示领券区域
            html = Juicer($('#tpl-coupon').html(), {
                cacheData: me.cacheData,
                activeInfo: ACTIVEINFO
            })
            $('.J-placeholder-coupon').html(html);
            $(me).trigger('dataLoaded', [{
                name: 'coupon'
            }]);
        } else {
            $('.J-placeholder-coupon').remove();
            // html = Juicer($('#tpl-coupon').html(), {
            //     cacheData: me.cacheData,
            //     activeInfo: ACTIVEINFO
            // })
            // $('.J-placeholder-coupon').html(html);
        }
        return me;
    },
    renderBanner: function() {
        var me = this,
            html,
            banner = me.cacheData.pageConfig.banner || {},
            banner_show = banner.pic && banner.pic.length ? 1 : 0;
        $('.J-placeholder-jumpBnr').remove();
        if (me.cacheData.channel.name == 'map_scope' || !banner_show) {
            $('.J-placeholder-jumpBnr-rb').remove();
            return me;
        }
        html = Juicer($('#tpl-banner').html(), {
                cacheData: me.cacheData,
                activeInfo: ACTIVEINFO
            })
            // $('.J-placeholder-jumpBnr').html(html);
        $('.J-placeholder-jumpBnr-rb').html(html);
        return me;
    },
    renderBase: function() { //渲染不需要依赖地理位置的基础模块
        var me = this;
        me.renderCalendar()
            .renderHeader()
            .renderFooter()
            .renderPlayFlower()
            .renderSubSessionTab();

        // final-test

        me.renderCoupon();

        // final-test

        $('.J-loading').text('').removeClass('show').addClass('hide');
        return me;
    },
    renderCalendar: function() { //渲染每日专场

        var me = this,
            html = '';

        // var from = Calendar.from,
        //     to = Calendar.to,
        //     activitynameList = Calendar.activitynameList;

        var baseOrder = [{
            id: 'scene_hotel',
            title: '景酒日游专题',
            meeting: '景酒',
            activeDate: '2016-07-16'
        }, {
            id: 'baby',
            title: '亲子专题',
            meeting: '亲自',
            activeDate: '2016-07-17'
        }, {
            id: 'qixi',
            title: '七夕专题',
            meeting: '七夕',
            activeDate: '2016-07-18'
        }, {
            id: 'slow_life',
            title: '慢生活专题',
            meeting: '慢生活',
            activeDate: '2016-07-19'
        }, {
            id: 'olympic',
            title: '奥运专题',
            meeting: '奥运',
            activeDate: '2016-07-20'
        }, {
            id: 'scenic',
            title: '名胜古迹',
            meeting: '名胜',
            activeDate: '2016-07-21'
        }];

        var list = baseOrder;

        me.getNowTime({
            callback: function() {
                var now = moment.unix(me.cacheData.now),
                    list = [];
                for (var i in list) {
                    var to = list[i].activeDate;
                    if (now.isSame(to, 'day')) {
                        var list = list.slice(i);
                    }
                }

                html = Juicer($('#tpl-calendar').html(), {
                    cacheData: me.cacheData,
                    list: list
                });
                $('.J-placeholder-calendar').html(html);


                function setUlWidth() {
                    setTimeout(function() {
                        var ulWidth = 0;
                        $('.calendar .date-list li').each(function(i, it) {
                            ulWidth += parseInt($(it).css('width').replace('px', ''));
                        });
                        // ulWidth += parseInt($('.section-item-calendar .date-list li').css('width').replace('px'));
                        ulWidth += parseInt($('.calendar .date-list li').css('width').replace('px')) / 2;
                        $('.calendar .date-list ul').css('width', ulWidth);
                    }, 100);

                }

                setUlWidth();

                $(window).on('resize', function() {
                    setUlWidth();
                });
            }
        });
        return me;
        // function getDateScope (now, from, to, size) {

        //     var list = [],
        //         from = moment2Str(moment(from).subtract(1, 'day')),
        //         to = moment2Str(moment(to).add(1, 'day')),
        //         date = now;

        //     if (!now.isBetween(from, to, 'day')) {
        //         for (var i = size; i > 0; i--) {
        //             list.push((moment2Str(moment(to).subtract(i, 'day'), '.', true)));
        //         }   
        //         return list;
        //     }

        //     while (!date.isSame(to, 'day')) {
        //         list.push((moment2Str(date, '.', true)));
        //         date = date.add(1, 'd');
        //     }

        //     if (size) {
        //         if (list.length < size) {
        //             list = [];
        //             for (var i = size; i > 0; i--) {
        //                 list.push(moment2Str(moment(to).subtract(i, 'day'), '.', true));
        //             }                    
        //         }
        //     }

        //     return list;
        // }

        // function moment2Str (momentObj, separator, short) {
        //     var separator = separator || '-';
        //     var str = momentObj.year() + separator + ((momentObj.month()+1) >= 10 ? (momentObj.month()+1) : '0' + (momentObj.month()+1)) + separator + ((momentObj.date()) >= 10 ? (momentObj.date()) : '0' + (momentObj.date()))
        //     if (short == true) {
        //         // 没有对十月后的进行适应，先这样吧
        //         str = str.slice(6);
        //     }
        //     return str;
        // }

        // function countDays (from, now) {
        //     var i = 0;
        //     while (!from.isSame(now, 'day')) {
        //         i++;
        //         from = from.add(1, 'd');
        //     }
        //     console.log(i);
        //     return i;
        // }
    },

    renderHeader: function() { //渲染header
        var me = this,
            html = '';
        // coupon_show = me.cacheData.pageConfig.coupon.is_open || 0;

        var baseOrder = [{
            id: 'scene_hotel',
            title: '景酒日游专题',
            meeting: '景酒',
            activeDate: '2016-07-16'
        }, {
            id: 'baby',
            title: '亲子专题',
            meeting: '亲自',
            activeDate: '2016-07-17'
        }, {
            id: 'qixi',
            title: '七夕专题',
            meeting: '七夕',
            activeDate: '2016-07-18'
        }, {
            id: 'slow_life',
            title: '慢生活专题',
            meeting: '慢生活',
            activeDate: '2016-07-19'
        }, {
            id: 'olympic',
            title: '奥运专题',
            meeting: '奥运',
            activeDate: '2016-07-20'
        }, {
            id: 'scenic',
            title: '名胜古迹',
            meeting: '名胜',
            activeDate: '2016-07-21'
        }];

        var header = {
            dateScopes: [
                { 'from': '2016-07-12', 'to': '2016-07-18', 'img': '1.jpg' },
                { 'from': '2016-07-19', 'to': '2016-07-25', 'img': '2.jpg' },
                { 'from': '2016-07-26', 'to': '2016-08-02', 'img': '3.jpg' }
            ]
        };

        me.getNowTime({
            callback: function() {
                var now = moment.unix(me.cacheData.now);
                for (var i in header.dateScopes) {
                    if (isInDateScope(now, header.dateScopes[i].from, header.dateScopes[i].to)) {
                        console.log(header.dateScopes[i].img);
                        break;
                    }
                }
            }
        });

        html = Juicer($('#tpl-header').html(), {
            cacheData: me.cacheData
        });
        // if (coupon_show) {
        //     $(html).addClass('header-coupon_show');
        // }
        $('.J-placeholder-header').html(html);

        function isInDateScope(now, from, to) {
            var from = moment2Str(moment(from).subtract(1, 'day')),
                to = moment2Str(moment(to).add(1, 'day'));
            if (now.isBetween(from, to, 'day')) {
                return true;
            } else {
                return false;
            }
        }

        function moment2Str(momentObj, separator) {
            var separator = separator || '-'
            return momentObj.year() + separator + ((momentObj.month() + 1) >= 10 ? (momentObj.month() + 1) : '0' + (momentObj.month() + 1)) + separator + ((momentObj.date()) >= 10 ? (momentObj.date()) : '0' + (momentObj.date()))
        }

        return me;
    },

    renderSubSessionTab: function() {
        var me = this,
            html;
        html = Juicer($('#tpl-subSessionTab').html(), {
            cacheData: me.cacheData,
            activeInfo: ACTIVEINFO
        });
        $('.subSessionTab-wrap').html(html);
        return me;
    },

    renderPlayFlower: function() {
        var me = this,
            html;
        // banner = me.cacheData.pageConfig.banner || {},
        // banner_show = banner.pic && banner.pic.length ? 1 : 0;

        var bannerList = [
            { "mainTitle": "北京分会场", "subTitle": "我就是副标题", "url": "http://baidu.com" },
            { "mainTitle": "杭州分会场", "subTitle": "他就是副标题", "url": "http://baidu.com" },
            { "mainTitle": "美丽分会场", "subTitle": "谁就是副标题", "url": "http://baidu.com" }
        ];

        $('.J-placeholder-jumpBnr').remove();
        // if (me.cacheData.channel.name == 'map_scope' || !banner_show) {
        //     $('.J-placeholder-jumpBnr-rb').remove();
        //     return me;
        // }
        // 
        html = Juicer($('#tpl-playflower').html(), {
                cacheData: me.cacheData,
                activeInfo: ACTIVEINFO,
                bannerList: bannerList
            })
            // $('.J-placeholder-jumpBnr').html(html);
        $('.J-placeholder-playflower').html(html);
        return me;
    },
    renderProvinceSelect: function() { //渲染省份选择器 - 依赖地理位置
        var me = this,
            html = '';
        html = Juicer($('#tpl-provinceSelect').html(), {
            cacheData: me.cacheData
        });
        $(html).prependTo('body');
        return me;
    },
    renderFooter: function() { //渲染footer
        var me = this,
            html = '';

        html = Juicer($('#tpl-footer').html(), {
            cacheData: me.cacheData
        });
        $('.J-placeholder-footer').html(html);

        if (me.cacheData.pageConfig.btmBanner && me.cacheData.pageConfig.btmBanner.pic) {
            html = Juicer($('#tpl-btmBrn').html(), {
                cacheData: me.cacheData
            });
            $('.J-placeholder-btmBnr').html(html);
        }
        return me;
    },
    renderPageTab: function(opts) { //渲染页面导航
        var me = this,
            html;
        html = Juicer($('#tpl-pageTab').html(), {
            cacheData: me.cacheData,
            activeInfo: ACTIVEINFO
        });
        $('.J-placeholder-page-tab').html(html);
        return me;
    },
    pageTabItemShow: function(opts) { //页面导航项的显示
        var me = this,
            html,
            _settings = opts || {},
            $item = $('.J-page-tab li[data-name="' + _settings.name + '"]'),
            html = '';
        if ($item.length) {
            html = $item.html();
            html.length ? $item.removeClass('hide').addClass('show') : $item.removeClass('show').addClass('hide');
        }
        return me;
    },
    renderFlayer: function(opts) { //创建浮层
        var me = this,
            _settings = opts || {},
            is_show = _settings.is_show ? _settings.is_show : 0,
            html = Juicer($('#tpl-flayer').html(), {
                cacheData: me.cacheData,
                settings: _settings,
                activeInfo: ACTIVEINFO
            }),
            $html = $(html);

        if ($('.flayer-' + _settings.type).length) {
            if (_settings.type != 'domainList') { //省份列表不需要替换
                $('.flayer-' + _settings.type).replaceWith($html);
            }
        } else {
            $html.appendTo('body');
        }
        if (is_show) {
            setTimeout(function() {
                $('.flayer-' + _settings.type).removeClass('hide').addClass('show');
            }, 50);
            return me;
        }
        return me;
    },
    goToSection: function(opts) { //页面滚动
        var me = this,
            _settings = opts || {},
            _timer,
            top;
        if (_settings.item && $('.section-item-' + _settings.item).length) {
            top = $('.section-item-' + _settings.item).offset().top + 1;
            clearTimeout(me.cacheData._timer);
            me.cacheData._timer = setTimeout(function() {
                $('html,body').scrollTop(top);
            }, 100);
        }
        return me;
    },
    events: function() {
        var me = this,
            _params = $.extend({}, me.params),
            loadTimes = 0,
            $targetPlaceholder = $('.J-placeholder').eq(3),
            _scrollTimer = null,
            $win = $(window),
            winHeight = $win.height();

        if (me.isNuomiNa()) {
            _params['popRoot'] = 'no';
        }

        $(me).on('locationReady', function() { //地理位置信息已经 ready
            me.renderFlayer({
                type: 'domainList',
                flayerTitle: '选择你想出行的省份',
                is_show: me.gps_success == 0 ? 1 : 0 //定位失败时需要打开省份列表的浮层
            });
            $('.J-loading').text('正在检测登录状态');
            // Bridge.isLogin(function(status) { //检测登录状态
            me.is_login = 0;
            // me.is_login = status || 0;

            me.renderProvinceSelect()
                .loadDataRelyonLoc({
                    is_init: 1
                })
        }).on('dataLoaded', function(e, data) { //所有请求已加载完成
            var _data = data || {};
            me.pageTabItemShow(_data);
        }).on('mainMeetingBySidDataReady', function() { //分会场数据 ready
            // console.log('mainMeetingBySidDataReady');
            // me.cacheData.mainMeeting
            me.renderPageTab();
            $('.section-item').lazyelement({
                threshold: 200,
                supportAsync: !0,
                onScrollStop: function(element) {
                    var id = $(element).attr('id'),
                        sectionType = $(element).attr('section-type');

                    if (sectionType == 'mainMeeting') { //渲染分会场
                        me.renderMainMeeting(me.baseOrder_Key[id]);
                    } else if (sectionType == 'promotionList') {
                        me.renderPromotionList(me.baseOrder_Key[id]);
                    } else if (sectionType == 'fixPrice') {
                        me.renderFixprice(me.baseOrder_Key[id]);
                    }
                }
            });
        }).on('promotionListReady', function() { //爆款折扣渲染 ready
            console.log('promotionListReady');
            $('.section-item').lazyelement({
                threshold: 200,
                supportAsync: !0,
                onScrollStop: function(element) {
                    var id = $(element).attr('id'),
                        sectionType = $(element).attr('section-type');
                    if (sectionType == 'mainMeeting') { //渲染分会场
                        me.renderMainMeeting(me.baseOrder_Key[id]);
                    } else if (sectionType == 'promotionList') {
                        me.renderPromotionList(me.baseOrder_Key[id]);
                    } else if (sectionType == 'fixPrice') {
                        me.renderfixPrice(me.baseOrder_Key[id]);
                    }
                }
            });
        });

        // $(".img-box img").lazyload({
        //     threshold: 200,
        //     supportAsync: !0,
        //     dataAttribute: "src"
        // });

        $(window).on('scroll', function() { //页面内导航的显示/隐藏
            clearTimeout(_scrollTimer);
            _scrollTimer = setTimeout(function() {
                var scrollTop = $('body').scrollTop(),
                    targetTop = $targetPlaceholder.offset().top;
                $('.J-placeholder').each(function(index, item) {
                    var _top = $(item).offset().top;
                    if (_top - winHeight <= scrollTop) {
                        me.lazyLoadImg($(item)); //图片懒加载
                        me.lazyLoadImg($(item).next()); //图片懒加载
                        // return false;
                    }
                });
                if (scrollTop >= targetTop) {
                    $('.J-page-tab').addClass('active');
                    $('.J-btn-toTop').addClass('active');
                    return me;
                }
                $('.J-page-tab').removeClass('active');
                $('.J-btn-toTop').removeClass('active');
            }, 200);
        });

        $('body').on('tap', '.J-province-select', function() { //打开省份列表
            me.renderFlayer({
                type: 'domainList',
                is_show: 1
            });
        }).on('tap', '.province-li', function(e) { //省份切换
            var sid = $(this).data('sid');
            $('.province-li').removeClass('active');
            $(this).addClass('active');
            $('#J_cur-pro').html(me.cacheData.sname = $(this).data('sname'));
            me.cacheData.sid = sid || me.cacheData.sid;
            $('.J-flayer-close').trigger('tap');
            try {
                sessionStorage.setItem('sid', me.cacheData.sid);
            } catch (e) {

            }
            $('.section-item').unlazyelement();
            $('.section-item-inner').removeClass('hide').addClass('show');

            me.loadDataRelyonLoc();
        }).on('tap', '.J-btn-help', function() { //活动规则
            me.renderFlayer({
                type: 'help',
                is_show: 1
            });
        }).on('tap', '.coupon-item', function() { //领取优惠券
            var id = $(this).data('id');
            if (me.is_login != 1) { //未登录
                Bridge.toLogin({
                    success: function() {
                        location.reload();
                    }
                });
                return false;
            }
            if ($(this).hasClass('coupon-item-out') || $(this).hasClass('coupon-item-picked')) {
                return false;
            }
            me.getDiscount({
                id: id
            });
        }).on('tap', '.J-flayer-close', function() { //隐藏浮层
            $('.flayer').removeClass('show').addClass('hide');
        }).on('tap', '.J-btn-toTop', function() { //回到顶部
            $('.J-page-container').scrollTop(0);
            $('body').scrollTop(0);
        }).on('tap', '.J-link', function() { //进入自营团单页
            var webappUrl = $(this).attr('data-webappurl'),
                grounpon_id = $(this).attr('data-grounpon_id'),
                __params = $.extend({}, _params),
                _arr = [];

            for (var key in __params) {
                _arr.push(key + '=' + __params[key])
            }

            Bridge.pushWindow({
                nuomi: "bainuo://tuandetail?tuanid=" + grounpon_id,
                "nuomi-webapp": webappUrl + (/\?/i.test(webappUrl) ? '&' : '?') + _arr.join('&'),
                data: $.extend({}, _params)
            });
        }).on('tap', '.J-orderFill', function() { //进入门票填单页
            var td_id = $(this).data('td_id'),
                partner_id = $(this).data('partner_id'),
                productId = $(this).data('productid'),
                uid = $(this).data('uid'),
                scope_name = $(this).data('scope_name') || '';

            var scope_id = td_id,
                ticket_id = productId;

            Bridge.pushWindow({
                page: 'orderFill',
                data: {
                    nuomi: $.extend({
                        ticket_id: ticket_id,
                        td_id: td_id,
                        scope_id: scope_id,
                        partner_id: partner_id,
                        uid: uid
                    }, _params),
                    map: $.extend({
                        "param": '{"partner_id":"' + partner_id + '","scope_id":"' + scope_id + '","scope_name":"' + scope_name + '","ticket_id":"' + ticket_id + '","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"map_scope"}',
                        "popRoot": "no"
                    }, _params),
                    'nuomi-webapp': $.extend({
                        td_id: td_id,
                        partner_id: partner_id,
                        scope_id: scope_id,
                        ticket_id: ticket_id,
                        uid: uid
                    }, _params),
                    'map-webapp': $.extend({
                        partner_id: partner_id,
                        scope_id: scope_id,
                        ticket_id: ticket_id,
                        uid: uid
                    }, _params)
                }
            });
        }).on('tap', '.J-no-poi', function() { //无法进入 poi 详情页
            Bridge.toast('需升级至百度地图V9.2以上版本方可购买');
        }).on('tap', '.J-poi', function() { //进入poi详情页
            var uid = $(this).attr('data-uid') || '',
                qunar_id = $(this).attr('data-qunar_id') || '';

            Bridge.pushWindow({
                page: 'poiDetail',
                data: {
                    nuomi: $.extend({
                        td_id: qunar_id
                    }, _params),
                    map: $.extend({
                        uid: uid
                    }, _params),
                    'nuomi-webapp': $.extend({
                        td_id: qunar_id
                    }, _params),
                    'map-webapp': $.extend({
                        uid: uid,
                        qt: 'ninf',
                        industry: 'scope'
                    }, _params)
                }
            });
        }).on('tap', '.J-sku', function() { //进入sku详情页
            var src = $(this).attr('data-src'),
                ticket_id = $(this).attr('data-ticket_id'),
                qunar_id = $(this).attr('data-qunar_id'),
                ctrip_id = $(this).attr('data-ctrip_id');

            var scope_id = src == 'qunar' ? qunar_id : ctrip_id;

            var __params = $.extend({
                    pids: ticket_id,
                    ticket_id: ticket_id,
                    scope_id: scope_id,
                }, _params),
                _arr = [];

            for (var key in __params) {
                _arr.push(key + '=' + __params[key])
            }

            Bridge.pushWindow({
                nuomi: "bainuo://component?compid=lvyou&comppage=detail",
                "nuomi-webapp": 'http://lvyou.baidu.com/static/foreign/page/ticket/detail/detail.html?' + _arr.join('&'),
                "map-android": 'baidumap://map/component?comName=scenery&target=scenery_default_web_page_openapi&param={"page":"ticketDetailPage","title":"门票详情","pids":"' + ticket_id + '","scope_id":"' + scope_id + '","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"mapmap","is_miaosha":"1"}&ldata=' + me.params.ldata + '&mode=NORMAL_MODE&popRoot=no',
                "map-ios": 'baidumap://map/component?comName=scenery&target=scenery_default_web_page_openapi&param={"page":"ticketDetailPage","title":"门票详情","pids":"' + ticket_id + '","scope_id":"' + scope_id + '","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"mapmap","is_miaosha":"1"}&ldata=' + me.params.ldata + '&mode=NORMAL_MODE&popRoot=no',
                "map-webapp": 'http://map.baidu.com/mobile/webapp/scope/ticketDetail/qt=scope_getoneticket&src=qunar&' + _arr.join('&'),
                data: __params
            });
        }).on('tap', '.J-scenehotel', function() { //进入景酒详情页
            var id = $(this).attr('data-id');
            var __params = $.extend({
                    product_id: id
                }, _params),
                _arr = [];
            for (var key in __params) {
                _arr.push(key + '=' + __params[key])
            }
            Bridge.pushWindow({
                nuomi: "bainuo://component?compid=lvyou&comppage=sceneryhotel_detail",
                "nuomi-webapp": 'http://lvyou.baidu.com/static/foreign/page/sceneryhotel/detail/detail.html?' + _arr.join('&'),
                data: $.extend({
                    product_id: id
                }, _params)
            });
        }).on('tap', '.J-onedaytour', function() { //进入一日游详情页
            var id = $(this).attr('data-id');
            var __params = $.extend({
                    product_id: id
                }, _params),
                _arr = [];
            for (var key in __params) {
                _arr.push(key + '=' + __params[key])
            }
            Bridge.pushWindow({
                nuomi: "bainuo://component?compid=lvyou&comppage=travel_detail",
                "nuomi-webapp": 'http://lvyou.baidu.com/static/foreign/page/travel/detail/index.html?' + _arr.join('&'),
                data: $.extend({
                    product_id: id
                }, _params)
            });
        }).on('tap', '.J-page-tab li', function() { //页中导航 锚点
            var $link = $(this),
                href = $link.data('href'),
                name = $link.data('name'),
                $sectionItem, top;
            $sectionItem = $('.J-section-item-' + name);
            me.goToSection({
                item: name
            });
            $link.addClass('active').siblings('li').removeClass('active');
        }).on('tap', '.J-jumpBnr', function() { //banner位点击
            var link = $(this).data('link');
            if (link.length == 0) {
                return me;
            }
            Bridge.pushWindow({
                nuomi: "bainuo://component?a=1&url=" + encodeURIComponent(link),
                "nuomi-webapp": link,
                "map-webapp": link,
                "map-ios": link,
                "map-android": link
            });
        }).on('tap', '[tab-for]', function() { //tab 切换
            var tabId = $(this).attr('tab-for'),
                tabRel = $(this).attr('tab-relFor');
            $('[tab-rel="' + tabRel + '"]').removeClass('show').addClass('hide');
            $('[tab-id="' + tabId + '"]').removeClass('hide').addClass('show')
        }).on('tap', '.subSessionTab-btn', function() {
            $('.subSessionTab').addClass('active');
        }).on('tap', '.subSessionTab .close-btn', function() {
            $('.subSessionTab').removeClass('active');
        });

        return this;
    }
};

(function() { //获取文案配置

    App.init();

    var baseSize = 16,
        baseWidth = 320,
        width = $('body').width(),
        size = baseSize;
    size = baseSize * width / baseWidth;
    $('html').css({
        'font-size': size + 'px'
    });

    $(window).on('resize', function() {
        width = $('body').width();
        size = baseSize * width / baseWidth;
        $('html').css({
            'font-size': size + 'px'
        });
    });
})();
