/**
 * 提醒组件库
 * @author 闫斌(yanbin01@baidu.com)
 * @date 2015-08-17
 */

var $ = require('zepto');

module.exports = (function(win) {
    var doc = win.document,
        body = doc.body,
        E_float, E_floatMsg, E_floatContent, E_floatOk, E_floatCancel,
        initDom = false,
        flashTimeoutId,
        showTimeoutId,
        hideTimeoutId,
        E_mask;

    E_mask = doc.createElement('div');
    E_mask.className = 'c-float-mask hide';

    E_float = doc.createElement('div');
    E_float.className = 'c-float-popWrap msgMode hide';
    E_float.innerHTML = ['<div class="c-float-modePop">',
        '<div class="warnMsg"></div>',
        '<div class="content"></div>',
        '<div class="doBtn">',
        '<button class="cancel">取消</button>',
        '<button class="ok">确定</button>',
        '</div>',
        '</div>'].join('');

    E_floatMsg = E_float.querySelector('.warnMsg');
    E_floatContent = E_float.querySelector('.content');
    E_floatOk = E_float.querySelector('.doBtn .ok');
    E_floatCancel = E_float.querySelector('.doBtn .cancel');

    E_floatMsg.addEventListener('click', function() {
        // alert(E_float.className);
    }, false);

    function _extend(a, b) {
        for (var k in b) {
            a[k] = b[k];
        }
        return a;
    }

    function successHandler(e) {
        this.callback && this.callback(e, true);
    }

    function failureHandler(e) {
        this.callback && this.callback(e, false);
    }

    function ModePop(options) {
        this._options = _extend({
            mode : 'msg',
            text : '网页提示',
            useTap : false
        }, options || {});

        this._init();
    }

    _extend(ModePop.prototype, {
        _init : function() {
            var that = this,
                opt = that._options,
                mode = opt.mode,
                text = opt.text,
                okText = opt.okText,
                cancelText = opt.cancelText,
                content = opt.content,
                callback = opt.callback,
                background = opt.background,
                clickEvent = opt.useTap ? 'touchend' : 'click'
                ;

            // set mode
            var classTxt = E_float.className;
            classTxt = classTxt.replace(/(msg|alert|confirm)Mode/i, mode + 'Mode');
            E_float.className = classTxt;

            // set background
            background && (E_float.style.background = background);

            // set text & content
            if (text) {
                E_floatMsg.innerHTML = text;
                E_floatMsg.style.display = 'block';
            } else {
                E_floatMsg.style.display = 'none';
            }

            if (content) {
                E_floatContent.innerHTML = content;
                E_floatContent.style.display = 'block';
            } else {
                E_floatContent.style.display = 'none';
            }

            E_floatOk.innerHTML = okText || '确定';
            E_floatCancel.innerHTML = cancelText || '取消';

            if (mode == 'alert' || mode == 'confirm') {
                this.hasMask = true;
            } else {
                this.hasMask = false;
            }

            // click event
            E_floatOk.removeEventListener('touchend', successHandler);
            E_floatOk.removeEventListener('click', successHandler);
            E_floatCancel.removeEventListener('touchend', successHandler);
            E_floatCancel.removeEventListener('click', successHandler);
            E_floatOk.addEventListener(clickEvent, successHandler, false);
            E_floatCancel.addEventListener(clickEvent, failureHandler, false);
            E_floatOk.callback = E_floatCancel.callback = function() {
                callback.apply(that, arguments);
            };

            if (!initDom) {
                initDom = true;
                doc.body.appendChild(E_mask);
                doc.body.appendChild(E_float);
                win.addEventListener('resize', function() {
                    setTimeout(function() {
                        that._pos();
                    }, 500);
                }, false);
            }
        },

        _pos : function() {
            // var that = this,
            // top, left, iW, iH, rect, eW, eH
            // ;
//
            // if (!that.isHide()) {
            // top = body.scrollTop;
            // left = body.scrollLeft;
            // iW = win.innerWidth;
            // iH = win.innerHeight;
            // rect = E_float.getBoundingClientRect();
            // eW = rect.width;
            // eH = rect.height;
//
            // E_float.style.top = (top + (iH - eH) / 2) + 'px';
            // E_float.style.left = (left + (iW - eW) / 2) + 'px';
//
            // // fixed by liuhuo.gk
//
            // E_float.style.marginLeft = '50%';
            // E_float.style.left = -eW / 2 + 'px';
            // }

            var rect = E_float.getBoundingClientRect(),
                eW = rect.width,
                eH = rect.height;

            E_float.style.marginLeft = -eW / 2 + 'px';
            E_float.style.marginTop = -eH / 2 + 'px';
        },

        isShow : function() {
            return E_float.className.indexOf('show') > -1;
        },

        isHide : function() {
            return E_float.className.indexOf('hide') > -1;
        },

        _cbShow : function(pos) {
            var that = this,
                opt = that._options,
                onShow = opt.onShow
                ;

            E_float.style.opacity = '1';
            that.hasMask && (E_mask.style.opacity = '1');
            that.hasMask && (E_mask.className = E_mask.className.replace(/hide/g, '').trim());

            if (!that.isShow()) {
                E_float.className += ' show';
                that.hasMask && (E_mask.className += ' show');
            }

            pos && that._pos();

            onShow && onShow.call(that);
        },

        show : function() {
            var that = this
                ;

            if (flashTimeoutId) {
                clearTimeout(flashTimeoutId);
                flashTimeoutId = null;
                this._cbHide();
            }

            if (showTimeoutId) {
                clearTimeout(showTimeoutId);
                showTimeoutId = null;
            }

            if (hideTimeoutId) {
                clearTimeout(hideTimeoutId);
                hideTimeoutId = null;
            }

            if (!that.isShow()) {
                E_float.className = E_float.className.replace(/hide/g, '').trim();
                that.hasMask && (E_mask.className = E_mask.className.replace(/hide/g, '').trim());

                that._pos();

                setTimeout(function() {
                    E_float.style.opacity = '1';
                    that.hasMask && (E_mask.style.opacity = '1');
                }, 1);

                showTimeoutId = setTimeout(function() {
                    that._cbShow();
                }, 300);
            } else {
                that._cbShow(true);
            }
        },

        _cbHide : function() {
            var that = this,
                opt = that._options,
                onHide = opt.onHide
                ;

            E_float.style.opacity = '0';
            E_mask.style.opacity = '0';

            if (!that.isHide()) {
                E_float.className = E_float.className.replace(/hide|show/g, '').trim();
                E_float.className += ' hide';
                E_mask.className = E_mask.className.replace(/hide|show/g, '').trim();
                E_mask.className += ' hide';
            }
            onHide && onHide.call(that);
        },
        // ruoli 添加timeout参数，防止点击弹出框，立即再弹出一个框，出现闪动
        hide : function(timeout) {
            var that = this
                ;

            if (showTimeoutId) {
                clearTimeout(showTimeoutId);
                showTimeoutId = null;
            }

            if (hideTimeoutId) {
                clearTimeout(hideTimeoutId);
                hideTimeoutId = null;
            }

            if (!that.isHide()) {
                E_float.className = E_float.className.replace(/show/g, '').trim();
                E_mask.className = E_mask.className.replace(/show/g, '').trim();

                setTimeout(function() {
                    E_float.style.opacity = '0';
                    E_mask.style.opacity = '0';
                }, 1);

                hideTimeoutId = setTimeout(function() {
                    that._cbHide();
                }, timeout||300);
            } else {
                that._cbHide();
            }
        },

        flash : function(timeout) {
            var that = this,
                opt = that._options
                ;

            that.show();

            //opt.onShow = function() {
            flashTimeoutId = setTimeout(function() {
                if (flashTimeoutId) {
                    that.hide();
                }
            }, timeout);
            //};

        }
    });

    var notification = new function() {

        this.simple = function(text, bg, timeout) {
            if (arguments.length == 2) {
                if (typeof arguments[1] == 'number') {
                    timeout = arguments[1];
                    bg = undefined;
                }
            }

            var pop = new ModePop({
                mode : 'msg',
                text : text,
                background : bg
            });

            pop.flash(timeout || 2000);
            return pop;
        };

        this.msg = function(text, options) {
            return new ModePop(_extend({
                mode : 'msg',
                text : text
            }, options || {}));
        };

        this.alert = function(text, content, callback, options) {

            if (typeof content === 'function') {
                options = callback;
                callback = content;
                content = null;
            }

            return new ModePop(_extend({
                mode : 'alert',
                text : text,
                content : content,
                callback : callback
            }, options || {}));
        };

        this.confirm = function(text, content, callback, options) {
            return new ModePop(_extend({
                mode : 'confirm',
                text : text,
                content : content,
                callback : callback,
            }, options || {}));
        };

        this.pop = function(options) {
            return new ModePop(options);
        };

    };

    return notification;
})(window);
