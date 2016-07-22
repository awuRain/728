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

$.fn.lazyload = function(t) {
        function n() {
            var n = _updateScrollRect();
            a = n[0],
                e = n[1],
                t.supportAsync && (l = $(d)),
                l = $($.map(l, function(n) {
                    return n.lazyload || !$(n).data(t.dataAttribute) || o(n) ? null : n
                })),
                l.each(i)
        }

        function o(t) {
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
            if (!n.lazyload) {
                var i = o.data(t.dataAttribute),
                    backgroundImage = o.data(dataBackgroundImage),
                    r = t.threshold,
                    l = o.offset(),
                    d = l.top - r,
                    c = l.top + l.height + r;
                if (d >= a && e >= d || c >= a && e >= c || a >= d && c >= e) {
                    o.attr("src", i);
                    backgroundImage && o.css("background-image", 'url(' + backgroundImage + ')');
                    n.lazyload = "loading";
                    n.onload = function() {
                        n.lazyload = "loaded",
                            $(window).trigger("scroll")
                    }
                }
            }
        }
        var r = {
            threshold: 0,
            dataAttribute: "src",
            dataBackgroundImage: "backgroundImage",
            supportAsync: !1
        };
        t = $.extend({}, r, t),
            $window.on("scrollStop orientationchange", n);
        var a, e, l = this,
            d = this.selector;
        $(document).ready(function() {
                n()
            }),
            /iphone|ipad/gi.test(navigator.appVersion) && $window.bind("pageshow", function(t) {
                t.originalEvent && t.originalEvent.persisted && n()
            })
    },
    $(window).on("scroll", _throttle(80, function() {
        $(window).trigger("scrollStop")
    }));
