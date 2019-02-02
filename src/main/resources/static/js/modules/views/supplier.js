var SupplierManage = function(params) {
	$.extend(this, params);
	var root = '#supplierManage';
	this.remove = function() {
		$http.post({
			url: 'supplier/remove',
			oper_cn: '删除',
			data: that.optData
		}, function() {
			goPage('index');
		})
		// CommonUtil.operation({
		// 	moduleName: 'supplier',
		// 	oper: 'remove',
		// 	oper_cn: '删除',
		// 	params: that.optData
		// }, function() {
		// 	goPage('index');
		// })
	};
	this.init = function() {
		$(root + ' a').unbind('click').click(function(e) {
			e.preventDefault();
			var opt = $(this).data("opt")
            that.optData = $(this).data();
			if (opt) {
				eval("that." + opt + "()");
			}
		});
		
		$(root + ' .searchform button[role="submit"]').unbind('click').click(function() {
			CommonUtil.formDataSetAndGet({
				container: root + ' .searchform'
			}, function(data) {
				goPage('index', data);
			});
		});
		//搜索框内额回车事件
		$(root + ' .searchform').unbind().keydown('.form-control',function(event){
			if(event.keyCode==13){
				$(root + ' .searchform button[role="submit"]').trigger('click');
				return false;
		    }
		});
		$(root + ' .searchform button[role="reset"]').unbind('click').click(function() {
			CommonUtil.formDataSetAndGet({
				container: root + ' .searchform',
				data: {
					type: $($(root + ' .searchform select[name="type"] option')[0]).attr('value'),
					keyword: ''
				}
			}, function(data) {
				goPage('index', data);
			});
		});
	};
	var that = this;
	that.init();
};

