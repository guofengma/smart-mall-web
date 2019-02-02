var StoreRouter = (function(){
	let areasSelecter = '#store-manage .area-floor-html',
		init,
		mallId,
		areaId,
		floorId,
		openAreaFormPanel,
		loadAreaInfo,
		areaManageBindChangeEvent,
		getAreas,
		operationCodes;
	getAreas = function(p) {
		p = p ? p : {};
		CommonUtil.ajaxRequest({
	        url: 'store/areas',
	        type: 'get',
	        data: {}
	    },function(res){
	    	if(!res.success) {
	    		layer.msg('获取区域失败',{icon:5});
	    	}
	    	let areas = res.result ? res.result : [],
	    		html = '';
	    	areas.forEach(function(value){
	    		html += '<li class="area" area-id="'+value.id+'">'+value.areaName+'</li>'
	    	})
	    	$(areasSelecter + ' ul.area-list').html(html);
	    	$(areasSelecter + ' .areas').css('height',window.innerHeight - 196 + 'px');
	    	areaManageBindChangeEvent();
	    	if(areas.length > 0) {
	    		if(!p.areaId) {
		    		p.areaId = $($(areasSelecter +' li.area')[0]).attr('area-id');
		    	}
		    	$(areasSelecter +' li.area[area-id="'+p.areaId+'"]').trigger('click');
	    	} else {
	    		$(areasSelecter + ' .right.area-manage').html('<div class="no-area"><img alt="" src="img/floors/no-pic.png"><p>暂无区域，请添加</p><div>')
	    	}
	    	
	    })
	}
	openAreaFormPanel = function(p) {
		p = p ? p : {};
		CommonUtil.ajaxRequest({
	        url: 'store/area-form',
	        type: 'get',
	        data: p
	    },function(res){
	    	var formIndex = -1;
	    	setTimeout(function() {
				
				formIndex = layer.open({
					title: (p.id ? '编辑' : '添加') + '区域',
					type: 1,
					skin: 'layui-layer-rim', //加上边框
					area: ['360px', 'auto'], //宽高
					content: res
				});
				
				$('#store-area-form').validate({
					rules: {
						areaName: {
							required: true,
							rangelength: [1,10]
						}
					},
					messages: {
						areaName: {
							required: icon + "请输入区域名称",
							rangelength: icon + "区域名称输入长度必须介于1和10之间"
	
						}
					},
					submitHandler: function(form){
						var submitObj = $(form).serializeObject();
						submitObj.mallId = mallId;
						CommonUtil.operation({
							moduleName: 'area',
							oper: 'save',
							oper_cn: '保存',
							params: {
								data: JSON.stringify(submitObj)
							}
						}, function(res) {
							layer.close(formIndex);
							getAreas({areaId:submitObj.id});
							
						})
					}
				});
			})
	    });
	};
	loadAreaInfo = function(p) {
		p = p ? p: {};
		let el = $(areasSelecter + ' .area-manage'),
			moduleId = '.area-floor-html .area-manage',
			dataId = el.attr('data-id');
		floorId = p.floorId ? p.floorId: null;
		CommonUtil.ajaxRequest({
	        url: 'store/floor-info',
	        type: 'get',
	        data: {
	        	id: dataId
	        }
	    },function(res){
	    	el.html(res);
			FloorInfoManage.init({
				moduleId: moduleId,
				mallId: mallId,
				areaId: dataId,
				floorId: floorId,
				operationCodes: operationCodes
			});
			floorId = null;
	    });
	};
	areaManageBindChangeEvent = function() {
		let areaChangeLiSelector = '#store-manage .area-floor-html li.area';
		$(areasSelecter + ' .area-list').unbind().on('click','li',function(){//点击加载区域
			let self = $(this);
			if(self.hasClass('actived')) {
				return false;
			}
			$(areasSelecter + ' .area-list li').removeClass('actived');
			self.addClass('actived');
			areaId = self.attr('area-id');
			$(areasSelecter + ' .area-manage').attr('href','.area-floor-html .area-manage');
			$(areasSelecter + ' .area-manage').attr('data-id',areaId);
			loadAreaInfo({floorId:floorId});
		})
		$(areasSelecter + ' .add-area i').unbind('click').on('click', function() {//点击添加区域
			openAreaFormPanel();
		});
		$('html').unbind('click').on('click', function() {
			let menu = $('#mall-area-oper-enter');
			if(menu.width() > 0) {
				menu.css('width', '0');
			}
		});
		$(areaChangeLiSelector).unbind('contextmenu').on('contextmenu', function(e) {
			e.preventDefault();

			let areaId = $(this).attr('area-id'),
				areaName = $(this).text(),
				menu = $('#mall-area-oper-enter');
			//根据事件对象中鼠标点击的位置，进行定位
			menu.css('left', (e.clientX - $('#content-main').offset().left) - 20 + 'px');
			menu.css('top', (e.clientY - $('#content-main').offset().top + $('#content-main').scrollTop() - 0)- 60 + 'px');
			menu.css('width', '200px');
			setTimeout(function() {
				menu.css('width', '0');
			}, 5000);
			
			$('#mall-area-oper-enter' + ' a[role="edit-area"]').unbind('click').bind('click', function(){
				openAreaFormPanel({
					id: areaId,
					name: areaName
				})
			});
			
			$('#mall-area-oper-enter' + ' a[role="remove-area"]').unbind('click').bind('click', function(){
				CommonUtil.operation({
					moduleName: 'area',
					oper: 'remove',
					oper_cn: '删除',
					params: {
						id: areaId
					}
				}, function(res) {
					getAreas();
			    });
			});
		});
	}
	init = function(p) {
		mallId = p.mallId;
		areaId = p.areaId;
		floorId = p.floorId;
		operationCodes = p.operationCodes ? p.operationCodes : '';
		window.onresize = function() {
			$(areasSelecter + ' .areas').css('height',window.innerHeight - 196 + 'px');
		}
	};
	
	return {
		init: init,
		getAreas: getAreas,
		loadAreaInfo: loadAreaInfo
	};
	
}());