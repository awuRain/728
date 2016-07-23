var bridge = {
    getCityProvince: function(callback) {
        var self = this;
        this.getCity(function(data) {
            if (data.cityId) {
                $.ajax({
                    url: self.host + '/business/ajax/promotion/getmappingbycityid?map_city_id=' + data.cityId,
                    method: "get",
                    dataType: 'jsonp',
                    success: function(res) {
                        if (res.errno == 0) {
                            callback && callback({
                                city: {
                                    sname: res.data.city,
                                    sid: res.data.sid,
                                    city_code: res.data.city_code,
                                    city_id: data.cityId
                                },
                                province: {
                                    sname: res.data.province.sname,
                                    sid: res.data.province.sid,
                                    city_code: res.data.province.city_code,
                                    city_id: res.data.province.city_id
                                }
                            });
                        } else {
                            callback && callback(null);
                        }
                    },
                    fail: function() {
                        callback && callback(null);
                    }
                });
            } else {
                callback && callback(null);
            }
        });
    },

    getProvinceSid: function(callback) {
        var self = this;
        this.getCity(function(data) {
            if (data.cityId) {
                $.ajax({
                    url: self.host + "/business/ajax/dailysale/getsidbycityid?map_city_id=" + data.cityId,
                    method: "get",
                    dataType: 'jsonp',
                    success: function(res) {
                        if (res.errno == 0) {
                            self.sid = res.data.sid;
                            callback && callback(self.sid);
                        } else {
                            callback && callback(null);
                        }
                    },
                    fail: function() {
                        callback && callback(null);
                    }
                });
            } else {
                callback && callback(null);
            }
        });
    },

    /**
     * 根据当前定位拿到地图的city信息
     */
    getCity: function(callback) {
        $.ajax({
            'url': 'http://api.map.baidu.com/location/ip?ak=x78oVekBLBQQ6VIvPoX7eNDj&callback=?',
            'dataType': 'jsonp',
            success: function(data) {
                if (data && data.status === 0 && data.content && data.content.address_detail) {
                    var result = {
                        province: data.content.address_detail.province,
                        city: data.content.address_detail.city,
                        cityId: data.content.address_detail.city_code
                    }
                    callback && callback(result);
                } else {
                    callback && callback({
                        province: null,
                        city: null,
                        cityId: null
                    });
                }
            },
            fail: function() {
                callback && callback({
                    province: null,
                    city: null,
                    cityId: null
                });
            }
        });
    },

    /**
     * 空函数，没啥卵用
     */
    initShare: function() {}
};

module.exports = bridge;
