var groupDevices = (function() {
    var init;
    var moduleId;
    var systemCode;
    var groupId;
    var globalSelectors;
    var opts;
    var controlCenter = {
        setGlobalParams: function(p) {
            p = p ? p : {};
            if (p.systemCode == null) {
                return false;
            }
            systemCode = p.systemCode;
            moduleId = '#' + systemCode + '-group-devices';
            groupId = null;
            globalSelectors = null;
            opts = null;

        },
        setGlobalSelectors: function() {
            globalSelectors = {
                groupSearchForm: moduleId + ' .group-search-form',
                groupDevicesSearchForm: moduleId + ' .group-devices-search-form',
                groupDevicesView: moduleId + ' .group_devices_view > div.data-list'
            }
        },
        setOpts: function(systemCode) {
            opts = {
                addGroup: moduleId + ' button[data-opt="add-group"]',
                editGroup: moduleId + ' a[href-opt="edit-group"]',
                addDevices: moduleId + ' button[data-opt="add-devices"]',
                removeDevices: moduleId + ' button[data-opt="remove-devices"]',
                moveDevices: moduleId + ' button[data-opt="move-devices"]',
                pageGroupDevices: moduleId + ' a[href-opt="page-group-devices"]'
            };
        },
        eventBind: function() {
            $(opts.addGroup).unbind('click').bind('click', function() {
                fns.openGroupForm();
            });
            $(opts.addDevices).unbind('click').bind('click', fns.openDevicesSelector);
            $(opts.removeDevices).unbind('click').bind('click', fns.removeDevicesRelate);
            $(opts.moveDevices).unbind('click').bind('click', fns.changeDevicesRelate);
            $(globalSelectors.groupSearchForm + ' button[role="reset"]').unbind('click').bind('click', function() {
                CommonUtil.formDataSetAndGet({
                    container: globalSelectors.groupSearchForm,
                    data: {
                        name: ''
                    }
                }, function() {
                    fns.renderGroupList();
                });
            });
            $(globalSelectors.groupSearchForm + ' button[role="submit"]').unbind('click').bind('click',function(){
            	fns.renderGroupList();
            });
          //搜索框内的回车事件
            $(globalSelectors.groupSearchForm).attr('autocomplete','off');
			$(globalSelectors.groupSearchForm).unbind('keydown').keydown('.form-control',function(){
				if(event.keyCode==13){
					$(globalSelectors.groupSearchForm + ' button[role="submit"]').trigger('click');
					return false;
			    }
			});
            $(globalSelectors.groupDevicesSearchForm + ' button[role="reset"]').unbind('click').bind('click', function() {
                CommonUtil.formDataSetAndGet({
                    container: globalSelectors.groupDevicesSearchForm,
                    data: {
                        name: '',
                        page: 1,
                        limit: 10
                    }
                }, function() {
                    fns.renderGroupDevicesPage();
                });
            });
            $(globalSelectors.groupDevicesSearchForm + ' button[role="submit"]').unbind('click').bind('click', function() {
                CommonUtil.formDataSetAndGet({
                    container: globalSelectors.groupDevicesSearchForm,
                    data: {
                        page: 1,
                        limit: 10
                    }
                }, function() {
                    fns.renderGroupDevicesPage();
                });
            });
            //搜索框内的回车事件
            $(globalSelectors.groupDevicesSearchForm).attr('autocomplete','off');
			$(globalSelectors.groupDevicesSearchForm).unbind('keydown').keydown('.form-control',function(){
				if(event.keyCode==13){
					 $(globalSelectors.groupDevicesSearchForm + ' button[role="submit"]').trigger('click');
					return false;
			    }
			});
        }
        
    };
    var fns = {
        renderGroupList: function(activeGroupId) {
            CommonUtil.formDataSetAndGet({
                container: globalSelectors.groupSearchForm
            }, function(data) {
                CommonUtil.operation({
                    moduleName: 'group-devices',
                    oper: 'lstGroupAndDeviceNum',
                    params: data,
                    forbidConfirm: true
                }, function(res) {
                    var groups = res.result.resultList;
                    console.log(res,!data.name)
                    $(moduleId + ' ul.device-group-lst').html(groups.map(function (g) {
                        return '<li>' + 
                        	
                            '<a class="icon-img '+ systemCode +'" href="javascript:;" href-opt="page-group-devices" data-id="' + g.id+ '">' + g.deviceGroupName + '（' + g.deviceNum + '）</a>' +
                            '<div>备注：<span>' + g.remark +'</span></div>' +
                        '</li>';
                    }).join(''));
                    if (!data.name || "未分组".indexOf(data.name) !== -1) {
                        $(moduleId + ' ul.device-group-lst').append('<li>' + 
                            '<a class="icon-img '+ systemCode +'" href="javascript:;" href-opt="page-group-devices" data-id="-1">未分组（' + res.result.unGroupDeviceNum + '）</a>' +
                        '</li>');
                    }
                    if($(moduleId + ' ul.device-group-lst li').length == 0) {
                    	 $(moduleId + ' ul.device-group-lst').append('<p style="padding: 3px 10px;">无搜索结果</p>')
                    }
                    
                    $(opts.pageGroupDevices).unbind('click').bind('click', fns.renderGroupDevicesPage);
                    $($(opts.pageGroupDevices)[0]).trigger('click');
                    $(opts.pageGroupDevices).unbind('contextmenu').on('contextmenu', function(e) {
                        e.preventDefault();
                        var id = $(this).attr('data-id');
                        var menu = $('#' + systemCode + '-group-oper-enter');
                        
                        if(id == -1) {//未分组没有右键菜单
                        	return false;
                        }
                        //根据事件对象中鼠标点击的位置，进行定位
                       /* console.info($('#content-main').offset().top, $('#content-main').scrollTop())*/
                        menu.css('left', (e.clientX - $('#content-main').offset().left) + 'px');
                        menu.css('top', (e.clientY - $('#content-main').offset().top + $('#content-main').scrollTop() - 20) + 'px');
                        menu.css('width', '200px');

                        $('#' + systemCode + '-group-oper-enter > .item > a').unbind('click').on('click', function(event) {
                            var role = $(this).attr('role');
                            if (role === "edit") {
                                fns.openGroupForm(id);
                            }

                            if (role === "remove") {
                                CommonUtil.operation({
                                    moduleName: 'group-devices',
                                    oper: 'removeGroup',
                                    oper_cn: '删除',
                                    params: {
                                        id: id
                                    }
                                }, function(res) {
                                    fns.renderGroupList();
                                    
                                })
                            }
                        });
                    });
                    $('html').unbind('click').on('click', function(e) {
                        var menu = $('#' + systemCode + '-group-oper-enter');
        
                        // 平面图右键菜单是否存在，存在则让其消失
                        if (menu.width() > 0) {
                            setTimeout(function() {
                                menu.css('width', '0px');
                            }, 300);
                        }
                    });
                    if (activeGroupId) {
                        groupId = activeGroupId;
                        fns.renderGroupDevicesPage();
                    }
                })
            });
            
        },
        openGroupForm: function(id) {
            CommonUtil.ajaxRequest({
                url: 'group-devices/groupForm',
                type: 'get',
                data: {
                    id: id
                }
            },function(res){
                var formIndex = -1;
                setTimeout(function() {
                    formIndex = layer.open({
                        title: (id ? '编辑' : '添加') + '设备分组',
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['360px', '250px'], //宽高
                        content: res
                    });
                    $('#device-group-form').validate({
                        rules: {
                            deviceGroupName: {
                                required: true,
                                rangelength: [1,10]
                            }
                        },
                        messages: {
                            deviceGroupName: {
                                required: icon + "请输入组名",
                                rangelength: icon + "组名输入长度必须介于1和10之间"
        
                            }
                        },
                        submitHandler: function(form){
                            var submitObj = $(form).serializeObject();
                            submitObj.systemCode = systemCode;
                            CommonUtil.operation({
                                moduleName: 'group-devices',
                                oper: 'saveGroup',
                                oper_cn: '保存',
                                params: {
                                    data: JSON.stringify(submitObj)
                                }
                            }, function(res) {
                                layer.close(formIndex);
                                fns.renderGroupList();
                                
                            })
                            return false;
                        }
                    });
                });
            });
        },
        renderGroupDevicesPage: function(e) {
            if (e) {
                groupId = $(e.target).attr('data-id');
            }
            if (!groupId) {
                layer.msg('请先选择一个设备分组，在进行此操作！', {icon: 5});
                return false;
            }
            $(opts.pageGroupDevices + '[data-id="' + groupId + '"]').parent().siblings().removeClass('selected');
            $(opts.pageGroupDevices + '[data-id="' + groupId + '"]').parent().addClass('selected');
            var renderCore = function(res,oper) {
                var groupDevices = res.result;
                var tpl = group_devices_tpl.innerHTML;
                var viewSelector = globalSelectors.groupDevicesView;
                if(oper == 'pageGroupDevices') {
                	$(opts.addDevices).removeAttr('disabled');
                	$(opts.removeDevices).removeAttr('disabled');
                } else {
                	$(opts.addDevices).attr('disabled','disabled');
                	$(opts.removeDevices).attr('disabled','disabled');
                }
                laytpl(tpl).render(groupDevices ? groupDevices : {}, function(html){
                    $(viewSelector).html(html);
                    $(viewSelector + ' .i-checks').iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square-green',
                    });
                    $(viewSelector + ' > table').footable();
                    CommonUtil.itemsCheck({
                        allSelector: viewSelector + ' input[data-name="select-all"]',
                        itemSelector: viewSelector + ' input[data-name="select-item"]'
                    });
                    $(viewSelector + ' > table a[href-opt="detail-device"]').unbind('click').bind('click', function() {
                        var deviceId = $(this).attr('data-id');
                        CommonUtil.ajaxRequest({
                            url: 'group-devices/deviceDetail',
                            type: 'get',
                            data: {
                                deviceId: deviceId
                            }
                        },function(res){
                            var formIndex = -1;
                            formIndex = layer.open({
                                title: '设备详情',
                                type: 1,
                                skin: 'layui-layer-rim', //加上边框
                                area: ['820px', 'auto'], //宽高
                                content: res
                            });
                        });
                    });
                });
                
                if(groupDevices && groupDevices.totalPageNum > 0) {
                    pageList({
                        modelName: systemCode +'-group-devices',
                        totalCount: groupDevices.totalCount,
                        limit: groupDevices.pageSize,
                        limits: [10, 20, 30, 40, 50],
                        curr: groupDevices.currentPage
                    }, function(obj) {
                        CommonUtil.formDataSetAndGet({
                            container: globalSelectors.groupDevicesSearchForm,
                            data: {
                                page: obj.curr,
                                limit: obj.limit
                            }
                        }, function() {
                            fns.renderGroupDevicesPage();
                        });
                    });
                } else {
                    $('#' + systemCode +'-group-devices-page').html('');
                }
            };
          
            CommonUtil.formDataSetAndGet({
                container: globalSelectors.groupDevicesSearchForm,
                data: {
                    systemCode: systemCode,
                    groupId: groupId
                }
            }, function(data) {
                var oper = parseInt(data.groupId) === -1 ? 'pageUngroupDevices' : 'pageGroupDevices';
                CommonUtil.operation({
                    moduleName: 'group-devices',
                    oper: oper,
                    params: data,
                    forbidConfirm: true
                }, function(res) {
                    renderCore(res,oper);
                })
            });
        },
        openDevicesSelector: function() {
            if (!groupId) {
                layer.msg('请先选择一个设备分组，再进行此操作！', {icon: 5});
                return false;
            }
            var containerId = '#system-devices-selector';
            var optInit;
            var renderFloors;
            var viewSelector = containerId + ' .devices-and-floors > .devives-lst';
            var renderUngroupDevicesPage;
            var renderRelates;
            var relateDevices = [];
            var saveDevicesRelate;
            var formIndex = -1;

            optInit = function() {
                $(containerId + ' ul.areas-lst > li').unbind('click').bind('click', function() {
                    var activeId = $(this).attr('data-area-id');
                    CommonUtil.formDataSetAndGet({
                        container: containerId + ' form',
                        data: {
                            areaId: activeId,
                            floorId: '',
                            page: 1,
                            limit: 10
                        }
                    }, function() {
                        renderUngroupDevicesPage();
                    })
                });
               
                $(containerId + ' form button[role="submit"]').unbind('click').bind('click', function() {
                    CommonUtil.formDataSetAndGet({
                        container: containerId + ' form',
                        data: {
                            page: 1,
                            limit: 10
                        }
                    }, function() {
                        renderUngroupDevicesPage();
                    })
                });
                //搜索框内的回车事件
                $(containerId + ' form').attr('autocomplete','off');
                $(containerId + ' form').unbind('keydown').keydown('.form-control',function(){
					if(event.keyCode==13){
						$(containerId + ' form button[role="submit"]').trigger('click');
						return false;
				    }
				});
                $(containerId + ' form button[role="reset"]').unbind('click').bind('click', function() {
                    CommonUtil.formDataSetAndGet({
                        container: containerId + ' form',
                        data: {
                            name: '',
                            areaId: $($(containerId + ' ul.areas-lst > li')[0]).attr('data-area-id'),
                            floorId: '',
                            page: 1,
                            limit: 10
                        }
                    }, function() {
                        renderUngroupDevicesPage();
                    })
                });

                $(containerId + ' button[role="save-relates"]').unbind('click').bind('click', function() {
                    saveDevicesRelate();
                });
                $(containerId + ' button[role="close-panel"]').unbind('click').bind('click', function() {
                    layer.close(formIndex);
                });
            };
            renderFloors = function(floors, floorId) {
                if (floors) {
                    $(containerId + ' .floors-lst > ul').html('<li data-floor-id="0">全部</li>' +
                    floors.map(function (f) {
//                        return '<li data-floor-id="' + f.id + '">' + f.floorName + '</li>'
                    	return '<li data-floor-id="' + f.id + '">' + f.serialNumber + 'F</li>'
                    }).join(''));
                    var activeFloorSelector = $(containerId + ' .floors-lst > ul > li[data-floor-id="' + floorId + '"]');
                    activeFloorSelector.siblings().removeClass('active');
                    activeFloorSelector.addClass('active');
                    if ($(containerId + ' .floors-lst > ul > li.active').length === 0) {
                        $($(containerId + ' .floors-lst > ul > li')[0]).addClass('active')
                    }
                } else {
                	 $(containerId + ' .floors-lst > ul').html('<li data-floor-id="0">全部</li>');
                	 $(containerId + ' .floors-lst > ul > li').addClass('active')
                }
                $(containerId + ' .floors-lst li').unbind('click').bind('click', function() {
                    var activeId = $(this).attr('data-floor-id');
                    CommonUtil.formDataSetAndGet({
                        container: containerId + ' form',
                        data: {
                            floorId: parseInt(activeId) === 0 ? '' : activeId,
                            page: 1,
                            limit: 10
                        }
                    }, function() {
                        renderUngroupDevicesPage();
                    })
                });
            };
            renderRelates = function() {
                CommonUtil.itemsCheck({
                    allSelector: viewSelector + ' input[data-name="select-all"]',
                    itemSelector: viewSelector + ' input[data-name="select-item"]',
                    checkedList: relateDevices
                }, function(res) {
                    relateDevices = res;
                    $(containerId + ' span[data-bind="selector-count"').html(relateDevices.length);
                    $(containerId + ' ul.selector-lst').html(relateDevices.map(function (r) {
                        var others = JSON.parse(r.others);
                        var areaName = '~' + $(containerId + ' ul.areas-lst > li[data-area-id="' + others.areaId + '"] > a').html();
                        var floorName = $(containerId + ' .floors-lst li[data-floor-id="' + others.floorId + '"]').html();
                        floorName = floorName ? floorName : '';
                        return '<li data-id="' + r.id + '">' + others.deviceName + ' ('+ floorName + areaName +')'+ '<a href="javascript:;" class="text-navy" data-opt="selector-splice"><i class="fa fa-times"></i></a></li>'
                    }).join(''));

                    $(containerId + ' ul.selector-lst a[data-opt="selector-splice"]').unbind('click').bind('click', function() {
                        var deviceId = $($(this).parent()).attr('data-id');
                        var spliceIndex = -1;
                        for (var i = 0; i < relateDevices.length; i++) {
                            if (parseInt(relateDevices[i].id) === parseInt(deviceId)) {
                                spliceIndex = i;
                            }
                        }
                        relateDevices.splice(spliceIndex, 1);
                        renderRelates();
                    });
                    $(containerId + ' a[data-opt="selector-clear"]').unbind('click').bind('click', function() {
                        relateDevices = [];
                        renderRelates();
                    });
                    
                });
            };

            renderUngroupDevicesPage = function() {
                var renderCore = function(unGroupDevices) {
                    var tpl = ungroup_devices_tpl.innerHTML;
                    laytpl(tpl).render(unGroupDevices ? unGroupDevices : {}, function(html){
                        $(viewSelector).html(html);
                        $(viewSelector + ' .i-checks').iCheck({
                            checkboxClass: 'icheckbox_square-green',
                            radioClass: 'iradio_square-green',
                        });
                        $(viewSelector + ' > table').footable();

                        renderRelates();
                    });
                    if(unGroupDevices && unGroupDevices.totalPageNum > 0) {
                        pageList({
                            modelName: systemCode +'-ungroup-devices',
                            totalCount: unGroupDevices.totalCount,
                            limit: unGroupDevices.pageSize,
                            layout: ['count', 'prev', 'page', 'next'],
                            curr: unGroupDevices.currentPage
                        }, function(obj) {
                            CommonUtil.formDataSetAndGet({
                                container: containerId + ' form',
                                data: {
                                    page: obj.curr,
                                    limit: obj.limit
                                }
                            }, function() {
                                renderUngroupDevicesPage();
                            });
                        });
                    } else {
                        $('#' + systemCode +'-ungroup-devices-page').html('');
                    }
                };

                CommonUtil.formDataSetAndGet({
                    container: containerId + ' form'
                }, function(data) {
                    CommonUtil.operation({
                        moduleName: 'group-devices',
                        oper: 'pageUngroupDevices',
                        params: data,
                        forbidConfirm: true
                    }, function(res) {
                        var activeAreaSelector = $(containerId + ' ul.areas-lst > li[data-area-id="' + data.areaId + '"]');
                        activeAreaSelector.siblings().removeClass('active');
                        activeAreaSelector.addClass('active');

                        renderFloors(res.floors, data.floorId);
                        res.result.params = data;
                        renderCore(res.result);

                    });
                })
            };

            saveDevicesRelate = function() {
                var deviceIds = relateDevices.map(function (r) {
                    return r.id;
                }).join(',');
                CommonUtil.operation({
                    moduleName: 'group-devices',
                    oper: 'addDevices',
                    oper_cn: '保存',
                    params: {
                        groupId: groupId,
                        deviceIds: deviceIds

                    }
                }, function(res) {
                    fns.renderGroupList(groupId);
                    layer.close(formIndex);
                });
            };

            CommonUtil.ajaxRequest({
                url: 'group-devices/devicesSelector',
                type: 'get',
                data: {
                    systemCode: systemCode
                }
            },function(res){
                setTimeout(function() {
                    formIndex = layer.open({
                        title: '选择设备进行分组',
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['988px', 'auto'], //宽高
                        content: res
                    });
                    optInit();
                    renderUngroupDevicesPage();
                });
            });
        },
        getSelectedDeviceIds: function() {
            var deviceIds = [];
            $.each($(globalSelectors.groupDevicesView + ' input[data-name="select-item"]:checked'), function() {
                deviceIds.push($(this).val());
            });
            return deviceIds.join(',');
        },
        removeDevicesRelate: function() {
            if (!groupId) {
                layer.msg('请先选择一个设备分组，再进行此操作！', {icon: 5});
                return false;
            }
            var deviceIds = fns.getSelectedDeviceIds();
            if (deviceIds.length === 0) {
                layer.msg('请勾选设备后，再进行此操作！', {icon: 5});
                return false;
            }

            CommonUtil.operation({
                moduleName: 'group-devices',
                oper: "removeDevices",
                oper_cn: '删除',
                params: {
                    groupId: groupId,
                    deviceIds: deviceIds
                }
            }, function(res) {
                fns.renderGroupList(groupId);
            })
        },
        changeDevicesRelate: function() {
            if (!groupId) {
                layer.msg('请先选择一个设备分组，再进行此操作！', {icon: 5});
                return false;
            }
            var deviceIds = fns.getSelectedDeviceIds();
            if (deviceIds.length === 0) {
                layer.msg('请勾选设备后，再进行此操作！', {icon: 5});
                return false;
            }
            CommonUtil.ajaxRequest({
                url: 'group-devices/moveForm',
                type: 'get',
                data: {
                    systemCode: systemCode,
                    oldGroupId: groupId
                }
            },function(res){
                var formIndex = -1;
                setTimeout(function() {
                    formIndex = layer.open({
                        title: '选择分组进行移动',
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['360px', '200px'], //宽高
                        content: res
                    });
                    $('#move-group-form').validate({
                        rules: {
                        },
                        messages: {
                        },
                        submitHandler: function(form){
                            var submitObj = $(form).serializeObject(),
                            	groupName = $('#move-group-form option[value="'+submitObj.newGroupId+'"]').html();
                            submitObj.oldGroupId = groupId;
                            submitObj.deviceIds = deviceIds;
                            console.log('submitObj',submitObj);
                            CommonUtil.operation({
                                moduleName: 'group-devices',
                                oper: 'moveDevices',
                                params: submitObj,
                                confirmMsg: '确认将所选设备移动至 ' + groupName + ' 分组'
                            }, function(res) {
                                layer.close(formIndex);
                                fns.renderGroupList(submitObj.newGroupId);
                            })
                            return false;
                        }
                    });
                });
            });
        }
    }

    init = function (p) {
       
        controlCenter.setGlobalParams(p);
        controlCenter.setGlobalSelectors();
        controlCenter.setOpts(systemCode);
        controlCenter.eventBind();
        fns.renderGroupList();
    };

    return {
        init: init
    }
}());