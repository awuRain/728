var $ = require('zepto');
require('../../widgets/lazyload/lazyload.js');
require('../../widgets/lazyelement/lazyelement.js');
var Bridge = require('Bridge');
var Juicer = require('juicer');
var pblog = require('../../widgets/pblog-webapp/pblog-webapp.js');
var CountDown = require('../../widgets/countdown/countdown.js');
var lite = require('../../widgets/lite/lite.js');
var moment = require('moment');
var PROVINCELIST = require('promotion_list.js');
var DOMAINORDER = require('domain_order.js');

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
Juicer.register('Math', Math);

var cloudy = [ //rd 肥家了 我来组成 cloudy 该数组用来记录需要排除的团单id

];

// 日期格式化
var dateFomat = function(date) {
    if (date) {
        return date.slice(6).replace('-', '.');
    }
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

            me.cacheData.channel = me.cacheData.channel || {};
            me.cacheData.channel.name = me.params.na_from || 'nuomi';

            if (location.host == 'map.baidu.com' || me.params.na_from == 'map_scope') {
                me.cacheData.channel.name = 'map_scope';
            } else if (location.host == 'lvyou.baidu.com' || me.params.na_from == 'nuomi') {
                me.cacheData.channel.name = 'nuomi';
            } else {
                me.cacheData.channel.name = 'nuomi';
            }

            me.cacheData.provinceList = $.extend({}, PROVINCELIST);
            me.cacheData.domainOrder = $.extend({}, DOMAINORDER);

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
        type: 'poi',
        dependOnLoc: 1
    }, {
        id: 'fixPrice',
        title: '爆款折扣',
        activeDate: '2016-07-17',
        endDate: '2016-07-20',
        attrs: {
            'section-type': 'fixPrice'
        },
        type: 'orderFill',
        dependOnLoc: 1
    }, {
        id: 'hotRanking',
        title: '本地热销',
        attrs: {
            'section-type': 'hotRanking'
        },
        type: 'link',
        cardNum: 6,
        orderFor: 'nuomi',
        dependOnLoc: 1
    }, {
        id: 'mainMeeting',
        title: '嗨翻出游主题趴',
        orderFor: 'nuomi',
        dependOnLoc: 1
    }, {
        id: 'playflower',
        title: '热门城市玩花样',
        attrs: {
            'section-type': 'playflower'
        },
        orderFor: 'nuomi',
        dependOnLoc: 0
    }, {
        id: 'playflower2',
        title: '热门城市玩花样2',
        attrs: {
            'section-type': 'playflower2'
        },
        orderFor: 'nuomi',
        dependOnLoc: 0
    }, {
        id: 'promotionIndex',
        title: 'promotionIndex',
        attrs: {
            'section-type': 'promotionIndex'
        },
        type: 'poi',
        cardNum: 10,
        orderFor: 'map_scope',
        dependOnLoc: 1
    }, {
        id: 'ticket',
        title: 'ticket',
        attrs: {
            'section-type': 'ticket'
        },
        type: 'poi',
        cardNum: 10,
        orderFor: 'map_scope',
        dependOnLoc: 1
    }, {
        id: 'foreign',
        title: 'foreign',
        attrs: {
            'section-type': 'foreign'
        },
        type: 'sku',
        cardNum: 10,
        orderFor: 'map_scope',
        dependOnLoc: 0
    }, {
        id: 'ctrip',
        title: 'ctrip',
        attrs: {
            'section-type': 'ctrip'
        },
        type: 'sku',
        cardNum: 10,
        orderFor: 'map_scope',
        dependOnLoc: 0
    }],
    mainMeetingOrder: [{
        id: 'scenic',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'poi'
    }, {
        id: 'slow_life',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }, {
        id: 'baby',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }, {
        id: 'qixi',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }, {
        id: 'scene_hotel',
        attrs: {
            'section-type': 'mainMeeting'
        }
    }, {
        id: 'holiday',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }, {
        id: 'water',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }, {
        id: 'olympic',
        attrs: {
            'section-type': 'mainMeeting'
        },
        type: 'link'
    }],
    setLayoutData: function(opts) { //组织分会场顺序
        var me = this,
            _item, pageConfigItem, _activeDate, _cardNum;

        me.baseOrder_Key = {};

        me.mainMeetingOrder_cp = $.extend([], me.mainMeetingOrder);

        me.baseOrder = me.baseOrder.filter(function(item, index) {
            if (!item.orderFor || item.orderFor == me.cacheData.channel.name) {
                me.baseOrder_Key[item.id] = item;
                return item;
            }
        });

        if (me.cacheData.channel.name == 'map_scope') {
            me.mainMeetingOrder.length = 0;
            me.mainMeetingOrder_cp.length = 0;
            return me;
        }

        // 预热期结束后 修改分会场卡片数量为10
        if (me.cacheData.now >= new Date(me.cacheData.pageConfig.mainMeeting.introEndDate) - 0) {
            _cardNum = 10;
        } else {
            _cardNum = 6;
        }

        me.mainMeetingOrder.forEach(function(item, index) {
            item = $.extend(item, me.cacheData.pageConfig[item.id]); //用 pageConfig 覆盖默认配置
            item.cardNum = _cardNum;
            me.baseOrder_Key[item.id] = item;
        });

        var theTopMeeting = me.mainMeetingOrder.filter(function(item, index) {
            pageConfigItem = me.cacheData.pageConfig[item.id] || {};
            _activeDate = pageConfigItem.activeDate;

            if (me.cacheData.now >= new Date(_activeDate)) {
                item.index = index;
                return item;
            }
        });
        theTopMeeting = theTopMeeting[theTopMeeting.length - 1];

        if (theTopMeeting) {
            me.mainMeetingOrder.splice(theTopMeeting.index, 1);
            me.mainMeetingOrder.unshift($.extend(theTopMeeting, {
                cardNum: 10,
                className: 'section-item-top'
            }));
        }

        return me;
    },
    renderLayout: function(opts) { //渲染各会场layout
        var me = this,
            tpl = me.tpl_layout || $('#tpl-layout').html(),
            _settings = opts || {},
            arr_innerHtml = [],
            html = '',
            _item, _arr_innerHtml, pageConfigItem, cacheData_id, cacheData_id_sid, cacheData_id_sid_list, _start_time, _end_time;

        me.tpl_layout = tpl;

        me.mainMeetingOrder_cp = $.extend([], me.mainMeetingOrder);
        for (var i = 0, len = me.baseOrder.length; i < len; i++) { //组织主会场基本模块 layout
            _item = $.extend(me.baseOrder[i]);
            !me.baseOrder_Key[_item.id] && (me.baseOrder_Key[_item.id] = _item);
            _item.className = _item.className ? _item.className + ' J-section-item-loc' : ' J-section-item-loc';
            _arr_innerHtml = [];
            pageConfigItem = me.cacheData.pageConfig[_item.id] || {};

            if (_item.id == 'promotionList' || _item.id == 'fixPrice') {
                cacheData_id = me.cacheData[_item.id] || {};
                cacheData_id_sid = cacheData_id[me.cacheData.sid] || {};
                cacheData_id_sid_list = cacheData_id_sid.list || [];

                //缓存的数据不存在或列表为空
                if ($.isEmptyObject(cacheData_id_sid) || !cacheData_id_sid_list.length) {
                    continue;
                }
                //8.6模块
                if (_item.id == 'fixPrice') {
                    pageConfigItem.is_open = 1;
                    if (cacheData_id_sid_list.length == 0 || pageConfigItem.is_open != 1) { //数据为空时不展示8.6模块
                        continue;
                    }
                }
                //折扣限量抢
                if (_item.id == 'promotionList') {
                    if (cacheData_id_sid_list.length == 0) { //数据为空时不展示折扣限量抢
                        continue;
                    }
                    if (cacheData_id_sid_list[0] && cacheData_id_sid_list[0].poi_list && cacheData_id_sid_list[0].poi_list.length == 0) { //数据为空时不展示折扣模块
                        continue;
                    }
                    if (cacheData_id_sid_list[1] && cacheData_id_sid_list[1].poi_list && cacheData_id_sid_list[1].poi_list.length == 0) { //数据为空时不展示折扣模块
                        continue;
                    }
                    _item.discount = cacheData_id_sid_list[0].discount * 10 || '';
                    _item.className = _item.className ? (_item.className + ' section-item-' + _item.id + '-' + _item.discount) : (' section-item-' + _item.id + '-' + _item.discount);
                }
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

        if ($('.J-section-item-loc').length) {
            $('<div class="J-placeholder-layout" />').insertAfter($('.J-section-item-loc').eq(0));
            $('.J-section-item-loc').remove();
        }

        if ($.trim(html).length) {
            $('.J-placeholder-layout').replaceWith(html);
            _settings.callback && _settings.callback();
            // setTimeout(function() { //手动触发一下分会场模块的渲染
            //     $(window).trigger('scroll');
            // }, 500);
        }

        // arr_innerHtml.length = 0;

        if (me.isLazyload) {
            return me;
        }
        $(".pic").lazyload({
            threshold: 200,
            supportAsync: !0,
            dataAttribute: "src",
            isBackground: 1
        });
        me.isLazyload = 1;

        return me;
    },
    renderMainMeetingLayout: function(opts) { //渲染各专场layout
        var me = this,
            _settings = opts || {},
            list = [],
            current = me.cacheData.mainMeeting[me.cacheData.sid],
            _arr_innerHtml = [],
            pageConfigItem;

        me.mainMeetingOrder.forEach(function(item, index) { //按照分会场指定顺序筛选需要显示的区块
            if (current[item.id] && current[item.id].list.length) {
                list.push(item);
            }
        });

        me.cacheData.currentOrder = list;

        _arr_innerHtml.push('<div class="J-placeholder J-placeholder-page-tab"></div>');

        me.cacheData.currentOrder.forEach(function(item, index) { //组织分会场
            item.className = item.className ? item.className + ' section-item-inner' : ' section-item-inner';
            _arr_innerHtml.push(me.createSection(item));
        });

        $('.J-placeholder-mainMeeting').html(_arr_innerHtml.join(''));

        me.renderPageTab();

        _settings.callback && _settings.callback();

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

        window.configReady = function(res) { //文案配置 ready 后
            me.cacheData.pageConfig = res || {};
            me.getNowTime().then(function() {
                me.cacheData = me.getCacheDataFromSession();
                me.setLayoutData();
                me.renderBase();
                me.initReady({
                    pageConfig: res || PAGETEXT,
                    is_init: 1
                });
            });
            if (me.cacheData.channel.name == 'map_scope') {
                me.getMapDisCountStatus();
            }
            deferred.resolve();
        };

        $.getJSON('http://lvyou.baidu.com/event/s/728_promotion/config-' + me.cacheData.channel.name + '.js?callback=?', {
            t: T
        });

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

        me.cacheData.Math = Math;
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
    createSoftImg: function(wrap, callback) { //根据容器尺寸创建自适应居中的图片
        var me = this;

        $(wrap).find('.img-wrap').each(function(index, item) {
            var $img = $(item).find('img'),
                url = $img.attr("data-src"),
                tempPic = new Image();

            if ($img.attr('src').length) {
                return me;
            }

            tempPic.onload = function() {
                var tempObj = {
                    width: tempPic.width,
                    height: tempPic.height
                };

                $img.replaceWith(lite.createImage(false, url, tempObj.width, tempObj.height, $(item).width() + 1, $(item).height(), false, true));
            };

            tempPic.src = url;
        });

        callback && callback();

        return me;
    },
    reSizeImg: function(opts) {
        var me = this,
            _settings = opts || {},
            type = _settings.type || 'promotionList';

        if (type == 'promotionList') {
            data = me.cacheData.promotionList[me.cacheData.sid] || {};
            data = data.list || [];
            $.each((data[0] || {}).poi_list || [], function(index, item) {
                item['pic_url'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=210&height=206&quality=100&align=middle,middle&src=' + item['pic_url'];
            });
            $.each((data[1] || {}).poi_list || [], function(index, item) {
                item['pic_url'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=210&height=206&quality=100&align=middle,middle&src=' + item['pic_url'];
            });
        } else if (type == 'fixPrice') {
            data = me.cacheData.fixPrice[me.cacheData.sid] || {};
            data = data.list || [];
            $.each((data[0] || {}).sku_list || [], function(index, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=210&height=206&quality=100&align=middle,middle&src=' + item['pic'];
            });
            $.each((data[1] || {}).sku_list || [], function(index, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=210&height=206&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'mainMeeting') {
            data = me.cacheData.mainMeeting[me.cacheData.sid] || {};
            $.each(data, function(id, item) {
                $.each(item.list || [], function(index, card) {
                    card['pic'] && (card['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + card['pic']);
                    card['image'] && (card['image'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + card['image']);
                    card['pic_url'] && (card['pic_url'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + card['pic_url']);
                });
            });
        } else if (type == 'ctrip') {
            data = me.cacheData.ctrip[me.cacheData.sid] || {};
            data = data['pn' + data.pn] || {};
            $.each(data.list || [], function(id, item) {
                item['picUrl'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + item['picUrl'];
            });
        } else if (type == 'foreign') {
            data = me.cacheData.foreign[me.cacheData.sid] || {};
            data = data['pn' + data.pn] || {};
            $.each(data.list || [], function(id, item) {
                item['picUrl'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + item['picUrl'];
            });
        } else if (type == 'promotionIndex') {
            data = me.cacheData.promotionIndex[me.cacheData.sid] || {};
            data = data['pn' + data.pn] || {};
            data = data.promotionList || {};
            $.each(data.list || [], function(id, item) {
                item['picUrl'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=712&height=266&quality=100&align=middle,middle&src=' + item['picUrl'];
            });
        } else if (type == 'ticket') {
            data = me.cacheData.ticket[me.cacheData.sid] || {};
            data = data['pn' + data.pn] || {};
            $.each(data.list || [], function(id, item) {
                item['pic'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + item['pic'];
            });
        } else if (type == 'hotRanking') {
            data = me.cacheData.hotRanking[me.cacheData.sid] || {};
            data = data['pn' + data.pn] || {};
            $.each(data.list || [], function(id, item) {
                item['groupon_tiny_image'] = 'http://webmap1.map.bdimg.com/maps/services/thumbnails?width=320&height=240&quality=100&align=middle,middle&src=' + item['groupon_tiny_image'];
            });
        }

        return me;
    },
    share: function() {
        var me = this,
            url = Bridge.host + '/event/s/728_promotion/index/?fr=wechat';
        if (me.cacheData.channel.name == 'map_scope') {
            url = 'http://map.baidu.com/fwmap/upload/728_promotion/index/?na_from=map_scope&fr=wechat';
            // url = Bridge.host + '/event/s/728_promotion/index/?na_from=map_scope&fr=wechat';
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

        var session_cacheStr = sessionStorage.getItem('me.cacheData.' + me.cacheData.channel.name) || '',
            cacheData = session_cacheStr.length ? $.parseJSON(session_cacheStr) : {},
            cacheNow_time = new Date(cacheData.now),
            rightNow_time = new Date(me.cacheData.now);

        if (cacheData.now) {
            //1小时内多次打开页面时,使用缓存过的数据
            if ((rightNow_time - cacheNow_time) / 1000 / 60 / 60 <= 1) {
                // me.cacheData = cacheData;
            }
        }

        return me.cacheData;
    },
    setCacheDataToSession: function() { //将缓存数据存入 session 中
        var me = this;

        setTimeout(function() {
            sessionStorage.setItem('me.cacheData.' + me.cacheData.channel.name, JSON.stringify(me.cacheData));
        }, 0);

        return me.cacheData;
    },
    getDomainList: function() { //获取省份/城市列表
        var me = this;

        $('.J-loading').text('正在拉取省份列表...');

        me.cacheData.domainList = { city: {}, province: {} };
        me.cacheData.domainOrder.city.forEach(function(item, index) {
            for (var sid in item) {
                me.cacheData.domainList.city[sid] = item[sid];

            }
        });
        me.cacheData.domainOrder.province.forEach(function(item, index) {
            for (var sid in item) {
                me.cacheData.domainList.province[sid] = item[sid];
            }
        });
        me.setCacheDataToSession();
        me.renderDomainList();

        return me;
    },
    renderDomainList: function() { //渲染省份/城市列表
        var me = this,
            _sid = sessionStorage.getItem('sid') || '',
            _province_sid = sessionStorage.getItem('province_sid') || '',
            _city_sid = sessionStorage.getItem('city_sid') || '',
            _sname,
            _city_code,
            _cityid = me.dasouParams.cityid || '',
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
                    me.cacheData.province_sid = DEFAULTACTIVEINFO.sid;
                    me.cacheData.city_sid = DEFAULTACTIVEINFO.sid;
                } else { //gps 定位成功
                    me.cacheData.gps_success = 1;
                    me.cacheData.gps_sid = _settings.sid;
                    me.cacheData.gps_sname = _settings.sname;
                    me.cacheData.province_sid = _settings.province_sid;
                    me.cacheData.city_sid = _settings.city_sid;
                }
                me.cacheData.sid = me.cacheData.gps_sid;
                me.cacheData.sname = me.cacheData.gps_sname;
                me.cacheData.city_code = me.cacheData.provinceList[me.cacheData.province_sid].city_code;
                me.cacheData.cityid = me.cacheData.provinceList[me.cacheData.province_sid].cityid;

                me.cacheData.isHotCity = _settings.city_sid in me.cacheData.domainList.city ? 1 : 0; //标记当前位置是否在热门城市列表中

                me.setCacheDataToSession();

                try {
                    if (!me.dasouParams.cityid) {
                        sessionStorage.setItem('sid', me.cacheData.sid);
                        sessionStorage.setItem('province_sid', me.cacheData.province_sid);
                        sessionStorage.setItem('city_sid', me.cacheData.city_sid);
                    }
                } catch (e) {
                    console.warn(e);
                }

                $(me).trigger('locationReady');

                _times++;
            },
            _timeout,
            _times = 0;

        $('.J-loading').text('正在获取当前位置...');

        if (me.cacheData.domainOrder.cityidKey[_cityid]) { //通过大搜推广进入页面
            _fun({
                sid: me.cacheData.domainOrder.cityidKey[_cityid].sid,
                sname: me.cacheData.domainOrder.cityidKey[_cityid].sname,
                province_sid: me.cacheData.domainOrder.cityidKey[_cityid].sid,
                city_sid: me.cacheData.domainOrder.cityidKey[_cityid].sid
            });
            return me;
        }

        if (_sid.length) {
            if (_sid in me.cacheData.domainList.city) {
                _sname = me.cacheData.domainList.city[_sid].city;
                _province_sid = me.cacheData.domainList.city[_sid].province_sid;
                _city_sid = _sid;
            } else if (_sid in me.cacheData.domainList.province) {
                _sname = me.cacheData.domainList.province[_sid];
                _province_sid = _sid;
                _city_sid = _city_sid;
            }

            _fun({
                sid: _sid,
                sname: _sname,
                province_sid: _province_sid,
                city_sid: _city_sid
            });
            return me;
        }

        _timeout = setTimeout(function() {
            clearTimeout(_timeout);

            _fun({
                sid: '',
                sname: '',
                province_sid: '',
                city_sid: ''
            });

            console.warn('getProvinceSid 超时 将已北京作为默认省份');
        }, 5000);

        Bridge.getCityProvince(function(data) { //获取当前位置的城市/省份信息
            clearTimeout(_timeout);
            if (data) {
                me.cacheData.gps_city = $.extend({}, data.city);
                me.cacheData.gps_province = $.extend({}, data.province);

                if (me.cacheData.gps_city.sid in me.cacheData.domainList.city) { //当前位置在城市列表中
                    _sid = me.cacheData.gps_city.sid;
                    _sname = me.cacheData.gps_city.sname;
                    _province_sid = me.cacheData.gps_province.sid;
                    _city_sid = _sid;
                } else if (me.cacheData.gps_province.sid in me.cacheData.domainList.province) { //当前位置在省份列表中
                    _sid = me.cacheData.gps_province.sid;
                    _sname = me.cacheData.gps_province.sname;
                    _province_sid = _sid;
                    _city_sid = me.cacheData.gps_city.sid;
                }
            } else {
                _sid = '';
                _sname = '';
                _province_sid = '';
                _city_sid = '';
            }
            _fun({
                sid: _sid,
                sname: _sname,
                province_sid: _province_sid,
                city_sid: _city_sid
            });
        });
        return me;
    },
    loadDataRelyonLoc: function(opts) { //加载基于地理位置的模块
        var me = this,
            _settings = opts || {};
        setTimeout(function() {
            me.getPromotionList().always(function() {
                me.getFixprice()
            });
        }, 50)

        return me;
    },
    getFixprice: function() { //获取8.6爆款折扣
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                setTimeout(function() {
                    $(me).trigger('fixPriceDataReady');
                }, 0);

                deferred.resolve();
            };

        me.cacheData.fixPrice = me.cacheData.fixPrice || {};
        me.cacheData.fixPrice[me.cacheData.sid] = me.cacheData.fixPrice[me.cacheData.sid] || null;

        if (me.cacheData.fixPrice[me.cacheData.sid]) {
            _dataReady();
            return deferred;
        }

        Bridge.Loader.get({
            // url: Bridge.host + '/business/ajax/promotion/getfixprice/',
            url: 'http://cp01-lvyou-rd-shahe.epc.baidu.com:8080/business/ajax/promotion/getfixprice/',
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

                me.reSizeImg({
                    type: 'fixPrice'
                });

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
    renderFixprice: function(opts) { //渲染8.6爆款折扣
        var me = this,
            tpl = me.tpl_fixPrice || $('#tpl-fixPrice').html(),
            _settings = opts || {},
            createFlag = function(status) {
                var text, className;
                if (status == 2) {
                    text = '即将开始';
                    className = 'flag-comming';
                } else if (status == 1) {
                    text = '8.6特价';
                    className = 'flag-discount';
                } else if (status == 0) {
                    text = '抢购结束';
                    className = 'flag-past';
                } else {
                    return
                }
                return '<em class="' + className + '">' + text + '</em>'
            },
            html = '',
            fixPrice = me.cacheData.fixPrice || {},
            fixPrice_sid = fixPrice[me.cacheData.sid] || {},
            fixPrice_sid_list = fixPrice_sid.list || [],
            show_tabNum = 0,
            active_tab1 = 1,
            active_tab2 = 0,
            tab1 = {},
            tab2 = {};

        me.tpl_fixPrice = tpl;

        if (fixPrice_sid_list.length == 2) {
            active_tab2 = me.cacheData.now >= fixPrice_sid_list[0].sku_list[0].daily_start_time * 1000 ? 1 : 0;
        } else if (fixPrice_sid_list.length == 1) {
            active_tab2 = 0;
        }
        active_tab1 = !active_tab2;

        if (fixPrice_sid_list.length >= 1) {
            show_tabNum++;
            tab1 = {
                id: fixPrice_sid_list[0].sku_list[0].daily_start_time,
                rel: fixPrice_sid_list[0].sku_list[0].daily_start_time,
                html: me.createTicketList({
                    renderFor: _settings.id,
                    type: me.baseOrder_Key[_settings.id]['type'],
                    direction: 'horizontal',
                    data: fixPrice_sid_list[0].sku_list,
                    discount: fixPrice_sid_list[0].discount,
                    attrs: {
                        'tab-id': fixPrice_sid_list[0].sku_list[0].daily_start_time,
                        'tab-rel': fixPrice_sid_list[0].sku_list[0].daily_start_time,
                        'style': 'display:' + (active_tab1 ? 'block' : 'none')
                    },
                    createFlag: createFlag
                })
            };
        }

        if (fixPrice_sid_list.length == 2) {
            show_tabNum++;
            tab2 = {
                id: fixPrice_sid_list[1].sku_list[0].daily_start_time,
                rel: fixPrice_sid_list[0].sku_list[0].daily_start_time,
                html: me.createTicketList({
                    renderFor: _settings.id,
                    type: me.baseOrder_Key[_settings.id]['type'],
                    data: fixPrice_sid_list[1].sku_list,
                    discount: fixPrice_sid_list[0].discount,
                    attrs: {
                        'tab-id': fixPrice_sid_list[1].sku_list[0].daily_start_time,
                        'tab-rel': fixPrice_sid_list[0].sku_list[0].daily_start_time,
                        'style': 'display:' + (active_tab2 ? 'block' : 'none')
                    },
                    createFlag: createFlag
                })
            };
        }

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                tab1: tab1,
                tab2: tab2
            })
        });

        $('.J-placeholder-' + _settings.id).html(html);

        me.createSoftImg($('.J-placeholder-' + _settings.id).find('.BN-list ul').eq(active_tab1 ? 0 : 1));

        $('.J-loading').removeClass('show').addClass('hide');

        return me;
    },
    // renderFixprice: function(opts) { //渲染8.6爆款折扣
    //     var me = this,
    //         tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
    //         _settings = opts || {},
    //         html = '',
    //         fixPrice = me.cacheData.fixPrice || {},
    //         fixPrice_sid = fixPrice[me.cacheData.sid] || {},
    //         _start_time = fixPrice_sid.start_time ? fixPrice_sid.start_time * 1000 : 0,
    //         _end_time = fixPrice_sid.end_time ? fixPrice_sid.end_time * 1000 : 0;
    //     // if ($.isEmptyObject(fixPrice_sid) || fixPrice_sid.list.length == 0 || (me.cacheData.now < _start_time && me.cacheData.now >= _end_time) || !_start_time || !_end_time) {
    //     //     $('#' + _settings.id).removeClass('show').addClass('hide');
    //     //     !$('.J-placeholder-' + _settings.id + '-empty').length && $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
    //     //     return me;
    //     // }

    //     me.tpl_mainMeeting = tpl;

    //     html = Juicer(tpl, {
    //         cacheData: me.cacheData,
    //         data: $.extend({}, {
    //             id: _settings.id,
    //             colsNum: 1,
    //             list: {
    //                 id: _settings.id,
    //                 html: me.createTicketList({
    //                     renderFor: _settings.id,
    //                     type: _settings['type'],
    //                     cardNum: _settings['cardNum'],
    //                     // direction: 'vertical',
    //                     data: fixPrice_sid.list || [],
    //                     createFlag: function(status) {
    //                         var text, className;
    //                         if (status == 2) {
    //                             text = '即将开始';
    //                             className = 'flag-comming';
    //                         } else if (status == 1) {
    //                             text = '8.6特价';
    //                             className = 'flag-discount';
    //                         } else if (status == 0) {
    //                             text = '抢购结束';
    //                             className = 'flag-past';
    //                         } else {
    //                             return
    //                         }
    //                         return '<em class="' + className + '">' + text + '</em>'
    //                     }
    //                 })
    //             }
    //         })
    //     });

    //     $('.J-placeholder-' + _settings.id).html(html);
    //     // $('#' + _settings.id).removeClass('hide').addClass('show');
    //     me.createSoftImg($('.J-placeholder-' + _settings.id));
    //     // $('.J-placeholder-' + _settings.id + '-empty').remove();

    //     return me;
    // },
    getPromotionList: function() { //获取爆款折扣列表
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                $(me).trigger('promotionListReady');
                deferred.resolve();
            };

        me.cacheData.promotionList = me.cacheData.promotionList || {};
        me.cacheData.promotionList[me.cacheData.sid] = me.cacheData.promotionList[me.cacheData.sid] || null;

        // if (me.cacheData.promotionList[me.cacheData.sid]) {
        //     _dataReady();
        //     return deferred;
        // }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/promotion/getdiscountbuying',
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

                me.reSizeImg({
                    type: 'promotionList'
                });

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
    renderPromotionList: function(opts) { //渲染爆款折扣列表
        var me = this,
            tpl = me.tpl_promotionList || $('#tpl-promotionList').html(),
            _settings = opts || {},
            createFlag = function(status, discount) {
                discount *= 10;
                var text, className;
                if (status == 0) {
                    text = '即将开始';
                    className = 'flag-comming';
                } else if (status == 1) {
                    text = discount + '折抢购中';
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
            active_tab1, active_tab2, html;
        me.tpl_promotionList = tpl;

        // if (promotionList_sid_list.length == 0) {
        //     $('#' + _settings.id).removeClass('show').addClass('hide');
        //     !$('.J-placeholder-' + _settings.id + '-empty').length && $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter($('#' + _settings.id));
        //     return me;
        // }

        if (!promotionList_sid_list[1]) {
            $('#' + _settings.id).remove();
            return me;
        }

        active_tab2 = me.cacheData.now >= promotionList_sid_list[1].start_time * 1000 ? 1 : 0;
        active_tab1 = !active_tab2;

        if (promotionList_sid_list[0].status == 1) {
            active_tab2 = 0;
            active_tab1 = 1;
        } else if (promotionList_sid_list[1].status == 0) {
            active_tab2 = 1;
            active_tab1 = 0;
        }

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                tab1: {
                    id: promotionList_sid_list[0].start_time,
                    rel: promotionList_sid_list[0].start_time,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: me.baseOrder_Key[_settings.id]['type'],
                        direction: 'horizontal',
                        data: promotionList_sid_list[0].poi_list,
                        discount: promotionList_sid_list[0].discount,
                        attrs: {
                            'tab-id': promotionList_sid_list[0].start_time,
                            'tab-rel': promotionList_sid_list[0].start_time,
                            'style': 'display:' + (active_tab1 ? 'block' : 'none')
                        },
                        flags: [
                            createFlag(promotionList_sid_list[0].status, promotionList_sid_list[0].discount)
                        ]
                    })
                },
                tab2: {
                    id: promotionList_sid_list[1].start_time,
                    rel: promotionList_sid_list[0].start_time,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: me.baseOrder_Key[_settings.id]['type'],
                        data: promotionList_sid_list[1].poi_list,
                        discount: promotionList_sid_list[0].discount,
                        attrs: {
                            'tab-id': promotionList_sid_list[1].start_time,
                            'tab-rel': promotionList_sid_list[0].start_time,
                            'style': 'display:' + (active_tab2 ? 'block' : 'none')
                        },
                        flags: [
                            createFlag(promotionList_sid_list[1].status, promotionList_sid_list[1].discount)
                        ]
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);

        me.createSoftImg($('.J-placeholder-' + _settings.id).find('.BN-list ul').eq(active_tab1 ? 0 : 1));

        $('.J-loading').removeClass('show').addClass('hide');

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
                cardNum: _settings.cardNum || 6,
                renderFor: _settings.renderFor || '',
                createFlag: _settings.createFlag,
                discount: _settings.discount || 1,
                is_sale: _settings.is_sale || 0,
                cloudy: cloudy || []
            });
        me.tpl_ticketList = tpl;
        return html;
    },
    getMainMeeting: function() { //获取全量的分会场数据
        var me = this,
            deferred = $.Deferred(),
            _dataReady = function() {
                setTimeout(function() {
                    $(me).trigger('mainMeetingBySidDataReady');
                }, 0);
                deferred.resolve();
            };

        me.cacheData.mainMeeting = me.cacheData.mainMeeting || {};

        if (me.cacheData.mainMeeting[me.cacheData.sid]) {
            _dataReady();
            deferred.resolve();
            return false;
        }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/promotion/getmainmeetingdata/',
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

                me.reSizeImg({
                    type: 'mainMeeting'
                });

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
            mainMeeting_sid = mainMeeting[me.cacheData.sid] || {},
            mainMeeting_sid_id = mainMeeting_sid[_settings.id] || {};

        if ($.isEmptyObject(mainMeeting_sid_id) || mainMeeting_sid_id.list.length == 0) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            // !$('.J-placeholder-' + _settings.id + '-empty').length && $('.J-placeholder-' + _settings.id + '-empty').insertAfter($('#' + _settings.id));
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: mainMeeting_sid_id.list || [],
                        createFlag: function(renderFor) {
                            var text, className;

                            if (me.cacheData.pageConfig.showFlagDiscount != 1) {
                                return;
                            }
                            text = '随机立减';
                            // if (renderFor == 'scene_hotel') {
                            //     text = '热销';
                            // } else {
                            //     if (me.cacheData.pageConfig.showFlagDiscount != 1) {
                            //         return;
                            //     }
                            //     text = '随机立减';
                            // }
                            className = 'flag-discount';
                            return '<em class="' + className + '">' + text + '</em>'
                        }
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        me.createSoftImg($('.J-placeholder-' + _settings.id));
        // $('.J-placeholder-' + _settings.id + '-empty').remove();

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
                    data: $.extend({}, res.data, { "id": _settings.id }),
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
                    activity_name: 'summer'
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
                    activity_name: 'summer'
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
                activity_name: 'summer'
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
        var me = this,
            _item,
            isListEmpty = 1,
            pageConfig_id,
            pageConfig_id_list;

        var noLocOrder = me.baseOrder.filter(function(item, index) { //选出不依赖定位的数据模块
            if (item.dependOnLoc != 1) {
                return item;
            }
        });
        var _baseOrder = me.baseOrder.filter(function(item, index) { //选出依赖定位的数据模块
            if (item.dependOnLoc == 1) {
                return item;
            }
        });
        me.baseOrder = $.extend([], _baseOrder);
        noLocOrder.forEach(function(item, index) {
            pageConfig_id = me.cacheData.pageConfig[item.id] || {};
            pageConfig_id_list = pageConfig_id.list || [];
            isListEmpty = 1;

            for (var i = 0, len = pageConfig_id_list.length; i < len; i++) {
                _item = pageConfig_id_list[i];
                if (_item.pic.length > 0 && _item.link.length > 0) {
                    isListEmpty = 0;
                    break;
                }
            }
            if (item.id == 'foreign' || item.id == 'ctrip') {
                isListEmpty = 0;
            }

            !isListEmpty && $(Juicer($('#tpl-layout').html(), { //填充不依赖地理位置的模块 layout
                cacheData: me.cacheData,
                data: {
                    layout: me.createSection(item)
                }
            })).insertAfter('.J-placeholder-layout');
        });

        me.renderCalendar()
            .renderHeader()
            .renderFooter()
            .renderCoupon();

        if (me.cacheData.channel.name == 'nuomi') {
            me.renderPlayFlower()
                .renderPlayFlower2()
        }

        $('.J-loading').text('').removeClass('show').addClass('hide');

        return me;
    },
    renderCalendar: function() { //渲染每日专场

        var me = this,
            html = '';
        var currentOrder = me.mainMeetingOrder_cp;

        var now = moment(me.cacheData.now),
            list = [];

        var calendarType = "";

        if (me.cacheData.pageConfig.mainMeeting) {
            if (now.isBefore(me.cacheData.pageConfig.mainMeeting.introEndDate)) {

                for (var i = 0; i < currentOrder.length; i++) {
                    var to = me.cacheData.pageConfig[currentOrder[i].id].activeDate;
                    if (i + 1 < currentOrder.length) {
                        var next_to = me.cacheData.pageConfig[currentOrder[i + 1].id].activeDate;
                    } else {
                        var next_to = to;
                    }

                    if (now.isSame(to, 'day') || (now.isBetween(to, next_to, 'day') && now.isAfter(moment(next_to).subtract(100, 'day')))) {
                        list = currentOrder.slice(i);
                        break;
                    }
                }

                if (list.length < 3) {
                    list = currentOrder.slice(-3);
                }

                var periodDates = me.cacheData.pageConfig.peakCalendar.slice(1);

                var concated = false;

                for (var i in list) {
                    list[i] = $.extend({}, me.cacheData.pageConfig[list[i].id], {
                        id: list[i].id
                    });
                    if (!concated) {
                        list = list.concat(periodDates);
                        concated = true;
                    }
                    figureDay(list[i], now);
                }
                calendarType = "intro";
            } else if (now.isBefore(me.cacheData.pageConfig.mainMeeting.peakEndDate)) {
                list = me.cacheData.pageConfig.peakCalendar;
                for (var i in list) {
                    figureDay(list[i], now);
                }
                calendarType = "peak";
            } else {
                list = me.cacheData.pageConfig.peakCalendar;
                for (var i in list) {
                    list[i].day = "otherday";
                }
                var new_list = [];
                new_list.push($.extend(list[0], {'day': 'otherday'}));
                new_list.push({'activeDate': '2016-08-08', 'dateRange': '8.5 - 8.7', 'title': '巅峰狂欢', 'day': 'yestoday'});
                new_list.push($.extend(list[list.length-1], {'day': 'today'}));
                list = new_list;
                calendarType = "return";
            }

            html = Juicer($('#tpl-calendar').html(), {
                cacheData: me.cacheData,
                list: list,
                "calendarType": calendarType
            });

            $('.J-placeholder-calendar').html(html);
        }
        return me;

        function moment2Str(momentObj, separator) {
            var separator = separator || '-'
            return momentObj.year() + separator + ((momentObj.month() + 1) >= 10 ? (momentObj.month() + 1) : '0' + (momentObj.month() + 1)) + separator + ((momentObj.date()) >= 10 ? (momentObj.date()) : '0' + (momentObj.date()))
        }

        function figureDay (item, now) {
            if (now.isSame(item.activeDate, 'day') && item.dateRange) {
                item.day = 'today';
            } else if ((moment(moment2Str(now)).subtract(1, 'day').isSame(item.activeDate, 'day') && item.dateRange)) {
                item.day = 'yestoday';
            } else {
                item.day = 'otherday';
            }
        }
    },
    renderHeader: function() { //渲染header
        var me = this,
            html = '';
        var headerPics = me.cacheData.pageConfig.headerPics;

        var now = moment(me.cacheData.now);

        for (var i in headerPics) {
            if (now.isSame(headerPics[i].activeDate, 'day')) {
                var pic = headerPics[i].pic;
                break;
            } else {
                var pic = "http://e.hiphotos.baidu.com/baidu/pic/item/c2fdfc039245d68815f582c6acc27d1ed31b24d8.jpg";
            }
        }
        $('.J-header').css({
            'background-image': 'url(' + pic + ')'
        });
        // html = Juicer($('#tpl-header').html(), {
        //     cacheData: me.cacheData,
        //     pic: pic
        // });
        // if (coupon_show) {
        //     $(html).addClass('header-coupon_show');
        // }
        // $('.J-placeholder-header').html(html);

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

        $('.J-placeholder-jumpBnr').remove();
        // if (me.cacheData.channel.name == 'map_scope' || !banner_show) {
        //     $('.J-placeholder-jumpBnr-rb').remove();
        //     return me;
        // }
        // 
        html = Juicer($('#tpl-playflower').html(), {
                cacheData: me.cacheData,
                activeInfo: ACTIVEINFO
            })
            // $('.J-placeholder-jumpBnr').html(html);
        $('.J-placeholder-playflower').html(html);
        return me;
    },
    renderPlayFlower2: function() {
        var me = this,
            html;

        $('.J-placeholder-jumpBnr').remove();
        html = Juicer($('#tpl-playflower2').html(), {
            cacheData: me.cacheData,
            activeInfo: ACTIVEINFO
        })
        $('.J-placeholder-playflower2').html(html);
        return me;
    },
    renderProvinceSelect: function() { //渲染省份选择器 - 依赖地理位置
        var me = this,
            html = '';
        html = Juicer($('#tpl-provinceSelect').html(), {
            cacheData: me.cacheData
        });
        $(html).prependTo('body');
        me.provinceSelect = me.provinceSelect || {};
        me.provinceSelect.offsetTop = $('.J-province-select').offset().top;
        return me;
    },
    renderFooter: function() { //渲染footer
        var me = this,
            html = '';
        // if (me.cacheData.channel.name == 'map_scope') {
        //     return me;
        // } else {
        //     $('footer').addClass('active');
        // }
        html = Juicer($('#tpl-footer').html(), {
            cacheData: me.cacheData
        });
        $('.J-placeholder-footer').replaceWith(html);

        // if (me.cacheData.channel.name == 'nuomi') {
        //     $('footer .game-btn').attr({
        //         'data-link': me.cacheData.pageConfig.footer.lottery.link,
        //         'data-nalink': me.cacheData.pageConfig.footer.lottery.nalink,
        //         "pb-id": me.cacheData.pageConfig.footer.lottery['pb-id']
        //     });
        // }

        me.renderSubSessionTab();

        return me;
    },
    renderPageTab: function(opts) { //渲染页面导航
        var me = this,
            html,
            tpl = me.tpl_pageTab || $('#tpl-pageTab').html();

        me.tpl_pageTab = tpl;

        $('.J-page-tab').remove();

        html = Juicer(tpl, {
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
            top = $('.section-item-' + _settings.item).offset().top - 40;
            clearTimeout(me.cacheData._timer);
            $('.section-item-inner').pauselazyelement();
            me.cacheData._timer = setTimeout(function() {

                $('html,body').scrollTop(top);

                setTimeout(function() {
                    $('.section-item-inner').pauselazyelement();
                    $(window).trigger('scroll');
                }, 200);

            }, 50);
        }
        return me;
    },
    events: function() {
        var me = this,
            _params = $.extend({}, me.params),
            loadTimes = 0,
            $targetPlaceholder = $('.J-placeholder-mainMeeting').eq(0),
            _scrollTimer = null,
            $win = $(window),
            winHeight = $win.height();

        if (me.isNuomiNa()) {
            _params['popRoot'] = 'no';
        }

        $(me).on('locationReady', function() { //地理位置信息已经 ready
            me.renderFlayer({
                type: 'domainList',
                flayerTitle: '选择你想出行的目的地',
                is_show: me.cacheData.gps_success ? 0 : 1 //定位失败时需要打开省份列表的浮层
            });

            $('.J-loading').text('正在检测登录状态');

            Bridge.isLogin(function(status) { //检测登录状态
                me.is_login = status || 0;
            });

            me.renderProvinceSelect()
                .loadDataRelyonLoc({
                    is_init: 1
                });

            if (me.cacheData.channel.name == 'map_scope') {
                me.getForeign();
                me.getCtrip();
            }
        }).on('mainMeetingBySidDataReady', function() { //分会场数据 ready
            me.renderMainMeetingLayout({
                callback: function() {
                    $('.section-item-inner').lazyelement({
                        // threshold: 100,
                        threshold: -30,
                        supportAsync: !0,
                        onScrollStop: function(element) {
                            var id = $(element).attr('id'),
                                sectionType = $(element).attr('section-type');
                            if (sectionType == 'mainMeeting') { //渲染分会场
                                me.renderMainMeeting(me.baseOrder_Key[id]);
                            }
                            /*else if (sectionType == 'promotionList') {
                                                                   // me.renderPromotionList(me.baseOrder_Key[id]);
                                                               } else if (sectionType == 'fixPrice') {
                                                                   // me.renderFixprice(me.baseOrder_Key[id]);
                                                               }*/
                        }
                    });
                }
            });
        }).on('promotionListReady', function() { //爆款折扣渲染 ready
        }).on('fixPriceDataReady', function() {
            me.renderLayout({
                callback: function() {
                    if (me.cacheData.channel.name == 'nuomi') {
                        me.getMainMeeting();
                        me.getHotRanking();
                    }
                    if (me.cacheData.channel.name == 'map_scope') {
                        me.getPromotionIndex();
                        me.getTicket();
                    }
                    me.renderPromotionList(me.baseOrder_Key['promotionList']);
                    me.renderFixprice(me.baseOrder_Key['fixPrice']);
                }
            });
        });

        // $(".img-box img,.pic").lazyload({
        //     threshold: 200,
        //     supportAsync: !0,
        //     dataAttribute: "src"
        // });

        // $(".pic").lazyload({
        //     threshold: 200,
        //     supportAsync: !0,
        //     dataAttribute: "src",
        //     isBackground: 1
        // });

        $(window).on('scroll', function() { //页面内导航的显示/隐藏
            clearTimeout(_scrollTimer);
            _scrollTimer = setTimeout(function() {
                // var $provinceSelect = $('.J-province-select');
                $targetPlaceholder = $('.J-placeholder-mainMeeting').eq(0);

                var scrollTop = $('body').scrollTop(),
                    lastId = $('.J-placeholder-mainMeeting .section-item-inner').eq(0).attr('id'),
                    left = 0;

                $('.J-placeholder-mainMeeting .section-item-inner').each(function(index, item) {
                    var $item = $(item);
                    if ((scrollTop >= $item.offset().top - 60 && scrollTop < $item.offset().top + $item.offset().height - 60)) {
                        lastId = $item.attr('id');
                        $('.page-tab .tab-list .tab-' + lastId).addClass('active').siblings('li').removeClass('active');
                        $('.page-tab .tab-list').scrollLeft(left - 10);
                        return false;
                    }
                    left += $('.page-tab .tab-list .tab-' + lastId).offset().width;
                });

                if ($targetPlaceholder.offset() && $('.J-page-tab').offset()) {
                    var targetTop = $targetPlaceholder.offset().top;
                    var height = $('.J-page-tab').offset().height;
                    $('.tab-holder').css('height', height);

                    if (scrollTop >= targetTop) {
                        $('.J-page-tab').addClass('active');

                        $('.J-page-container').prepend($('.J-page-tab'));

                        $('.J-btn-toTop').addClass('active');
                        $('.tab-holder').addClass('active', height);
                        return me;
                    }
                    $('.J-page-tab').removeClass('active');
                    $('.J-placeholder-page-tab').prepend($('.J-page-tab'));
                    $('.J-btn-toTop').removeClass('active');
                    $('.tab-holder').removeClass('active', height);
                }
            }, 50);
        });

        $('body').on('tap', '.J-province-select', function() { //打开省份列表
                me.renderFlayer({
                    type: 'domainList',
                    is_show: 1
                });
            }).on('tap', '.province-li', function(e) { //省份切换
                var sid = $(this).data('sid'),
                    province_sid = $(this).attr('data-province_sid') || sid;
                if (sid == me.cacheData.sid) {
                    $('.J-flayer-close').trigger('tap');
                    return me;
                }
                $('.province-li').removeClass('active');
                $(this).addClass('active');
                $('#J_cur-pro').html(me.cacheData.sname = $(this).data('sname'));
                me.cacheData.sid = sid || me.cacheData.sid;
                me.cacheData.province_sid = province_sid || me.cacheData.province_sid;
                $('.J-flayer-close').trigger('tap');

                try {
                    sessionStorage.setItem('sid', me.cacheData.sid);
                    sessionStorage.setItem('province_sid', me.cacheData.province_sid);
                } catch (e) {

                }
                // $('.section-item').unlazyelement();

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
                // if ($(this).hasClass('coupon-item-out') || $(this).hasClass('coupon-item-picked')) {
                //     return false;
                // }
                me.getDiscount({
                    id: id
                });
            }).on('tap', '.J-flayer-close', function() { //隐藏浮层
                $('.flayer').removeClass('show').addClass('hide');
            }).on('touchend', '.J-btn-toTop', function() { //回到顶部
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
                var src = $(this).attr('data-src'),
                    ctrip_id = $(this).attr('data-ctrip_id') || '',
                    qunar_id = $(this).attr('data-qunar_id') || '',
                    pid = $(this).attr('data-pid') || '',
                    uid = $(this).attr('data-uid') || '',
                    ticket_id = $(this).attr('data-ticket_id') || '';

                var scope_id = src == 'qunar' ? qunar_id : ctrip_id,
                    td_id = scope_id;

                Bridge.pushWindow({
                    page: 'orderFill',
                    data: {
                        nuomi: $.extend({
                            ticket_id: ticket_id,
                            td_id: td_id,
                            scope_id: scope_id,
                            partner_id: src,
                            uid: uid
                        }, _params),
                        map: $.extend({
                            "param": '{"partner_id":"' + src + '","scope_id":"' + scope_id + '","ticket_id":"' + pid + '","extra":[],"is_adult_ticket":0,"is_into_scope":0,"order_from":"map_scope"}',
                            "popRoot": "no"
                        }, _params),
                        'nuomi-webapp': $.extend({
                            td_id: td_id,
                            partner_id: src,
                            scope_id: scope_id,
                            ticket_id: ticket_id,
                            uid: uid
                        }, _params),
                        'map-webapp': $.extend({
                            partner_id: src,
                            scope_id: scope_id,
                            ticket_id: pid,
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
                var ticket_id = $(this).attr('data-ticket_id'),
                    td_id = $(this).attr('data-td_id');

                var scope_id = td_id;

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
                var link = $(this).data('link'),
                    nalink = $(this).attr('data-nalink') || '';
                if (link.length == 0) {
                    return me;
                }
                Bridge.pushWindow({
                    // nuomi: "bainuo://component?a=1&url=" + encodeURIComponent(link),
                    nuomi: /^bainuo\:/igm.test(nalink) ? nalink : "bainuo://component?a=1&url=" + encodeURIComponent(nalink),
                    "nuomi-webapp": link,
                    "map-webapp": link,
                    "map-ios": link,
                    "map-android": link
                });
            }).on('tap', '[tab-for]', function() { //tab 切换
                var tabId = $(this).attr('tab-for'),
                    tabRel = $(this).attr('tab-relFor'),
                    $sectionItem = $(this).parents('.section-item');
                $sectionItem.find('[tab-rel="' + tabRel + '"]').removeClass('show').addClass('hide');
                $sectionItem.find('[tab-id="' + tabId + '"]').removeClass('hide').addClass('show');
                me.createSoftImg($sectionItem.find('[tab-id="' + tabId + '"]'));
            }).on('tap', '.subSessionTab-btn', function() {
                $('.subSessionTab').addClass('active');
                $('body').on('tap', '.subSessionTab-btn', _hideSubsessionTab)
            }).on('touchend', '.subSessionTab .close-btn', _hideSubsessionTab)
            .on('tap', '.J-more-ticket', function() { //更多热门景点
                var _sid = me.cacheData.gps_sid,
                    _cityid = me.cacheData.gps_cityid,
                    _timeout = 0;

                if (me.cacheData.gps_success == 0) { //定位失败
                    _timeout = 3000;
                }

                setTimeout(function() {
                    if (me.cacheData.gps_success == 0) { //定位失败
                        Bridge.toast('亲~定位失败了哟~~~');
                    }
                    Bridge.pushWindow({
                        page: 'poiList',
                        data: {
                            nuomi: $.extend({
                                sid: _sid,
                                tag_id: 0
                            }, _params),
                            'nuomi-webapp': $.extend({
                                sid: _sid
                            }, _params),
                            'map-webapp': $.extend({
                                c: _cityid
                            }, _params)
                        }
                    });
                }, _timeout);
            }).on('tap', '.J-page-info', function(e) { //分页
                var pageFor = $(this).data('item') || $(this).attr('data-pagefor'),
                    Item = pageFor.replace(/(\w)/, function(v) {
                        return v.toUpperCase()
                    }),
                    $target = $(e.target),
                    type = $target.data('type'),
                    cacheData_id = me.cacheData[pageFor] || {},
                    cacheData_id_sid = cacheData_id[me.cacheData.sid] || {},
                    cacheData_id_sid_pn = cacheData_id_sid.pn,
                    cacheData_id_sid_rn = cacheData_id_sid.rn,
                    cacheData_id_sid_total = cacheData_id_sid.total,
                    page_cur, totalPages, fn_name;

                if (pageFor && type) {
                    page_cur = Math.floor(cacheData_id_sid_pn / cacheData_id_sid_rn);
                    totalPages = Math.ceil(cacheData_id_sid_total / cacheData_id_sid_rn);
                    totalPages = totalPages < 0 ? 0 : totalPages;

                    if (type == 'next') {
                        page_cur = ++page_cur >= totalPages ? totalPages - 1 : page_cur;
                    } else if (type == 'prev') {
                        page_cur = --page_cur < 0 ? 0 : page_cur;
                    } else if (type == 'page') {
                        page_cur = parseInt($target.data('page_num'), 10);
                    }

                    if (pageFor == 'hotRanking') {
                        fn_name = 'getHotRanking';
                    } else if (pageFor == 'ctrip') {
                        fn_name = 'getCtrip';
                    } else if (pageFor == 'foreign') {
                        fn_name = 'getForeign';
                    }
                    fn_name && me[fn_name]({
                        pn: page_cur * cacheData_id_sid_rn,
                        rn: cacheData_id_sid_rn,
                        callback: function() {
                            me.goToSection({
                                item: pageFor
                            });
                        }
                    });
                }
            });

        function _hideSubsessionTab() {
            $('.subSessionTab').removeClass('active');
            $('body').off('tap', '.subSessionTab-btn', _hideSubsessionTab);
        }

        return this;
    },
    getCtrip: function(opts) { //获取携程列表
        var deferred = $.Deferred(),
            me = this,
            _settings = opts || {},
            pn = _settings.pn || 0,
            rn = _settings.rn || 10,
            _dataReady = function() {
                me.cacheData.ctrip[me.cacheData.sid]['pn'] = pn;
                me.cacheData.ctrip[me.cacheData.sid]['rn'] = rn;

                // var _timer = setInterval(function() {
                // if ($('#ctrip').length > 0) {
                // clearInterval(_timer);
                me.renderCtrip(me.baseOrder_Key['ctrip']);
                _settings.callback && _settings.callback();
                // }
                // }, 100);

            };

        me.cacheData.ctrip = me.cacheData.ctrip || {};
        me.cacheData.ctrip[me.cacheData.sid] = me.cacheData.ctrip[me.cacheData.sid] || {};

        if (me.cacheData.ctrip[me.cacheData.sid]['pn' + pn]) { //请求的 pn 已经缓存过
            _dataReady();
            return me;
        }

        if (!('ctrip' in me.baseOrder_Key)) {
            return me;
        }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/promotion/getctriplist',
            dataType: 'jsonp',
            data: $.extend({}, {
                activity_name: 'duanwu',
                pn: pn,
                rn: rn,
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('获取携程列表:' + res.msg);
                    return me;
                }

                me.cacheData.ctrip[me.cacheData.sid]['pn'] = pn;
                me.cacheData.ctrip[me.cacheData.sid]['rn'] = rn;
                me.cacheData.ctrip[me.cacheData.sid]['pn' + pn] = res.data || {};
                me.cacheData.ctrip[me.cacheData.sid]['total'] = res.data.total || 0;

                me.reSizeImg({
                    type: 'ctrip'
                });

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });

        return deferred;
    },
    renderCtrip: function(opts) { //渲染携程列表
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            ctrip = me.cacheData.ctrip || {},
            ctrip_sid = ctrip[me.cacheData.sid] || {},
            ctrip_sid_pn = ctrip_sid['pn' + (ctrip_sid.pn || 0)],
            ctrip_sid_rn = ctrip_sid.rn || 10,
            ctrip_sid_pn_list = ctrip_sid_pn.list || [];

        if ($.isEmptyObject(ctrip_sid)) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                showPages: 1,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: ctrip_sid_pn_list || [],
                        createFlag: function(renderFor) {
                            var text, className;

                            text = '热销';

                            className = 'flag-discount';
                            return '<em class="' + className + '">' + text + '</em>'
                        }
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        $('.J-placeholder-' + _settings.id + '-empty').remove();
        me.createSoftImg($('.J-placeholder-' + _settings.id));

        return me;
    },
    getForeign: function(opts) { //获取海外特价列表
        var deferred = $.Deferred(),
            me = this,
            _settings = opts || {},
            pn = _settings.pn || 0,
            rn = _settings.rn || 10,
            _dataReady = function() {
                me.cacheData.foreign[me.cacheData.sid]['pn'] = pn;
                me.cacheData.foreign[me.cacheData.sid]['rn'] = rn;

                // var _timer = setInterval(function() {
                //     if ($('#foreign').length > 0) {
                //         clearInterval(_timer);
                me.renderForeign(me.baseOrder_Key['foreign']);
                _settings.callback && _settings.callback();
                //     }
                // }, 100);

            };

        me.cacheData.foreign = me.cacheData.foreign || {};
        me.cacheData.foreign[me.cacheData.sid] = me.cacheData.foreign[me.cacheData.sid] || {};

        if (me.cacheData.foreign[me.cacheData.sid]['pn' + pn]) { //请求的 pn 已经缓存过
            _dataReady();
            return me;
        }

        if (!('foreign' in me.baseOrder_Key)) {
            return me;
        }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/overseasale/getsalelistsku',
            dataType: 'jsonp',
            data: $.extend({}, {
                activity_name: 'duanwu',
                pn: pn,
                rn: rn,
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('获取海外特价列表:' + res.msg);
                    return me;
                }

                me.cacheData.foreign[me.cacheData.sid]['pn'] = pn;
                me.cacheData.foreign[me.cacheData.sid]['rn'] = rn;
                me.cacheData.foreign[me.cacheData.sid]['pn' + pn] = res.data || {};
                me.cacheData.foreign[me.cacheData.sid]['total'] = res.data.total || 0;

                me.reSizeImg({
                    type: 'foreign'
                });

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });

        return deferred;
    },
    renderForeign: function(opts) { //渲染海外特价列表
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            foreign = me.cacheData.foreign || {},
            foreign_sid = foreign[me.cacheData.sid] || {},
            foreign_sid_pn = foreign_sid['pn' + (foreign_sid.pn || 0)],
            foreign_sid_rn = foreign_sid.rn || 10,
            foreign_sid_pn_list = foreign_sid_pn.list || [];

        if ($.isEmptyObject(foreign_sid)) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                showPages: 1,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: foreign_sid_pn_list || [],
                        createFlag: function(renderFor) {
                            var text, className;

                            text = '热销';

                            className = 'flag-discount';
                            return '<em class="' + className + '">' + text + '</em>'
                        }
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        $('.J-placeholder-' + _settings.id + '-empty').remove();
        me.createSoftImg($('.J-placeholder-' + _settings.id));

        return me;
    },
    getTicket: function(opts) { //获取推荐门票
        var deferred = $.Deferred(),
            me = this,
            _settings = opts || {},
            pn = _settings.pn || 1,
            rn = _settings.rn || 10,
            _dataReady = function() {
                me.cacheData.ticket[me.cacheData.province_sid]['pn'] = pn;
                me.cacheData.ticket[me.cacheData.province_sid]['rn'] = rn;

                me.renderTicket(me.baseOrder_Key['ticket']);
                _settings.callback && _settings.callback();

            };

        me.cacheData.ticket = me.cacheData.ticket || {};
        me.cacheData.ticket[me.cacheData.province_sid] = me.cacheData.ticket[me.cacheData.province_sid] || {};

        if (me.cacheData.ticket[me.cacheData.province_sid]['pn' + pn]) { //请求的 pn 已经缓存过
            _dataReady();
            return me;
        }

        if (!('ticket' in me.baseOrder_Key)) {
            return me;
        }

        Bridge.Loader.get({
            url: 'http://client.map.baidu.com/scope',
            dataType: 'jsonp',
            data: $.extend({
                sid: me.cacheData.province_sid,
                city_id: me.cacheData.city_code,
                pn: pn,
                rn: rn,
                category: 'qunar-jingdian',
                qt: 'scope_favorable'
            }, me.params),
            success: function(res) {
                if (res.err_no != 0) {
                    Bridge.toast('获取推荐门票:' + res.err_msg);
                    return false;
                }

                me.cacheData.ticket[me.cacheData.province_sid]['pn'] = pn;
                me.cacheData.ticket[me.cacheData.province_sid]['rn'] = rn;
                me.cacheData.ticket[me.cacheData.province_sid]['pn' + pn] = res.data || {};
                me.cacheData.ticket[me.cacheData.province_sid]['total'] = res.data.total || 0;

                me.reSizeImg({
                    type: 'ticket'
                });

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });

        return deferred;
    },
    renderTicket: function(opts) { //渲染推荐门票区域
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            ticket = me.cacheData.ticket || {},
            ticket_sid = ticket[me.cacheData.province_sid] || {},
            ticket_sid_pn = ticket_sid['pn' + (ticket_sid.pn || 0)],
            ticket_sid_rn = ticket_sid.rn || 10,
            ticket_sid_pn_list = ticket_sid_pn.list || [];

        if ($.isEmptyObject(ticket_sid)) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                moreHtml: '<p class="more-link"><span class="J-more-ticket">更多超值景点门票</span></p>',
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: ticket_sid_pn_list || [],
                        createFlag: function(renderFor) {
                            var text, className;

                            text = '热销';

                            className = 'flag-discount';
                            return '<em class="' + className + '">' + text + '</em>'
                        }
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        $('.J-placeholder-' + _settings.id + '-empty').remove();
        me.createSoftImg($('.J-placeholder-' + _settings.id));

        return me;
    },
    getPromotionIndex: function(opts) { //获取立减数据
        var deferred = $.Deferred(),
            me = this,
            _settings = opts || {},
            pn = _settings.pn || 1,
            rn = _settings.rn || 10,
            _dataReady = function() {
                me.cacheData.promotionIndex[me.cacheData.sid]['pn'] = pn;
                me.cacheData.promotionIndex[me.cacheData.sid]['rn'] = rn;

                // var _timer = setInterval(function() {
                //     if ($('#promotionIndex').length > 0) {
                //         clearInterval(_timer);
                me.renderPromotionIndex(me.baseOrder_Key['promotionIndex']);
                _settings.callback && _settings.callback();
                //     }
                // }, 100);

            };

        me.cacheData.promotionIndex = me.cacheData.promotionIndex || {};
        me.cacheData.promotionIndex[me.cacheData.sid] = me.cacheData.promotionIndex[me.cacheData.sid] || {};

        // if (me.cacheData.promotionIndex[me.cacheData.sid]['pn' + pn]) { //请求的 pn 已经缓存过
        //     _dataReady();
        //     return me;
        // }

        if (!('promotionIndex' in me.baseOrder_Key)) {
            return me;
        }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/ticket/getpromotionindex/',
            dataType: 'jsonp',
            data: $.extend({
                sid: me.cacheData.province_sid,
                promotion_product_show: me.cacheData.channel.name,
                request_device: 'webapp',
                activity_id: me.cacheData.channel.activity_id,
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('获取立减门票:' + res.err_msg);
                    return false;
                }
                me.cacheData.promotionIndex[me.cacheData.sid]['pn'] = pn;
                me.cacheData.promotionIndex[me.cacheData.sid]['rn'] = rn;
                me.cacheData.promotionIndex[me.cacheData.sid]['pn' + pn] = res.data || {};

                me.reSizeImg({
                    type: 'promotionIndex'
                });

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });

        return deferred;
    },
    renderPromotionIndex: function(opts) { //渲染立减信息
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            promotionIndex = me.cacheData.promotionIndex || {},
            promotionIndex_sid = promotionIndex[me.cacheData.sid] || {},
            promotionIndex_sid_pn = promotionIndex_sid['pn' + (promotionIndex_sid.pn || 0)] || {},
            promotionIndex_sid_rn = promotionIndex_sid.rn || 10,
            promotionIndex_sid_pn_promotionList = promotionIndex_sid_pn.promotionList || {},
            promotionIndex_sid_pn_promotionList_list = promotionIndex_sid_pn_promotionList.list || [];

        if ($.isEmptyObject(promotionIndex_sid_pn_promotionList) || promotionIndex_sid_pn_promotionList_list.length == 0) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 1,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: promotionIndex_sid_pn_promotionList_list || [],
                        is_sale: promotionIndex_sid_pn.is_sale
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        $('.J-placeholder-' + _settings.id + '-empty').remove();
        me.createSoftImg($('.J-placeholder-' + _settings.id));
        return me;
    },
    getHotRanking: function(opts) { //获取当地热销
        this.baseOrder_Key.hotRanking = this.baseOrder_Key.hotRanking || {};
        var deferred = $.Deferred(),
            me = this,
            _settings = opts || {},
            pn = _settings.pn || 0,
            rn = _settings.rn || me.baseOrder_Key.hotRanking.cardNum || 6,
            _dataReady = function() {
                me.cacheData.hotRanking[me.cacheData.sid]['pn'] = pn;
                me.cacheData.hotRanking[me.cacheData.sid]['rn'] = rn;

                me.renderHotRanking(me.baseOrder_Key['hotRanking']);

                _settings.callback && _settings.callback();
            },
            hotRanking_sid;

        if (!('hotRanking' in me.baseOrder_Key)) {
            $('#hotRanking').remove();
            return me;
        }

        me.cacheData.hotRanking = me.cacheData.hotRanking || {};
        me.cacheData.hotRanking[me.cacheData.sid] = me.cacheData.hotRanking[me.cacheData.sid] || {};

        if (me.cacheData.hotRanking[me.cacheData.sid]['pn' + pn]) { //请求的 pn 已经缓存过
            _dataReady();
            return me;
        }

        if (me.cacheData.isHotCity != 0) { //非热门城市才请求
            $('#hotRanking').remove();
            return me;
        }

        Bridge.Loader.get({
            url: Bridge.host + '/business/ajax/searchnew/',
            dataType: 'jsonp',
            data: $.extend({}, {
                sid: me.cacheData.city_sid,
                pn: pn,
                rn: rn,
                category: 'tuandan',
                t: T
            }, me.params),
            success: function(res) {
                if (res.errno != 0) {
                    Bridge.toast('获取当地热销:' + res.msg);
                    $('#hotRanking').remove();
                    return me;
                }

                me.cacheData.hotRanking[me.cacheData.sid]['pn'] = pn;
                me.cacheData.hotRanking[me.cacheData.sid]['rn'] = rn;
                me.cacheData.hotRanking[me.cacheData.sid]['pn' + pn] = res.data || {};
                me.cacheData.hotRanking[me.cacheData.sid]['total'] = res.data.total || 0;

                if (me.cacheData.hotRanking[me.cacheData.sid]['total'] < 4) {
                    $('#hotRanking').remove();
                    return me;
                }

                me.reSizeImg({
                    type: 'hotRanking'
                });

                _dataReady();
            },
            fail: function() {
                Bridge.toast('网络错误, 请稍候重试');
            }
        });

        return deferred;
    },
    renderHotRanking: function(opts) { //渲染当地热销
        var me = this,
            tpl = me.tpl_mainMeeting || $('#tpl-mainMeeting').html(),
            _settings = opts || {},
            html = '',
            hotRanking = me.cacheData.hotRanking || {},
            hotRanking_sid = hotRanking[me.cacheData.sid] || {},
            hotRanking_sid_pn = hotRanking_sid['pn' + (hotRanking_sid.pn || 0)],
            hotRanking_sid_rn = hotRanking_sid.rn || me.baseOrder_Key.hotRanking.cardNum,
            hotRanking_sid_pn_list = hotRanking_sid_pn.list || [];

        if ($.isEmptyObject(hotRanking_sid)) {
            $('#' + _settings.id).removeClass('show').addClass('hide');
            $('<div class="J-placeholder-' + _settings.id + '-empty" />').insertAfter('#' + _settings.id);
            return me;
        }

        me.tpl_mainMeeting = tpl;

        html = Juicer(tpl, {
            cacheData: me.cacheData,
            data: $.extend({}, {
                id: _settings.id,
                colsNum: 2,
                showPages: 1,
                list: {
                    id: _settings.id,
                    html: me.createTicketList({
                        renderFor: _settings.id,
                        type: _settings['type'],
                        cardNum: _settings['cardNum'],
                        direction: 'vertical',
                        data: hotRanking_sid_pn_list || [],
                        createFlag: function(renderFor) {
                            var text, className;

                            text = '热销';

                            className = 'flag-discount';
                            return '<em class="' + className + '">' + text + '</em>'
                        }
                    })
                }
            })
        });
        $('.J-placeholder-' + _settings.id).html(html);
        $('#' + _settings.id).removeClass('hide').addClass('show');
        me.createSoftImg($('.J-placeholder-' + _settings.id));
        $('.J-placeholder-' + _settings.id + '-empty').remove();

        return me;
    }
};

(function() { //获取文案配置

    App.init();

    var baseSize = 16,
        baseWidth = 375,
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