var SupplierForm = function(params) {
    var that = this;
    $.extend(that, params);
	var step1 = '#supplier-create-step-1';
	var step2 = '#supplier-create-step-2';
	var step3 = '#supplier-create-step-3';
	that.createFormData = function(callback) {
		var basic = $(step1 + ' form').serializeObject();
		basic.typeName = $(step1 + ' form select[name="type"]').find('option[value="' + basic.type + '"]').text();
		var brands = [];
		$(step2 + ' form').each(function() {
			let that = this;
			var config = $(that).serializeObject();
			var id = $(that).siblings('a[data-opt="removeSysBrand"]').attr('data-id');
			var system = $(that).find('option[value="' + config.type + '"]').attr('data-obj');
			system = system ? JSON.parse(system) : {};
			var pushCore = function(bid) {
				var brand = $(that).find('input[name="brands"][value="' + bid + '"]').attr("data-obj");
				brand = brand ? JSON.parse(brand) : {};
				brands.push({
					id : parseInt(id) > 0 ? id : "",
					system: system.name,
					systemCode:  system.code,
					brand: brand.bname,
					brandCode: brand.bcode,
					supplierId: basic.id ? basic.id : ""
				})
			};
			if(typeof config.brands == 'object') {
				for (var i = 0; i < config.brands.length; i++) {
					pushCore(config.brands[i]);
				}
			}

			if(typeof config.brands == 'string'){
				pushCore(config.brands);
			}
			
		});
		$.extend(basic, {
			brands: brands
		});
		var contacts = [];
		$(step3 + ' form').each(function() {
			contacts.push($(this).serializeObject());
		});
		$.extend(basic, {
			contacts: contacts
		});
		callback(basic);
	};
	that.save = function() {
		// 判断最后一个联系人表单是否通过验证
		if ($($(step3 + ' form')[$(step3 + ' form').length - 1]).valid()) {
			that.createFormData(function(data) {
				$http.post({
					url: 'supplier/save',
					oper_cn: '保存',
					data: {
						data: JSON.stringify(data)
					}
				}, function() {
					goPage('index');
				})
				// CommonUtil.operation({
				// 	moduleName: 'supplier',
				// 	oper: 'save',
				// 	oper_cn: '保存',
				// 	params: {
				// 		data: JSON.stringify(data)
				// 	}
				// }, function() {
				// 	goPage('index');
				// })
			});
		}
	};
	that.ichecksInit = function(parentContainer) {
		$(parentContainer + ' .i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
	};
	that.bindA = function(root) {
		$(root + ' a').unbind('click').click(function() {
			var opt = $(this).data("opt")
            that.optData = $(this).data();
			if (opt) {
				eval("that." + opt + "()");
			}
		});
	};
	
	var relateSystems = [];
	that.limitSysBrands = function() {
		var boxLen = $(step2 + ' .device-box').length;
		var maxLen = 0;
		if (boxLen > 0) {
			maxLen = $($(step2 + ' select[name="type"]')[0]).find('option').length;
		}
		if (boxLen > 0 && boxLen >= maxLen) {
			layer.msg('不可重复对一个供应系统进行供应品牌的勾选配置，因此最多可添加' + maxLen + '项配置');
			$(step2 + ' .add-box').css('display', 'none');
		} else {
			$(step2 + ' .add-box').css('display', 'block');
		}
	};
	that.removeSysBrand = function() {
		if (parseInt(that.optData.id) > 0) {
			console.info('进入删除逻辑')
			$(step2 + ' .device-box > a[data-id="' + that.optData.id + '"]').parent().remove();
		} else {
			$(step2 + ' .device-box > a[data-temp-id="' + that.optData.tempId + '"]').parent().remove();
		}
		that.limitSysBrands();
	};
	that.loadSysBrands = function() {
		var sbLen = relateSystems.length > 0 ? relateSystems.length : 1;
		var maxLen = 0;
		var loadCore = function(i) {
			var sysCode = relateSystems[i] && relateSystems[i].code ? relateSystems[i].code : null;
			var linkId = relateSystems[i] && relateSystems[i].id ? relateSystems[i].id : -1;
			CommonUtil.ajaxRequest({
				url: 'supplier/sys-brands',
				data: {
					systemCode: relateSystems[i] && relateSystems[i].code ? relateSystems[i].code : null
				},
				forbidLoading: true
			}, function(res) {
				var tempIdHtml = '';
				if (linkId < 0) {
					tempIdHtml = 'data-temp-id="' + new Date().getTime() + '"'; 
				}
				$(step2 + ' .add-box').before('<div class="device-box"><a href="javascript:;" data-opt="removeSysBrand" data-id="' + linkId + '" ' + tempIdHtml + '><i class="fa fa-times"></i></a>' + res + '</div>');
				var brands = relateSystems[i] && relateSystems[i].brands ? relateSystems[i].brands : [];
				for (var j = 0; j < brands.length; j++) {
					// 选中品牌
				}
				that.bindA(step2);
				that.limitSysBrands();
			});
		};
		for (var i = 0; i < sbLen; i++) {
			loadCore(i);
		}
		$(step2 + ' .add-box').unbind('click').click(function() {
			sbLen = $(step2 + ' .device-box').length;
			if (sbLen == 0 || $($(step2 + ' form')[sbLen-1]).valid()) {
				loadCore(sbLen);
				sbLen++;
			}
		});
	}
	that.limitLinkmans = function() {
		var boxLen = $(step3 + ' .linkman-box').length;
		var maxLen = 9;
		if (boxLen > 0 && boxLen >= maxLen) {
			layer.msg('最多可添加9位联系人');
			$(step3 + ' .add-box').css('display', 'none');
		} else {
			$(step3 + ' .add-box').css('display', 'block');
		}
	};
	that.removeLinkman = function() {
		if (parseInt(that.optData.id) > 0) {
			$(step3 + ' .linkman-box > a[data-id="' + that.optData.id + '"]').parent().remove();
		} else {
			$(step3 + ' .linkman-box > a[data-temp-id="' + that.optData.tempId + '"]').parent().remove();
		}
		that.limitLinkmans();
	};
	that.loadLinkMans = function() {
		var bindEvent = function() {
			// 无关联id的box添加临时唯一序列号
			var linkBoxs = $(step3 + ' .linkman-box');
			var lastBoxA = $(linkBoxs[linkBoxs.length - 1]).find('a[data-opt="removeLinkman"]');
			var lastId = parseInt(lastBoxA.attr('data-id'));
			if (lastId < 0) {
				var bindTime = new Date().getTime();
				lastBoxA.attr('data-temp-id', bindTime);
			}
			//操作事件绑定
			that.bindA(step3);
			that.ichecksInit(step3);
		}
		var loadCore = function() {
			var lastIndex = $(step3 + ' form').length -1;
			if (lastIndex < 0 || $($(step3 + ' form')[lastIndex]).valid()) {
				$(step3 + ' .add-box').before($('.supplierFormArea .linkman-add-tpl').html());
				bindEvent();
				that.limitLinkmans();
			}
		};
		if ($(step3 + ' .linkman-box').length === 0) {
			loadCore();
		} else {
			bindEvent();
		}
		$(step3 + ' .add-box').unbind('click').click(loadCore);
	};
    that.init = function() {
        
        var btnSubmit = $('<button type="button"></button>').html('保存')
                .addClass('btn btn-primary hide')
                .on('click', function(){
                    that.save()
                });
        $('#smartwizard').smartWizard({
            selected: 0,
            keyNavigation: false,
            theme: 'circles',
            transitionEffect:'fade',
            autoAdjustHeight:false,
            showStepURLhash: false,
            useURLhash:true,
            lang: { // Language variables for button
                next: '下一步 <i class="fa fa-chevron-right"></i>',
                previous: '<i class="fa fa-chevron-left"></i> 上一步'
            },
            toolbarSettings: {
                toolbarButtonPosition: 'end',
                toolbarExtraButtons: [btnSubmit]
            },
            anchorSettings: {
                markDoneStep: true, // add done css
                markAllPreviousStepsAsDone: true, // When a step selected by url hash, all previous steps are marked done
                removeDoneStepOnNavigateBack: true, // While navigate back done step after active step will be cleared
                enableAnchorOnDoneStep: true // Enable/Disable the done steps navigation
            }
        });
        $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {
            if(stepNumber==2){
                $(".sw-btn-group-extra .btn").removeClass("hide");
                $(".sw-btn-next").hide();
            }else{
                $(".sw-btn-group-extra .btn").addClass("hide");
                $(".sw-btn-next").show()
            }
        });
        $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
            if(stepNumber == 0){
                if ($(form0).valid()) {
                	that.loadSysBrands();
                    return true;
                } else {
                    return false;
                }
            }else if(stepNumber == 1){
            	var isSameType = false;
            	var types = [];
            	$(step2 + ' select[name="type"]').each(function() {
            		types.push($(this).val());
            	})
            	types = types.slice().sort();
            	
            	for(var i =0; i < types.length; i++){
            	    if (types[i] == types[i+1]) {
            	    	isSameType = true;
            	    }
            	} 
            	if (isSameType) {
            		layer.msg('不能对同一个供应系统进行重复的品牌勾选配置！');
            		return false;
            	}
            	if ($($(step2 + ' form')[$(step2 + ' form').length -1]).valid()) {
                	that.loadLinkMans();
                    return true;
            	} else {
            		return false;
            	}
            }

            return true;
        });
    }
    that.init();
};

