
var devicePoint = function(p, callback) {
    p = p == null ? {} : p;
    $.extend(this, p);
    var that = this;
    that.cSel = that.moduleId + ' div.floor-plan';
    that.imgSel = that.cSel + ' img';
    that.dpSel = that.cSel + ' a.d-point';

    that.cw = 0; // 容器宽
    that.ch = 0; // 容器高
    that.iw = 0; // 原图宽
    that.ih = 0; // 原图高
    that.init = function() {
        $(that.imgSel).attr('src', that.floorPic)
        var img = new Image();
        img.src = that.floorPic;
        img.onload = function() {
            that.cw = $(that.moduleId)[0].offsetWidth;
            that.ch = $(that.moduleId)[0].offsetHeight;
            that.iw = img.width;
            that.ih = img.height;
            pointCenter();
            if (typeof callback == 'function') {
                callback(that);
            }
        };
    };

    function pointCenter() {
        
        // 尽可能以设备点为中点，设置显示位置
        var posX = $(that.dpSel).position().left,
            posY = $(that.dpSel).position().top,
            picTop, picLeft;

        if ((that.iw - posX) * 2 <= that.cw) {
            picLeft = that.iw - that.cw;
        } else {
            if (posX - (that.cw / 2) >= 0) {
                picLeft = posX - (that.cw / 2);
            } else {
                picLeft = 0;
            }
        }
        
        if ((that.ih - posY) * 2 <= that.ch) {
            picTop = that.ih - that.ch;
        } else {
            if (posY - (that.ch / 2) >= 0) {
                picTop = posY - (that.ch / 2);
            } else {
                picTop = 0;
            }
        }

        $(that.cSel).css('margin-left', -picLeft + 'px').css('margin-top', -picTop + 'px');
    }

    that.setPoint = function(left, top) {
        $(that.dpSel).css({
            top: top + 'px',
            left: left + 'px'
        });
        pointCenter();
    }

    that.init();
};

function getVersions(systemCode, callback) {
    $http.get({
        url: 'devices-monitor/versionsCanAdd',
        data: {
            systemCode: systemCode
        },
        forbidLoading:true
    }, function(res) {
        // var brands = res.result ? res.result[0].brands : [],
        //     versions = [];
        
        // for (var i = 0; i < brands.length; i++) {
        //     var b = brands[i];
        //     for (var j = 0; j < b.childSystems.length; j++) {
        //         var cs = b.childSystems[j];
        //         for(var k = 0; k < cs.versions.length; k++) {
        //             var v = cs.versions[k];
        //             var version = {};
        //             version.brandName = b.bName;
        //             version.systemName = cs.cName;
        //             version.versionCode = v.vCode;
        //             version.versionName = v.vVersion;
        //             versions.push(version);
        //         }
        //     }
        // }
        callback(res.result);
    });
}