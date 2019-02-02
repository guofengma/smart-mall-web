var CentralConSortFn = (function(){
	let moduleId = '#central-con',
		sortObj,
		subMoudleSort = {},
		operationCodes = null;
	let init = function(data){
		operationCodes = data.operationCodes ? data.operationCodes : null;
		normalView();
		if(data.systemPanels.length > 0) {
			data.systemPanels.forEach(function(v1) {
				subMoudleSort[v1.code] = [];
				v1.userSystemMonitorDtos.forEach(function(v2){
					subMoudleSort[v1.code].push({
						code:v2.code,
						serialNumber:v2.serialNumber
					})
				})
			})
		}
		$(moduleId + ' .view-opers').unbind('click').on('click','a',function() {
			var self = $(this);
			var data = $(this).data();
			if (data.opt == 'editView') {
				if (self.hasClass('active')) {
					CentralConManage.saveSystemMove(function(){
						normalView();
					});
				} else {
					editView();
				}
			} else if(data.opt == 'reset'){
				CentralConManage.renderSystemPanel({callback:function(){
					/*normalView();*/
					$(moduleId + ' .show-sub-modules').addClass('hide');
					
				}})
			}else {
				eval(data.opt + '()');
			}
		});
		//回到顶部按钮的显示与隐藏
		$('#content-main').unbind().scroll(function (){
			setTimeout(function(){
				var scrollEl = $('#content-main');
		    		pos = scrollEl[0].scrollTop;
			    if (pos > 0) {
			    	$(moduleId).find('a[data-opt="toTop"]').removeClass('hide');
			    } else {
			    	$(moduleId).find('a[data-opt="toTop"]').addClass('hide');
			    }
			}, 100)
			
		});
	};
	//界面进入编辑状态
	function editView() {
		subMoudleSortFn();
		$(moduleId + ' a[data-opt="removeView"]').removeClass('hide');
		$(moduleId + ' a[data-opt="editView"]').addClass('active').attr('title','保存');
		$(moduleId + ' a[data-opt="editView"]').parent('li').removeClass('editView').addClass('check');
		$(moduleId + ' a[data-opt="addView"]').removeClass('hide');
		$(moduleId + ' a[data-opt="refresh"]').addClass('hide');
		$(moduleId + ' a[data-opt="reset"]').removeClass('hide');
		$(moduleId + ' .show-sub-modules').addClass('hide');
		$(moduleId + ' .tip-normal').addClass('hide');
		$(moduleId + ' .tip-edit').removeClass('hide');
	}
	//界面回复普通状态
	function normalView() {
		destroySort();
		
		if(operationCodes && operationCodes.indexOf('move-s-and-m') == -1 && operationCodes.indexOf('remove-system') == -1 && operationCodes.indexOf('open-right-panel') == -1) {
			$(moduleId + ' a[data-opt="editView"]').remove();
			$(moduleId + ' span.tips i').remove();
		}
		$(moduleId + ' .echart-group .border-hide').removeClass('border');
		$(moduleId + ' a[data-opt="editView"]').removeClass('active').attr('title','编辑');
		$(moduleId + ' a[data-opt="editView"]').parent('li').removeClass('check').addClass('editView');
		$(moduleId + ' a[data-opt="removeView"]').addClass('hide');
		$(moduleId + ' a[data-opt="addView"]').addClass('hide');
		$(moduleId + ' a[data-opt="reset"]').addClass('hide');
		$(moduleId + ' a[data-opt="refresh"]').removeClass('hide');
		$(moduleId + ' .show-sub-modules').removeClass('hide');
		$(moduleId + ' .tip-normal').removeClass('hide');
		$(moduleId + ' .tip-edit').addClass('hide');
	}
	
	//回到顶部
	function toTop() {
		var scrollToTop = window.setInterval(function() {
		    var scrollEl = $('#content-main');
		    	pos = scrollEl[0].scrollTop;
		    if ( pos > 0 ) {
		    	pos = pos > 20 ? pos: 20;
		    	scrollEl.scrollTop(pos - 20)
		    } else {
		        window.clearInterval(scrollToTop );
		    }
		}, 10);
	}
	function refresh() {
		CentralConManage.getSubsystemPanels();
	}
	function addView() {
		$(moduleId + ' .fixed-wrap').css('display', 'block');
		$(moduleId + ' .fixed-wrap > div').addClass('animated fadeInRight');
		setTimeout(function() {
			$(moduleId + ' .fixed-wrap > div').removeClass('fadeInRight');
		}, 2000);
		$(moduleId + ' .fixed-wrap a').unbind('click').click(function() {
			eval($(this).data().opt + '()');
		});
		$(moduleId + ' .fixed-wrap').unbind('click').click(function(e) {
			e.stopPropagation();
			var eTarget = e.target;
			if (eTarget.className === 'fixed-wrap') {
				$(moduleId + ' .fixed-wrap > div').addClass('animated fadeOutRight');
				setTimeout(function() {
					$(moduleId + ' .fixed-wrap').css('display', 'none');
					$(moduleId + ' .fixed-wrap > div').removeClass('fadeOutRight');
				},800);
			}
		});
		//加载监控面板数据
		CentralConManage.getRightPanel({},function(res){
			$(moduleId + ' .fixed-wrap > div').html(res);
			$(moduleId + ' .i-checks').iCheck({
			    checkboxClass: 'icheckbox_square-green',
			    radioClass: 'iradio_square-green',
			});
			CentralConManage.rightPanelEventInit(moduleId);
		})
	}
	
	//子系统及内部模块移动
	function subMoudleSortFn(data){
		if(operationCodes && operationCodes.indexOf('move-s-and-m') != -1) {//移动权限
			destroySort();
			if(data && data.systemPanels) {
				if(data.systemPanels.length > 0) {
					subMoudleSort = {};
					data.systemPanels.forEach(function(v1) {
						subMoudleSort[v1.code] = [];
						v1.userSystemMonitorDtos.forEach(function(v2){
							subMoudleSort[v1.code].push({
								code:v2.code,
								serialNumber:v2.serialNumber
							})
						})
					})
				}
			}
			sortObj = Sortable.create(document.getElementById('central-con-bar'), {
				sort: true,
				animation: 150,
				onAdd: function (evt){/*console.log('onAdd.bar:', evt.item);*/},
				onUpdate: function (evt){/* console.log('onUpdate.bar:', evt.item);*/},
				onRemove: function (evt){ /*console.log('onRemove.bar:', evt.item);*/},
				onStart:function(evt){ /*console.log('onStart.foo:', evt.item);*/},
				onEnd: function(evt){
					/*CentralConManage.saveSystemMove();*/
				}
			});
			for(key in subMoudleSort) {
				if(subMoudleSort[key].length >= 2) {
					subMoudleSort[key].forEach(function(value, index){
						let tempEl = $(moduleId + ' .sub-sys-type-' + key + ' .echart-group');
						if(tempEl.length > 0) {
							value.subSortObj = Sortable.create(tempEl[0], {
								sort: true,
								animation: 150,
								handle:'.border',
								items:$(moduleId + ' .sub-sys-type-' + key + ' .echart-group .border'),
								onAdd: function (evt){/*console.log('onAdd.bar:', evt.item);*/},
								onUpdate: function (evt){ /*console.log('onUpdate.bar:', evt.item);*/},
								onRemove: function (evt){ /*console.log('onRemove.bar:', evt.item);*/},
								onStart:function(evt){ /*console.log('onStart.foo:', evt.item);*/},
								onEnd: function(evt){
									/*CentralConManage.saveSystemMove();*/
								}
							});
							tempEl.find('.border-hide').addClass('border');
						}
					})
				}	
			}
		}
	}
	function destroySort(){
		if (sortObj) {
			sortObj.destroy();
			sortObj = null;
		}
		for(key in subMoudleSort) {
			subMoudleSort[key].forEach(function(value, index){
				if(value.subSortObj) {
					value.subSortObj.destroy();
					value.subSortObj = null;
				}
			})
		}
	}
	return {
		init: init,
		subMoudleSortFn: subMoudleSortFn
	};
}())