var SupplierDetail = function(params) {
	$.extend(this, params);
	var relateBrands = JSON.parse(this.relateBrands);
	var root = '.supplierDetailArea';
	this.editBasic = function() {
		CommonUtil.ajaxRequest({
			url: 'supplier/basic',
			data: {
				id: that.optData.id
			},
			forbidLoading: true
		}, function(res) {
			layer.open({
                type: 1,
                title:"供应商详情-基本信息修改",
                resize :true,
                maxmin:false,
                skin: 'layui-layer-rim', //加上边框
                area:["555px"],
                maxHeight:document.body.clientHeight,
                content: '<div class="wrapper-content">' + res + '</div>',
                btn: ['保存'],
               	yes: function(index, layero) {
               	 	$(layero).find("form").submit();
               	}
                
            });
			
		})
	};
	this.removeSysBrand = function() {
		var brandsLen = $(root + ' .brands-tr').length;
		if (brandsLen <= 1) {
			layer.msg('请保证至少有一个供应设备');
			return false;

		}
		$http.post({
			url: 'supplier/removeBrand',
			oper_cn: '删除',
			data: {
				code: that.optData.code,
				supplierId: that.optData.linkId
			}
		}, function() {
			goPage('detail?id=' + that.optData.linkId);
		})
	};
	this.editSysBrands = function() {
		$http.get({
			url: 'supplier/sys-brands',
			data: {
				systemCode: that.optData.code,
				id: that.optData.id,
				supplierId:that.optData.linkId
			},
			forbidLoading: true
		}, function(res) {
			layer.open({
                type: 1,
                title:"供应商详情-供应设备" + (that.optData.id ? '修改' : '添加'),
                resize :true,
                maxmin:false,
                skin: 'layui-layer-rim', //加上边框
                area:["555px", "360px"],
                maxHeight:document.body.clientHeight,
                content: '<div class="wrapper-content">' + res + '<div style="clear:both"></div></div>',
                btn: ['保存'],
               	yes: function(index, layero) {
               		var config = $(layero).find("form").serializeObject();
               		var type = config.type;
               		var isSameType = false;
               		if (type != that.optData.code) {
               			for (var code in relateBrands) {
               				if (code == type) {
               					isSameType = true;
               				}
               			}
                   		if (isSameType) {
                   			layer.msg('不能对同一系统进行重复配置！');
                   			return false;
                   		}
               		}
               		$(layero).find("form").submit();
               		return false;
               	}
                
            });
		})
	};
	this.majorLinkman = function() {
		var isMajor = false;
		if (!that.optData.major) {
			isMajor = true;
		}
		$http.post({
			url: 'supplier/majorLinkman',
			oper_cn: (isMajor ? '设置' : '取消设置') + '为常用联系人',
			data: {
				id: that.optData.id,
				isMajor: isMajor
			}
		}, function() {
			goPage('detail?id=' + that.optData.linkId);
		})
	};
	this.removeLinkman = function() {
		var linkmansLen = $(root + ' .linkmans li').length;
		if (linkmansLen <= 1) {
			layer.msg('请保证至少有一个联系人');
			return false;
		}
		$http.post({
			url: 'supplier/removeLinkman',
			oper_cn: '删除',
			data: that.optData
		}, function() {
			goPage('detail?id=' + that.optData.linkId);
		})
	};
	this.editLinkman = function() {
		$http.get({
			url: 'supplier/linkman',
			data: {
				id: that.optData.id,
				supplierId: that.optData.linkId
			},
			forbidLoading: true
		}, function(res) {
			layer.open({
                type: 1,
                title:"供应商详情-联系人信息" + (that.optData.id ? '修改' : '添加'),
                resize :true,
                maxmin:false,
                skin: 'layui-layer-rim', //加上边框
                area:["555px"],
                maxHeight:document.body.clientHeight,
                content: '<div class="wrapper-content">' + res + '<div style="clear:both"></div></div>',
                btn: ['保存'],
               	yes: function(index, layero) {
               	 	$(layero).find("form").submit();
               	}
                
            });
		});
	};
	this.init = function() {
		$(root + ' a').unbind('click').click(function(e) {
			e.preventDefault();
			var opt = $(this).data("opt")
            that.optData = $(this).data();
			if (opt) {
				eval("that." + opt + "()");
			}
		});
		new MapSelection({
			root: root,
			mapId: 'supllier-info-address-map',
			value: that.mapAddress,
			forbidEdit: true
		});
	};
	var that = this;
	that.init();
};

