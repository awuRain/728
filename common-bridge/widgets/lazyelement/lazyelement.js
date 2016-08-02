var $ = require('zepto');

window.callbackBoxLogin = function(a) {
    location.reload();
}

function _updateScrollRect() {
    var t = window.scrollY,
        n = t + window.innerHeight;
    return [t, n]
}

function _throttle(t, n) {
    function o() {
        function o() {
            n.apply(r, a)
        }
        var r = this,
            a = [].slice.call(arguments);
        i && clearTimeout(i),
            i = setTimeout(o, t)
    }
    var i;
    return o._zid = n._zid = n._zid || $.proxy(n)._zid,
        o
}

var $window = $(window);

$.fn.lazyelement = function(t) {
        function n() {
            var n = _updateScrollRect();
            a = n[0],
                e = n[1],
                t.supportAsync && (l = $(d)),
                l = $($.map(l, function(n) {
                    return n.lazyelement || o(n) || n.pause ? null : n
                }));
                l.each(i)
        }

        function o(t) { //检测元素是否是已隐藏
            var n = !1,
                o = $(t);
            if ("none" === o.css("display"))
                return !0;
            var i = o.parents();
            return $.each(i, function(t, o) {
                    return "none" === $(o).css("display") ? void(n = !0) : void 0
                }),
                n
        }

        function i() {
            var n = this,
                o = $(this);
            if (!n.lazyelement) {
                var r = t.threshold,
                    l = o.offset(),
                    d = l.top - r,
                    c = l.top + l.height + r;
                if (d >= a && e >= d || c >= a && e >= c || a >= d && c >= e) {
                    n.lazyelement = "actived";
                    t.onScrollStop(n);
                    $(window).trigger("scroll.lazyelement");
                }
            }
        }
        var r = {
            threshold: 0,
            supportAsync: !1,
            onScrollStop: function() {
                console.log(arguments)
            }
        };
        t = $.extend({}, r, t),
            $window.on("scrollStop.lazyelement orientationchange.lazyelement", n);
        var a, e, l = this,
            d = this.selector;
        $(document).ready(function() {
                n()
            }),
            /iphone|ipad/gi.test(navigator.appVersion) && $window.bind("pageshow", function(t) {
                t.originalEvent && t.originalEvent.persisted && n()
            })
    },
    $(window).on("scroll.lazyelement", _throttle(40, function() {
        $(window).trigger("scrollStop.lazyelement")
    }));

$.fn.pauselazyelement = function(opts) {
    var me = this;

    function init() {
        me.forEach(function(item, index) {
            item.pause = !item.pause;
        });
    }
    init();
}


$.fn.unlazyelement = function(opts) {
    var me = this;

    function init() {
        me.forEach(function(item, index) {
            item.lazyelement = undefined
        });
    }
    init();
}
