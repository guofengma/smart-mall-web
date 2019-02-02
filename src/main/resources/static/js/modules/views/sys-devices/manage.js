var deviceMonitorManage = function(p) {
    p = p == null ? {} : p;
    $.extend(this, p);
    var that = this;

    that.fpSuffix = that.moduleId + ' div.view-center > div.core';
    that.deviceCtSel = that.moduleId + ' .contextmenu[data-role="device"]';
    that.fpCtSel = that.moduleId + ' .contextmenu[data-role="floor-plan"]';
    that.optData = {};
    that.timestamp = new Date().getTime();
    that.searchParams = {};
    that.operationCodes = [];
    
    /**
     * 界面操作初始化：超链接，按钮
     */
    that.fnInit = function() {
        that.operationCodes.forEach(function(i) {
            $(that.moduleId + ' div[oper-code="' + i + '"]').removeClass('hide');
            $(that.moduleId + ' a[oper-code="' + i + '"]').removeClass('hide');
        });

        $(that.moduleId + ' a').unbind('click').click(function(e) {
            that.optData = $(this)[0].dataset;
            if (that.optData.opt) {
                eval('that.' + that.optData.opt + '()');
            }
        });
        $(that.moduleId + ' form.search').validate({
		    rules: {
		        keyword: {
		            required: true,
		        },
		    },
		    messages: {
		    	keyword: {
		            required: icon + '请输入关键字'
		        },
		    },
		    errorPlacement: function (error, element) {
                layer.msg(error);
		    },
		    submitHandler: function(form) {
                that.optData = $(form).serializeObject();
                that.optData.page = 1;
                that.searchDevices();
            }
        });

        $(that.moduleId + ' form.search').unbind('keydown').keydown(function(e) {
            var theEvent = e || window.event;
            var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
            if (code == 13) {
				$(that.moduleId + ' form.search').submit();
				return false;
		    }
		});
        that.bindContextMenu();
    }
    that.codeCanAdd = function(code) {
        var codeIsOK = false;
        if (code) {
            for (i in that.codesCanAdd) {
                var c = that.codesCanAdd[i];
                if (c == code) {
                    codeIsOK = true;
                }
            }
        }
        return codeIsOK;
    }

    that.init = function() {
        $http.get({
            url: 'devices-monitor/manage',
            forbidLoading: true
        }, function(res) {
            $(that.moduleId).html(res);
            
            that.operationCodes = $(that.moduleId + ' div.sys-devices')[0].dataset.operationcodes.split(',');

            if (that.editModel) {
                // 默默的将右键菜单添加到页面上
                $http.get({
                    url: 'devices-monitor/contextmenu',
                    forbidLoading: true
                }, function(res) {
                    $(that.moduleId).append(res);
                });
            } else {
                $(that.moduleId + ' .ap-oper').addClass('hide');
            }
    
            // 查询第一个区域关联的楼层情况
            $.extend(that.optData, $($($(that.moduleId + ' ul[aria-labelledby="areaList"] > li')[0]).find('a')[0]).data());
            $.extend(that.optData, $($($(that.moduleId + ' ul[aria-labelledby="systemList"] > li')[1]).find('a')[0]).data());
            
            that.relateFloors();
            
            var dmCodes = window.localStorage['dm-codes'];
            if (dmCodes && dmCodes.substring(0, 1) == '[') {
                that.codesCanAdd = JSON.parse(window.localStorage['dm-codes']);
            }
        });
    };

    // 充值关键字搜索表单
    that.resetSearchForm = function() {
        $(that.moduleId + ' form.search input[name="keyword"]').val('');
        $.extend(that.optData, {
            page: 1,
            keyword: ''
        });

        if (that.optData.keySearch == 1) {
            that.optData.systemCode = '';
            that.searchDevices();
        } else {
            $.extend(that.optData, $($($(that.moduleId + ' ul[aria-labelledby="areaList"] > li')[0]).find('a')[0]).data());
            $.extend(that.optData, $($($(that.moduleId + ' ul[aria-labelledby="systemList"] > li')[1]).find('a')[0]).data());
            that.relateFloors();
        }
    }
    /**
     * 关联楼层渲染
     */
    that.relateFloors = function() {
        if (!that.optData.areaId) {
            return false;
        }
		$http.get({
			url: 'devices-monitor/floorsByAreaId?' + that.timestamp,
			data: {
				areaId: that.optData.areaId
			},
			forbidLoading: true
		}, function(res) {
            if (res.length > 0) {
                var floorList = $(that.moduleId + ' ul[aria-labelledby="floorList"]');
                floorList.html('');
                if (res.length > 0) {
                    var minFloorNo = null;
                    var initFloorId;
                    var initFloorName;
                    res.forEach(function(floor) {
                        if (floor.serialNumber > 0 && (minFloorNo == null || floor.serialNumber < minFloorNo)) {
                            minFloorNo = floor.serialNumber;
                            initFloorId = floor.id;
                            initFloorName = floor.floorName;
                        }
                        floorList.append('<li><a href="javascript:;" data-opt="searchDevices" data-area-id="' + floor.areaId + '" data-floor-id="' + floor.id + '" data-floor-name="' + floor.floorName + '" data-page="1">' + floor.floorName + '</a></li>');
                    })
                    $.extend(that.optData, {
                        floorId: initFloorId,
                        floorName: initFloorName,
                    })
                    that.searchDevices();
                }
            } else {
                layer.msg(that.optData.areaName + '无关联楼层，界面初始化失败，请手动选择查看');
            }
		})
    }
    /**
     * 下拉菜单过滤显示文本
     * @param {*} filterId 下拉菜单唯一标识
     * @param {*} displayText 显示文本
     */
    function filterDisplay(filterId, displayText) {
        var filter = $(that.moduleId + ' button[id="' + filterId + '"] > span.toggle-name');
        var filterName = filter.html();
        if (displayText && displayText !== filterName) {
            filter.html(displayText);
        }
    }
    
    /**
     * 折叠系统列表
     */
    that.foldSystem = function() {
        var systemCode = that.optData.systemCode;
        if (that.searchParams.keySearch == 1 || that.searchParams.systemCode == '' || that.searchParams.systemCode == systemCode) {
            var systemEl = $(that.moduleId + ' #by-system-' + systemCode);
            if(systemEl.hasClass('active')) {
                systemEl.removeClass('active');
            } else {
                systemEl.addClass('active');
            }
        }
    };
    /**
     * 根据楼层编号加载楼层平面图
     * 如果存在设备编号，选中平面图上对应的设备
     */
    that.loadFloorPlan = function(floorId, systemCode, deviceId) {
        // 如果当前楼层平面的关联楼层和系统和传入的一致，刷新楼层图
        if (that.floorPlan && that.floorPlan.floorId == floorId && that.floorPlan.systemCode == systemCode) {
            that.floorPlan.init(function() {
                setTimeout(function() {
                    that.bindContextMenu();
                    $(that.moduleId + ' a.d-point[data-opt="detail"]').unbind('click').click(function() {
                        that.optData = $(this).data();
                        that.detail();
                    });
                    
                    if (deviceId) {
                        that.activeDevice(deviceId);
                    }
                });
            });
           
        } else { // 否则重新加载楼层平面图和关联系统设备
            $http.get({
                url: 'floor/detail',
                data: {
                    id: floorId
                },
                forbidLoading: true
            }, function(res) {
                var floorInfo = res.result;
                var title = floorInfo.areaName + ' ' + floorInfo.floorName;
                if (that.searchParams.keySearch != 1) {
                    title += ' ' + that.searchParams.systemName;
                }
                $(that.moduleId + ' .view-center > div.title > div.brief').html(title);
                that.floorPlan = new floorPlan({
                    title: title,
                    container: that.fpSuffix,
                    floorId: floorId,
                    systemCode: systemCode
                }, function() {
                    setTimeout(function() {
                        that.bindContextMenu();
                        $(that.moduleId + ' a.d-point[data-opt="detail"]').unbind('click').click(function() {
                            that.optData = $(this).data();
                            that.detail();
                        });
                        if (deviceId) {
                            that.activeDevice(deviceId);
                        }
                    });
                });
            })
        }
        
    }
    /**
     * 如果是全部系统查询或者筛选系统和自身匹配，则刷新当前系统设备列表
     * 否则 重新加载
     */
    that.singleLoad = function(systemCode) {
        that.searchParams.foldControl = 0;
        if (that.searchParams.systemCode == '' || that.searchParams.systemCode == systemCode) {
            that.systemCount = 1;
            that.systemLoadCount = 0;
            that.pageDevices(systemCode);
        } else {
            that.searchParams.systemCode = systemCode;
            that.searchDevices();
        }
    }

    that.searchByPhysicalState = function() {
        var systemCode = that.optData.systemCode;
        filterDisplay('physicalState-' + systemCode, that.optData.name);
        $('#physicalState-' + systemCode).attr('data-physical-state', that.optData.value);
        that.optData = {};
        that.singleLoad(systemCode);
    };

    that.searchSortList = function() {
        var systemCode = that.optData.systemCode;
        filterDisplay('sortList-' + systemCode, that.optData.name);
        $('#sortList-' + systemCode).attr('data-order', that.optData.order).attr('data-sort', that.optData.sort);
        that.optData = {};
        that.singleLoad(systemCode);
    };

    /**
     * 搜索关联设备
     */
    that.searchDevices = function() {
        var sp = that.searchParams;
        $.extend(sp, that.optData);
        
        // floorId, areaId, systemCode 发生改变，下拉赋值进行改变
        var areaName = $(that.moduleId + ' ul[aria-labelledby="areaList"] > li > a[data-area-id="' + sp.areaId + '"]').html(); 
        $(that.moduleId + ' button[id="areaList"] > span.toggle-name').html(areaName);
        that.searchParams.areaName = areaName;

        var floorName = $(that.moduleId + ' ul[aria-labelledby="floorList"] > li > a[data-floor-id="' + sp.floorId + '"]').html(); 
        $(that.moduleId + ' button[id="floorList"] > span.toggle-name').html(floorName);
        that.searchParams.floorName = floorName;

        var codeName = $(that.moduleId + ' ul[aria-labelledby="systemList"] > li > a[data-system-code="' + sp.systemCode + '"]').html();
        $(that.moduleId + ' button[id="systemList"] > span.toggle-name').html(codeName);
        that.searchParams.systemName = codeName;

        // 筛选全部系统，或者在关键字查询界面，查询全部系统关联设备
        if (!sp.systemCode || sp.systemCode == '' || sp.keySearch == 1) {
            that.systemCount = $(that.moduleId + ' ul[aria-labelledby="systemList"] > li').length;
            that.systemLoadCount = 1;
            $(that.moduleId + ' ul[aria-labelledby="systemList"] > li > a').each(function(i) {
                var code = $(this).data().systemCode
                if (code) {
                    // 全部系统筛选的时候，初始化状态过滤和排序条件
                    filterDisplay('sortList-' + code, "默认↑↓");
                    $('#sortList-' + code).attr('data-order', '').attr('data-sort', '');

                    filterDisplay('physicalState-' + code, "状态");
                    $('#physicalState-' + code).attr('data-physical-state', '');
                    that.pageDevices(code);
                }
            });
            $.extend(sp, {
                foldControl: 1
            });
        } else {
            $(that.moduleId + ' ul[aria-labelledby="systemList"] > li > a').each(function(i) {
                var code = $(this).data().systemCode
                if (code && code != that.searchParams.systemCode) {
                    $(that.moduleId + ' #by-system-' + code).addClass('hide');
                    // var contentSuffix = that.moduleId + ' #by-system-' + code + ' > div.content';
                    // // 搜索条数归0
                    // $(contentSuffix + ' span.match-count').html(0);
                    // $(contentSuffix + ' div.list').remove();
                    // $(contentSuffix).append('<div class="list empty">暂无设备</div>');
                }
            });

            that.systemCount = 1;
            that.systemLoadCount = 0;
            that.pageDevices();
        }
        // 当筛选模式和界面呈现tab模式不一样，进行更正
        that.searchParams.keySearch = !that.searchParams.keySearch ? 0 : that.searchParams.keySearch;


        var tabEl = $(that.moduleId + ' a[data-key-search="' + that.searchParams.keySearch + '"]').parent();
        tabEl.siblings().removeClass('active');
        tabEl.addClass('active');
        var href = $(that.moduleId + ' a[data-key-search="' + that.searchParams.keySearch + '"]').attr('href');
        $(href).siblings().removeClass('active');
        $(href).addClass('active');

        // 加载楼层设备数据统计
        that.loadStat();
    }

    
    that.pageDevices = function(code) {
        var params = {};
        $.extend(params, that.searchParams);
        code = code ? code : params.systemCode;
        params.systemCode = code;

        // 根据系统码获得状态和排序参数
        $.extend(params, $('#sortList-' + code)[0].dataset);
        params.physicalstate = $('#physicalState-' + code)[0].dataset.physicalState;
        
        
        $http.get({
            url: 'devices-monitor/systemDevices?' + new Date().getTime(),// 每次都是最新请求
            data: params,
			forbidLoading: true
        }, function(res) {
            var bySystemSel = that.moduleId + ' #by-system-' + code;
            $(bySystemSel).removeClass('hide');
            var contentSuffix = bySystemSel + ' > div.content';
            // 渲染列表
            $(contentSuffix + ' div.list').remove();
            $(contentSuffix).append(res);
            var pagination = $(contentSuffix + ' div.list > div.pagination');
            var pdata = {};
            if (pagination.length > 0) {
                pdata = pagination.data();
                if (parseInt(pdata.page) === 1) {
                    // 匹配项数赋值
                    $(contentSuffix + ' span.match-count').html(pdata.totalCount);
                }
                // 超过1页初始化分页
                if (pdata.totalCount > pdata.limit) {
                    laypage.render({
                        elem: pagination[0],
                        count: pdata.totalCount,
                        curr: pdata.page,
                        layout: ['prev', 'next'],
                        jump: function(obj, first){
                            if (!first) { 
                                that.searchParams.page = obj.curr;
                                that.searchParams.foldControl = 0;
                                that.systemCount = 1;
                                that.systemLoadCount = 0;
                                that.pageDevices(code);
                            }
                        }
                    });
                }
            } else {
                // 匹配项数赋值
                $(contentSuffix + ' span.match-count').html(0);
            }

            if (that.searchParams.keySearch == 1) { // 关键字搜索时，系统设备存在数据则展开，否则关闭
                if (pdata.totalCount > 0) {
                    $(bySystemSel).addClass('active');
                } else {
                    if (that.searchParams.foldControl == 1) {
                        $(bySystemSel).removeClass('active');
                    }
                }
            } else { // 条件筛选，全部系统则折叠所有数据
                if (that.searchParams.systemCode == '' && that.searchParams.foldControl == 1) {
                    $(bySystemSel).removeClass('active');
                } else {// 单个习题通筛选关闭其他打开筛选系统
                    $(that.moduleId + ' #by-system-' + code).siblings().removeClass('active');
                    $(that.moduleId + ' #by-system-' + code).addClass('active');
                }
            }

            that.systemLoadCount ++;
            if (that.systemLoadCount == that.systemCount) { // 表示所有系统设备列表加载完成
                that.fnInit(); // 方法初始化
                if (that.searchParams.keySearch != 1) {
                    that.loadFloorPlan(params.floorId, that.searchParams.systemCode);
                }
            }

            // 编辑模式下，不显示状态
            if (that.editModel) {
                $(contentSuffix + ' div.list i.d-icon').css('display', 'none');
            }
        })
    }
    function unActiveDevice() {
        var activeEl = $(that.fpSuffix + ' a.d-point.active');
        if (activeEl.length > 0) {
            var _dicon = $(activeEl[0]);
            var _svgUse =  _dicon.find('svg').find('use');
            _svgUse.attr('xlink:href','#icon-' + _dicon.data().systemCode + '-' + _svgUse.data().color);
            _dicon.removeClass('active');
        }
    }
    that.activeDevice = function(deviceId) {
        var dicon = $(that.fpSuffix + ' a.d-point[data-device-id="' + deviceId + '"]');
        
        unActiveDevice();
        dicon.addClass('active');
        var svgUse = dicon.find('svg').find('use');
        var tag = svgUse ? svgUse.attr('xlink:href') : null;
        if (tag) {
            var color = tag.split('-')[2];
            // 灰色图标的选中状态也是蓝色水滴
            if (color == 'gray') {
                color = 'blue';
            }
            svgUse.attr('xlink:href','#icon-location-' + color);
            // 关键字搜索模式下， 只查看单个设备详情
            if (that.searchParams.keySearch == 1) {
                dicon.siblings('.d-point').addClass('hide');
                dicon.removeClass('hide');
            }
        } 
    }
    that.locationDevice = function() {
        if (that.searchParams.keySearch == 1) {

            if (that.floorPlan && that.floorPlan.floorId == that.optData.floorId && that.floorPlan.systemCode == '') {
                that.activeDevice(that.optData.deviceId);
            } else {
                that.loadFloorPlan(that.optData.floorId, '', that.optData.deviceId);
            }
        } else {
            that.activeDevice(that.optData.deviceId);
        }
    }

    that.detail = function() {
        that.cmParams.manageName = that.name;
        var formParams = {};
        $.extend(formParams, that.cmParams);
        $.extend(formParams, that.optData);
        $http.get({
            url: 'devices-monitor/detail',
            data: formParams,
            forbidLoading: true
        }, function(res) {
            var lindex = layer.open({
                type: 1,
                title: '设备详情',
                skin: 'layui-layer-demo', //样式类名
                closeBtn: 1, 
                anim: 2,
                shadeClose: false, //开启遮罩关闭
                area: ['800px', '600px'],
                content: res,
                end: function() {
                    layer.close(lindex)
                }
            });
            setTimeout(function() {
                that.operationCodes.forEach(function(i) {
                    $('div[oper-code="' + i + '"]').removeClass('hide');
                    $('a[oper-code="' + i + '"]').removeClass('hide');
                });
            })
            
            $(that.deviceCtSel).addClass('hide');
        });
    }


    var isEdit = false;
    function exitLocation() {
        var dSel = that.floorPlan.fpSel + ' a.d-point[data-device-id="' + that.cmParams.deviceId + '"]';
        $(that.floorPlan.moveSel).unbind('mousedown').unbind('mouseup');
        $(dSel).attr('style',  $(that.floorPlan.moveSel).attr('style')).removeClass('hide');
        $(that.floorPlan.moveSel).addClass('hide');
        isEdit = false;
    }
    that.move = function() {
        isEdit = true;
        layer.msg('请拖拽设备完成位置编辑');
        $(that.deviceCtSel).addClass('hide');
        var dSel = that.floorPlan.fpSel + ' a.d-point[data-device-id="' + that.cmParams.deviceId + '"]';
        
        $(that.floorPlan.moveSel).attr('style',  $(dSel).attr('style')).removeClass('hide');
        $(dSel).addClass('hide');

        $(that.floorPlan.moveSel).unbind('mousedown').mousedown(function(e) {
            var offset = $(this).offset();
            e.stopPropagation();

            this.posix = {
                'w': $(this)[0].clientWidth,
                'h': $(this)[0].clientHeight,
                'x': e.pageX - offset.left,
                'y': e.pageY - offset.top
            };

            $.extend(document, {
                'move': true,
                'move_target': this,
                'move_container': $(that.floorPlan.fpSel)
            });
            
        }).unbind('mouseup').mouseup(function(e) {
            var newX = parseFloat($(that.floorPlan.moveSel).css('left').split('px')[0]) / that.floorPlan.originScale;
            var newY = parseFloat($(that.floorPlan.moveSel).css('top').split('px')[0]) / that.floorPlan.originScale;

            $http.post({
                url: 'devices-monitor/setPoint',
                data: {
                    id: that.cmParams.deviceId,
                    x: newX.toFixed(2),
                    y: newY.toFixed(2)
                },
                forbidLoading: true
            }, function() {
                exitLocation();
                layer.msg('编辑位置成功');
            })

        });
    }

    that.form = function() {
        that.cmParams.manageName = that.name;
        var formParams = {};
        $.extend(formParams, that.cmParams);
        $.extend(formParams, that.optData);
        if (!formParams.floorId) {
            formParams.floorId = that.floorPlan.floorId;
        }
        $http.get({
            url: 'devices-monitor/form',
            data: formParams,
            forbidLoading: true
        }, function(res) {
            var lindex = layer.open({
                type: 1,
                title: formParams.deviceId ? '编辑设备' : '添加设备',
                skin: 'layui-layer-demo', //样式类名
                closeBtn: 1, 
                anim: 2,
                shadeClose: false, //开启遮罩关闭
                area: ['888px', '630px'],
                content: res,
                end: function() {
                    layer.close(lindex);
                }
            });
            $(that.deviceCtSel).addClass('hide');
        });

        
    }
    
    that.remove = function() {
        var systemCode = that.cmParams.systemCode;
        layer.confirm('请确认移除?', {
            icon : 3,
            btn : [ '确认', '取消' ]// 按钮
        }, function(cindex) {
            layer.close(cindex);
            $http.post({
                url: 'device/remove',
                data: {
                    id: that.cmParams.deviceId
                },
                forbidLoading: true
            }, function() {
                that.systemCount = 1;
                that.systemLoadCount = 0;
                that.searchParams.foldControl = 0;
                that.pageDevices(systemCode);
            });
        }, function(cindex) {
            layer.close(cindex);
        });
        $(that.deviceCtSel).addClass('hide');
    }
    that.add = function() {
        $(that.fpCtSel).addClass('hide');
        $(that.fpSuffix + ' .fixed-transparent').css('cursor', 'url(img/tools/' + that.optData.systemCode + '/' + that.optData.systemCode + '.cur),crosshair');
        // 给平面图绑定点击事件
        $(that.moduleId + ' div.floor-plan').unbind('click').bind('click', function(e) {
            that.pgPointSelected(e);
        }); 
    }

    that.upload = function() {
        $(that.fpCtSel).addClass('hide');
        var sp = that.searchParams;
        DeviceUpload.init({
            areaId: sp.areaId,
            areaName: sp.areaName,
            floorId:sp.floorId,
            floorName:sp.floorName,
            mallId: window.localStorage['mallId']
        });
    }

    that.cmParams = {};
    that.pgPointSelected = function(e) {
        var fpSel = that.fpSuffix + ' div.floor-plan'; // 拖拽对象选择器 计算拖拽偏移量
        var imgSel = fpSel + ' > img'; // 图片选择器 计算图片初始长宽
        var fpScale = that.floorPlan.pgBgScale; // 拖拽缩放比例
        var imgScale = that.floorPlan.originScale; // 图片原始拖放比例

        // 计算鼠标点相对于图片盛放容器的坐标点

        // 鼠标相对页面坐标（x, y）
        var x = e.originalEvent.clientX;
        var y = e.originalEvent.clientY;
        
        // 拖拽容器相对坐标（x1, y1）
        var x1 = $(that.fpSuffix)[0].offsetLeft;
        var y1 = $(that.fpSuffix)[0].offsetTop;

        // 模块相对页面坐标（x, y）
        var x2 = $(that.moduleId)[0].offsetLeft;
        var y2 = $(that.moduleId)[0].offsetTop;

        var x3 = $('#store-manage')[0].offsetLeft;
        var y3 = $('#store-manage')[0].offsetTop;

        // 相减得到鼠标相对拖拽容器的坐标（x3, y3）
        var x3 = x - x1 - x2 - x3;
        var y3 = y - y1 - y2 - y3 - 20;


        // 计算图片缩放偏移量

        var imgW = $(imgSel).width();
        var imgH = $(imgSel).height();
        var scaleW = imgW * fpScale;
        var scaleH = imgH * fpScale;
        // （放大后的图片长宽 - 原始图片的长宽 ）/ 2 = 初始偏移量（left, top）
        // 计算图片的拖拽的相对偏移量(left, top)
        // 相减得到最终的偏移量（left, top）
        var left = (scaleW - imgW) / 2 - $(fpSel)[0].offsetLeft;
        var top = (scaleH - imgH) / 2 - $(fpSel)[0].offsetTop;
       

        that.cmParams.x = ((x3 + left) / fpScale / imgScale).toFixed(2);
        that.cmParams.y = ((y3 + top)  / fpScale / imgScale).toFixed(2);

        
        $(that.fpSuffix + ' .fixed-transparent').css('cursor', 'pointer');
        $(that.moduleId + ' div.floor-plan').unbind('click');

        that.form();
    };

    that.bindContextMenu = function() {
        
        if ($(that.deviceCtSel).length > 0) {
            $(that.moduleId + ' a[right-click="1"]').unbind('contextmenu').on('contextmenu', function(e) {
                e.preventDefault();
                unActiveDevice();
                $(that.fpCtSel).addClass('hide');
                var ct = this;
                // 右键菜单事件
                ct.core = function() {
                    that.cmParams = $(ct).data();
                    // that.locationDevice();
                    var px = $(that.moduleId)[0].offsetLeft + $('#store-manage')[0].offsetLeft;//180
                    var py = $(that.moduleId)[0].offsetTop + $('#store-manage')[0].offsetTop;//66
                    var x = e.pageX; //244
                    var y = e.pageY; //362
                    $(that.deviceCtSel).removeClass('hide').css({
                        top: (y - py) + 'px',
                        left: (x - px) + 'px'
                    });

                    $(document).one('click',function(e){
                        if (!e.target.offsetParent || e.target.offsetParent.className != 'contextmenu') {
                            $(that.deviceCtSel).addClass('hide');
                        }
                    })
                };
                var ctData = $(ct).data();
                if (!that.codeCanAdd(ctData.systemCode)) {
                    return false;
                }
                if (ctData.locate == 1) {
                    $(that.deviceCtSel + ' > div.item[oper-code="move"]').removeClass('hide');
                } else {
                    $(that.deviceCtSel + ' > div.item[oper-code="move"]').addClass('hide');
                }
                if (isEdit) {
                    layer.confirm('有设备位置未完成编辑，是否放弃编辑?', {
                        icon : 3,
                        btn : [ '放弃', '去编辑' ]// 按钮
                    }, function(cindex) {
                        exitLocation();
                        layer.close(cindex);
                        ct.core();
                    }, function(cindex) {
                        layer.close(cindex);
                    });
                } else {
                    ct.core();
                }

            }); 
        }

        if ($(that.fpCtSel).length > 0) {
            $(that.moduleId + ' div.floor-plan').unbind('contextmenu').on('contextmenu', function(e) {
                if (e.target.className == 'fixed-transparent') {
                    e.preventDefault();
                    if (isEdit) {
                        return false;
                    }
                    unActiveDevice();
                    $(that.deviceCtSel).addClass('hide');
                    var ct = this;
                    that.cmParams = $(ct).data();
                    // that.locationDevice();
                    var px = $(that.moduleId)[0].offsetLeft + $('#store-manage')[0].offsetLeft;//180
                    var py = $(that.moduleId)[0].offsetTop + $('#store-manage')[0].offsetTop;//66
                    var x = e.pageX; //244
                    var y = e.pageY; //362
                    $(that.fpCtSel).removeClass('hide').css({
                        top: (y - py) + 'px',
                        left: (x - px) + 'px'
                    });
				
                    $(document).one('click',function(e){
                        if (!e.target.offsetParent || e.target.offsetParent.className != 'contextmenu') {
                            $(that.fpCtSel).addClass('hide');
                        }
                    });
                }
            });
        }
    };

    that.syncAp = function() {
        $http.post({
            url: 'device/synchronizeApDevice',
            oper_cn: '同步'
        }, function() {
            layer.msg('同步完成');
            that.optData = {};
            that.searchParams.foldControl = 0;
            that.searchParams.systemCode = 'ap';
            that.searchDevices();
        })
    }

    that.manageAp = function() {
        let tempModule = 'ap.manager.web';
        $http.get({
            url: 'system/' + tempModule + '/url',
            type: 'get',
            data: {
                module: tempModule
            },
            forbidLoading: false,
        }, function(res) {
            if(res.success) {
                // window.open(res.result);
                layer.open({
                    type: 2,
                    title: 'ap管理器',
                    shadeClose: true,
                    shade: false,
                    maxmin: true, //开启最大化最小化按钮
                    area: ['893px', '600px'],
                    content: res.result
                });
            }
        })
    };

    that.loadStat = function() {
        if (that.searchParams.keySearch == 1) {
            $(that.moduleId + ' div.stat').addClass('hide');
        } else {
            $http.get({
                url: 'store/statisticData',
                data: that.searchParams,
                forbidLoading: true
            }, function(res) {
                var data = res.result;
                var amount = parseInt(data.amount);
                var error = parseInt(data.error);
                var normal = amount - error,
                    html = '';
                
                if(!that.editModel) {
                    html = '<span>设备总数： ' + amount + '</span>';
                    if (normal > 0) {
                        html += '<span>正常设备数： ' + normal + '</span>';
                    }
                    if (error > 0) {
                        html += '<span>异常设备数： <font class="text-danger">' + error + '</font></span>';
                    }
                    
                    if (data.others && data.others.length > 0) {
                        for (let i = 0; i < data.others.length; i++) {
                            let item = data.others[i],
                                key = item.businessState,
                                value = item.businessStateCount;
                            html += '<span>' + key + '： ' + value + '</span>';
                        }
                    }
                } else {
                    html = '<span>设备总数： ' + amount + '</span>';
                }
                $(that.moduleId + ' div.view-center > div.title > .stat').html(html).removeClass('hide');
            });
        }
    };

    that.init();
    
};