var SupplierSysBrands = function(params) {
	$.extend(this, params);
	this.ichecks = function(root) {
		$(root + ' .i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
	};
	this.init = function() {
		//活动基本信息表单验证
		$(that.formId).validate({
		    rules: {
		        brands: {
		            required: true,
		        },
		    },
		    messages: {
		    	brands: {
		            required: icon + '请勾选供应品牌'
		        },
		    },
		    errorPlacement: function (error, element) {
                if(element.attr("name") == "brands"){
                    element.parent().parent().before(error)
                } else {
    		        element.before(error)
                }
		    },
		    submitHandler: function(form) {
		    	var config = $(form).serializeObject();
		    	var system = $(that.formId).find('option[value="' + config.type + '"]').attr('data-obj');
				system = system ? JSON.parse(system) : {};
				var brands = [];
				var pushCore = function(bid) {
					var brand = $(that.formId).find('input[name="brands"][value="' + bid + '"]').attr("data-obj");
					brand = brand ? JSON.parse(brand) : {};
					brands.push({
						id : $(that.formId).find('input[name="brands"][value="' + bid + '"]').val(),
						system: system.name,
						systemCode:  system.code,
						brand: brand.bname,
						brandCode: brand.bcode,
						supplierId: config.supplierId
					})
				};
				
				if(typeof config.brands == 'object') {
					for (var i = 0; i < config.brands.length; i++) {
						pushCore(config.brands[i]);
					}
				}

				if(typeof config.brands == 'string'){
					pushCore(config.brands);
				}
				$http.post({
					url: 'supplier/' + (config.id ? 'updateBrand' : 'addBrand'),
					oper_cn: '保存',
					data: {
						data: JSON.stringify(brands),
						supplierId: config.supplierId,
						systemCode: config.systemCode
					}
				}, function() {
					layer.closeAll();
					goPage('detail?id=' + config.supplierId);
				})
		        return false;
		    }
		});
		that.ichecks(that.formId);
		$(that.formId + ' select[name="type"]').unbind('change').change(function() {
			var code = $(this).val();
			var itemsEl = $(this).parent().parent().next().children('.col-sm-8');
			$http.get({
				url: 'supplier/getBrands',
				data: {
					systemCode: code
				},
				forbidConfirm: true
			}, function(res) {
				var brands = res.result;
				itemsEl.html('');
				for(var i = 0; i < brands.length; i++) {
					itemsEl.append('<label class="checkbox-inline i-checks"><input type="checkbox" class="i-checks" value="' + brands[i].id + '" name="brands" data-obj=\'' + JSON.stringify(brands[i]) + '\'> ' + brands[i].bname + '</label>')
				}
				that.ichecks(that.formId);
			})
		});	
	};
	let that = this;
	that.init();
};

var SupplierLinkman = function(params) {
	$.extend(this, params);
	this.ichecks = function(root) {
		$(root + ' .i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
	};
	this.init = function() {
		//活动基本信息表单验证
		$(that.formId).validate({
			rules: {
		        name: {
		            required: true
		        },
		        position: {
		            required: true
		        },
		        phone: {
		            required: true,
		        }
		    },
		    messages: {
		        name: {
		            required: icon + '请输入姓名'
		        },
		        position: {
		            required: icon + '请输入职位'
		        },
		        phone: {
		            required: icon+'请输入电话 ',
		        }
		    },
		    errorPlacement: function (error, element) {
		        element.before(error)
		    },
		    submitHandler: function(form) {
				var config = $(form).serializeObject();
				
				$http.post({
					url: 'supplier/' + (config.id ? 'updateLinkman' : 'addLinkman'),
					oper_cn: '保存',
					data: {
						data: JSON.stringify(config),
						supplierId: config.supplierId
					}
				}, function() {
					layer.closeAll();
					goPage('detail?id=' + config.supplierId);
				})
		        return false;
		    }
		});
		if (that.nocheck) {
			return false;
		}
		that.ichecks(that.formId);
	};
	let that = this;
	that.init();
};