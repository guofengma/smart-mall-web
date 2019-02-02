var sysDeviceDetail = function(p) {
    p = p == null ? {} : p;
    $.extend(this, p);
    var that  = this;
    that.controlOptsDisplay = function() {
        var optIsOk = eval(that.manageName).codeCanAdd(that.scode);
        if (!optIsOk) {
            $(that.moduleId + ' div.form-detail-opts').addClass('hide');
        }
    }
    that.displayVersionName = function(code) {
        if (code) {
            that.vcode = code;
        }
        if (that.scode) {
            that.controlOptsDisplay();
            var versionName;
            getVersions(that.scode, function(versions) {
                versions.forEach(function(v){
                    if (v.versionCode == that.scode) {
                        versionName = v.versionName + '( ' + v.brandName + '-' + v.systemName + ')';
                    }
                });
                if (versionName) {
                    $(that.moduleId + ' .versionTypeName').html(versionName);
                } else {
                    $(that.moduleId + ' .versionTypeName').parent().addClass('hide');
                }
            });

        }
    };

    that.init = function() {
        new devicePoint({
            moduleId: that.moduleId + ' div.dp-content',
            floorPic: eval(that.manageName).floorPlan.img.src
        }, function(res) {
            $(that.moduleId + ' .origin_pic_wh').html('(' + res.iw + ',' + res.ih + ')')
        }); 
        that.displayVersionName();

        if (!eval(that.manageName).editModel) {
            $(that.moduleId + ' div.form-detail-opts').addClass('hide');
        }
        $(that.moduleId + ' a.parent-click').unbind().click(function() {
            var datas = $(this).data();
            if (datas.opt) {
                // 关闭弹窗
                var layerId = $(that.moduleId).parent().parent().attr('id').split('layui-layer')[1];
                layer.close(layerId);
                eval(that.manageName).cmParams = datas;
                eval(that.manageName + '.' + datas.opt + '()');
            }
        });
        
    };


    that.init();
};