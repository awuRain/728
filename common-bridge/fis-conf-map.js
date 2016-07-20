var deploy = 'http://cp01-qa-lvyou-001.cp01.baidu.com:8080/';
//var deploy = 'http://tc-lvyou-24.epc.baidu.com:8080/';
// var deploy = 'http://cq01-cp01-centos41-testing001-3.epc.baidu.com:8080/';
//var deploy = 'http://cp01-yxtocp060.vm.baidu.com:8080/';
// var deploy = 'http://cq01-ocean-147.epc.baidu.com:8080/';
//var deploy = 'http://cq01-cp01-centos41-testing001-3.epc.baidu.com:8080/';

var cdndomain = ['http://cp01-qa-lvyou-001.cp01.baidu.com:8080'];

fis.config.merge({
    modules: {
        postprocessor: {
            js: 'jswrapper,require-async',
            html: 'require-async'
        },
        postpackager: ['autoload', 'simple']
    },
    settings: {
        postprocessor: {
            jswrapper: {
                type: 'amd'
            },
            autoprefixer: {
                "browsers": ["Android >= 2.3", "ChromeAndroid > 1%", "iOS >= 4"],
                "cascade": true
            }
        },
        spriter: {
            csssprites: {
                margin: 50
            }
        }
    },
    roadmap: {
        domain: {
            '**.js': cdndomain,
            '**.css': cdndomain,
            'image': cdndomain,
            '**.less': cdndomain
        }
    },
    pack: {
        'pkg/modules-combine.js': [
            '/modules/**.js'
        ],
        'pkg/widgets-combine.js': [
            '/widgets/**.js'
        ],
        'pkg/index-combine.js': [
            '/page/index/**.js'
        ]
    },
    deploy: {
        remote: [{
            receiver: deploy + '/static/receiver.php',
            from: '/',
            subOnly: true,
            to: '/home/lv/webroot/fwmap/upload/728_promo_m/',
            exclude: /.*\.(?:svn|cvs|tar|rar|psd).*/
        }]
    }
});

fis.config.set('roadmap.path', [{
    reg: /^\/pkg\/(.*\.(?:css|js))$/i,
    isMod: false,
    release: '/static/pkg/$1',
    url: '/fwmap/upload/728_promo_m/static/pkg/$1'
}, {
    reg: /^\/page\/(.*\.*)$/i,
    isMod: true,
    release: '/$1',
    url: '/fwmap/upload/728_promo_m/$1'
}, {
    reg: /^\/lib\/(.*\.js)$/i,
    //非组件化
    isMod: false,
    //发布到/static/js/xxx目录下
    release: '/static/lib/$1',
    url: '/fwmap/upload/728_promo_m/static/lib/$1'
}, {
    //一级同名组件，可以引用短路径，比如modules/jquery/juqery.js
    //直接引用为var $ = require('jquery');
    reg: /^\/modules\/([^\/]+)\/\1\.(js)$/i,
    //是组件化的，会被jswrapper包装
    isMod: true,
    //id为文件夹名
    id: '$1',
    release: '/static/modules/$1/$1' + '.js',
    url: '/fwmap/upload/728_promo_m/static/modules/$1/$1' + '.js'
}, {
    //modules目录下的其他文件
    reg: /^\/modules\/(.*)\.(js)$/i,
    //是组件化的，会被jswrapper包装
    isMod: true,
    //id是去掉modules和.js后缀中间的部分
    id: '$1',
    release: '/static/modules/$1' + '.js',
    url: '/fwmap/upload/728_promo_m/static/modules/$1' + '.js'
}, {
    //widgets
    reg: /^\/widgets\/(.*)\.(js)$/i,
    //是组件化的，会被jswrapper包装
    isMod: true,
    //id是去掉modules和.js后缀中间的部分
    id: '$1',
    release: '/static/widgets/$1' + '.js',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1' + '.js',
}, {
    reg: /^\/widgets\/(.*)\.(?:css|less)$/i,
    release: '/static/widgets/$1' + '.css',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1' + '.css',
}, {
    //图片
    reg: /^\/widgets\/(.*\.(?:png|gif|webp|jpg))$/i,
    isMod: false,
    release: '/static/widgets/$1',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1'
}, {
    reg: /^\/widgets\/(.*)\.(?:html)$/i,
    release: '/static/widgets/$1' + '.html',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1' + '.html',
}, {
    reg: /^\/widgets\/(.*)\.(?:json)$/i,
    release: '/static/widgets/$1' + '.json',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1' + '.json',
}, {
    reg: /^\/widgets\/(.*)\.(eot|svg|ttf|woff)$/i,
    release: '/static/widgets/$1' + '.$2',
    url: '/fwmap/upload/728_promo_m/static/widgets/$1' + '.$2',
    useDomain: false
}, {
    //其他css文件
    reg: "**.css",
    //css文件会做csssprite处理
    useSprite: true
}, {
    //readme文件，不要发布
    reg: /\/readme.md$/i,
    release: false
}]);

//将资源依赖文件map.js内联输出
fis.config.set('settings.postpackager.autoload.useInlineMap', true);

fis.config.set('modules.parser.less', 'less');

//将less文件编译为css
fis.config.set('roadmap.ext.less', 'css');

fis.config.set('modules.spriter', 'csssprites');

fis.config.set('modules.postprocessor.css', 'autoprefixer');
