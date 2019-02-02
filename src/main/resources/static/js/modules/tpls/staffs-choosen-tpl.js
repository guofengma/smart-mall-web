/**
 * 工作人员选择模板加载
 * @creator 李丹Danica
 * @createTime 2018/3/20
 */
var StaffsChoosenTpl = (function() {
	var staffInterface = null,
		tpl = null,
		view = null,
		checkedIds = [];
	
	var resetSearchParams = function() {
			view = $('#choosen-staff-content');
			$.each(view.find('input[role="user-params"]'), function() {
				var el = $(this);
				if (el.attr('name') == 'page') {
					el.val(1);
				}
				
				if (el.attr('name') == 'limit') {
					el.val(10);
				}
				
				if (el.attr('name') == 'keyword') {
					el.val('');
				}
			});
			loadPage($(view.find('form')[0]).serializeObject());
		},
		loadPage = function(p, callback) {
			staffInterface.getValidPage(p, function(staffs) {
				laytpl(tpl).render({
					params: p,
					list: staffs.resultList
				}, function(html){
					view.html(html);
					
					for(var i = 0; i < checkedIds.length; i++) {
						$('#choosen-staff-content input[name="choosen-staff-checkbox"][data-id="' + checkedIds[i] + '"]').attr('checked', true);
					}
					// 分页信息初始化
					if (staffs.totalPageNum && staffs.totalPageNum > 1) {
						laypage.render({
							elem: 'choosen-staff-page', //注意，这里的 test1 是 ID，不用加 # 号
							count: staffs.totalCount, //数据总数 //从服务端得到
							limit: staffs.limit,
							curr: staffs.currentPage,
							theme: '#3A8FE2',
						  	layout: ['count', 'prev', 'page', 'next', 'skip'],
							jump : function(obj, first) {
								if(!first) {
									view = $('#choosen-staff-content');
									$.each(view.find('input[role="user-params"]'), function() {
										var el = $(this);
										if (el.attr('name') == 'page') {
											el.val(obj.curr);
										}
										
										if (el.attr('name') == 'limit') {
											el.val(obj.limit);
										}
									});
									loadPage($(view.find('form')[0]).serializeObject(), callback);
								}
							}
						});
					}
					
					// 搜索和重置
					view.find('button[role="submit"]').unbind('click').bind('click', function() {
						var searchParams = null;
						
						view = $('#choosen-staff-content');
						searchParams = $(view.find('form')[0]).serializeObject();
						if (!searchParams.keyword) {
							layer.msg('请输入关键字搜索', {icon: 5});
							return false;
						}
						loadPage(searchParams, callback);
					});
					
					view.find('button[role="reset"]').unbind('click').bind('click', function() {
						resetSearchParams();
					});
					if (typeof callback == 'function') {
						view.find('button[role="choosen-save"]').unbind('click').bind('click', function() {
							CommonUtil.getIdsOfEls($('#choosen-staff-content input[name="choosen-staff-checkbox"]:checked'), callback)
						});
						
						view.find('button[role="close-panel"]').unbind('click').bind('click', function() {
							layer.close(layerWindowIndex);
						});
					}
				});
			})
			
		},
		init = function(p, callback) {
			staffInterface = new StaffInterface();
			tpl = choosen_staffs_data.innerHTML;
			view = $('#choosen-staff-content');
			view.removeClass('hide');
			layer.close(layerWindowIndex);
			setTimeout(function() {
				layerWindowIndex = layer.open({
					type: 1,
					title: p.title ? p.title : '工作人员列表',
					skin: 'layui-layer-demo', //样式类名
					closeBtn: 1, //不显示关闭按钮
					anim: 2,
					shadeClose: false, //开启遮罩关闭
					area : [ '784px', '540px' ], //宽高
					content: view,
					end: function() {
						layer.close(layerWindowIndex);
					}
				});
				checkedIds = p.checkedIds ? p.checkedIds : [];
				loadPage({
					page: 1,
					limit: 10
				}, function(ids, others) {
					callback({
						ids: ids,
						others: others,
						layerWindowIndex: layerWindowIndex
					});
				});
			})
		};
		
	return {init: init}
}());