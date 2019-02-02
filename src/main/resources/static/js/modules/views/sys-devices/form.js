/**
 * 系统设备表单
 * @param {
 *  moduleId: 表单唯一编号，所有的事件和方法都归属于该编号选择器内
 *  manageName： 打开表单时操作界面的实例名字，便于关闭表单时刷新界面
 *  scode: 系统编码
 *  vcode: 版本编码
 *  supplierId: 供应商编号
 * } p 
 */
var sysDeviceForm = function(p) {
    p = p == null ? {} : p;

    $.extend(this, p);
    var that = this;
    /**
     * 下拉列表框赋值-系统编码
     */
    that.valSystemCode = function() {
        var el = that.moduleId + ' select[name="systemCode"]';
        var core = function() {
            that.scode = $(el).val();
            that.valVersionCode();
        }
        if (that.scode) {
            $(el).val(that.scode);
            core();
        }
        $(el).unbind().change(function() {
            core();
        });
    }

    /**
     * 下拉列表框赋值-版本编码
     */
    that.valVersionCode = function() {
        var vEl = that.moduleId + ' select[name="deviceTypeCode"]';
        var core = function() {
            that.vcode = $(vEl).val();
            if (!that.vcode) {
                that.vcode = $($(vEl + ' option')[0]).attr('value');
                $(vEl).val(that.vcode);
            }
            that.valSupplierId();
            that.loadBaseinfo();
        };
        getVersions(that.scode, function(versions) {
            $(vEl).html('');
            versions.forEach(function(v){
                $(vEl).append('<option value="' + v.versionCode + '">' + v.versionName + '( ' + v.brandName + '-' + v.systemName + ')' + '</option>');
            })
            if (that.vcode) {
                $(vEl).val(that.vcode);
            }
            core();
        });
        $(vEl).unbind().change(function() {
            core();
        });
    };

    

    /**
     * 下拉列表框赋值-供应商
     */
    that.valSupplierId = function() {
        var sEl = $(that.moduleId + ' select[name="supplierId"]');
        $http.get({
            url: 'devices-monitor/suppliers',
            data: {
                versionCode: that.vcode
            },
            forbidLoading: true
        }, function(res) {
            sEl.html(res);
            if (that.supplierId) {
                sEl.val(that.supplierId);
            }
            that.formInit();
        });
        
    }

    that.loadBaseinfo = function() {
        var el = $(that.moduleId + ' div.other-info');
        $http.get({
            url: 'devices-monitor/baseinfo',
            data: {
                versionCode: that.vcode,
                deviceId: that.deviceId
            },
            forbidLoading: true
        }, function(res) {
            el.html(res);
        });
    }

    /**
     * 表单初始化
     */
    that.formInit = function() {
        var fi = this;
        // 验证后台参数
        fi.validateOtherInfo = function(callback) {
            var errorCount = 0; // 不合规输入计数
            function _validate(obj) {
                var regex = new RegExp(obj.pRegexExp.replace(/(^\s*)|(\s*$)/g, ''));
                var element = $(that.moduleId + ' input.form-control[data-p-code="' + obj.pCode + '"]');
                if (!regex.test(obj.val)) {
                    var error = '<span id="' + obj.pCode + '-error" class="help-block m-b-none"><i class="fa fa-times-circle"></i>请输入合法的' + obj.pDescription + '</span>';
                    element.after(error);
                    element.parent().parent().addClass('has-error');
                    errorCount++;
                } else {
                    element.parent().parent().removeClass('has-error');
                }
            }
            $(that.moduleId + ' div.other-info input.form-control').each(function() {
                var datas = $(this).data();
                datas.val = $(this).val();
                _validate(datas);
            });
            setTimeout(function() { // 恐正则表达式异步验证，延时返回
                callback(errorCount);
            });
        }
        $(that.moduleId + ' button[role="reset"]').unbind().click(function() {
            CommonUtil.formDataSetAndGet({
                container: that.moduleId,
                opt: 'reset'
            });
            that.devicePoint.setPoint(0, 0);
        });
        // 表单验证
        $(that.moduleId).validate({
            rules: {
                deviceName: {
                    required: true,
                    rangelength: [4, 30]
                },
                deviceCode: {
                    required: true,
                    maxlength: 30
                },
                remark:{
                    maxlength: 30
                },
                x: {
                    number: true,
                    min: 1,
                    max: that.devicePoint.iw
                },
                y: {
                    number: true,
                    min: 1,
                    max: that.devicePoint.ih
                },
                relationId: {
                    required: true
                }
            },
            messages: {
                deviceName: {
                    required: icon+'请填写设备名称',
                    rangelength: icon + '设备名称的长度控制在4-30个字符',
                },
                deviceCode: {
                    required: icon+'请填写设备编号',
                    maxlength: icon + '设备编号的输入长度控制在30个字符内'
                },
                remark: {
                    maxlength: icon + '位置描述的输入长度控制在30个字符内'
                },
                x: {
                    number: icon + 'x非数字',
                    min: icon + 'x的值不能小于0',
                    max: icon + 'x的值不能超过' + that.devicePoint.iw
                },
                y: {
                    number: icon + 'y非数字',
                    min: icon + 'y的值不能小于0',
                    max: icon + 'y的值不能超过' + that.devicePoint.ih
                },
                relationId: {
                    required: icon+'请填写序列号',
                }
            },
		    errorPlacement: function (error, element) {
                if(element.attr("name") == "x" || element.attr("name") == "y"){
                    element.parent().parent().parent().after(error);
                    $(error).css('color', '#a94442');
                } else {
    		        element.after(error)
                }
		    },
            submitHandler: function(form) {
                fi.validateOtherInfo(function(errorCount) {
                    if (errorCount == 0) {
                        var data = $(form).serializeObject();
                        data.deviceOtherInfo = [];
                        $(that.moduleId + ' div.other-info input.form-control').each(function() {
                            $(this).data().pValue = $(this).val();
                            data.deviceOtherInfo.push($(this).data());
                            delete data[$(this).data().pName];
                        });
                        // data.floorId = eval(that.manageName).cmParams.floorId;
                        $http.post({
                            url: 'device/save',
                            data: {
                                data: JSON.stringify(data)
                            },
                            forbidLoading: true
                        }, function() {
                            // 关闭弹窗
                            var layerId = $(that.moduleId).parent().parent().parent().attr('id').split('layui-layer')[1];
                            layer.close(layerId);

                            // 刷新关联父容器管理列表
                            if (that.manageName) {
                                layer.msg('保存成功！');
                                var manage = eval(that.manageName);
                                if (data.id) {
                                    manage.loadFloorPlan(manage.floorPlan.floorId, manage.floorPlan.systemCode, data.id);
                                } else {
                                    if (manage.searchParams.systemCode != '' && manage.searchParams.systemCode != data.systemCode) {
                                        manage.searchParams.systemCode = data.systemCode;
                                    }
                                    manage.searchParams.keySearch = 0;
                                    manage.searchDevices();    
                                }
                                
                            }
                        })
                    }
                });
                return false;
            }
        });
    };
    /**
     * 修改坐标
     */
    that.bindLocationChange = function() {
        var xEl = that.moduleId + ' input.form-control[name="x"]';
        var yEl = that.moduleId + ' input.form-control[name="y"]';
        $(xEl).unbind().change(changeCore);
        $(yEl).unbind().change(changeCore);

        function changeCore() {
            if ($(that.moduleId).valid()) {
                var x = parseInt($(xEl).val());
                var y = parseInt($(yEl).val());
                // 设置设备定点
                that.devicePoint.setPoint(x, y);
            }
        }
    };

    that.init = function() {
        
        that.valSystemCode();

        // 设备定点初始化
        that.devicePoint = new devicePoint({
            moduleId: that.moduleId + ' div.dp-content',
            floorPic: eval(that.manageName).floorPlan.img.src
        }, function(res) {
            $(that.moduleId + ' .origin_pic_wh').html('(' + res.iw + ',' + res.ih + ')');
            
            that.bindLocationChange();
        });


        
    };

    that.init();
}