var CommandTemplateManage = (function(){
	   
	var init  = function(data){
			moduleCode = data.moduleCode;
			moduleName = data.moduleName;
			operationCodes = data.operationCodes?data.operationCodes:'';
			El = '#' + moduleCode + '-command-template';
			getCommandTemplates({subsystemCode:moduleCode});
			$(El + ' .search').unbind().on('click', function(){
				search();
			});
			//搜索框内的回车事件
			$(El + ' form').attr('autocomplete','off');
			$(El + ' form').unbind('keydown').keydown('.form-control',function(){
				if(event.keyCode==13){
					$(El + ' .search').trigger('click');
					return false;
			    }
			});
			$(El + ' .reset').unbind().on('click', function(){
				$(El + ' input[name="keyword"]').val('');
				search();
			});
			$(El + ' form').keydown(function(e) {
				var theEvent = e || window.event;
				var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
				if (code == 13) {
					search();
					return false;
				}
				return true;
			});
		},
		getCommandTemplates = function(data){
			CommonUtil.operation({
				moduleName: 'commandTemplate',
				oper: 'findCommandModuleBySystemCode',
				params: data,
				forbidConfirm: true
			}, function(res) {
				render(res.brands);
			})
		},
		render = function(data) {
			var tpl = command_template_list_tpl.innerHTML,
				view = $(El + ' .versions');
			laytpl(tpl).render(data, function(html){
				view.html(html);
				if(operationCodes.indexOf('detail-ct') == -1) { // 详情权限
					$(El + ' .versions .detail').remove();
				};
				if(operationCodes.indexOf('edit-ct') == -1) { // 编辑权限
					$(El + ' .versions .edit').remove();
				};
				if(operationCodes.indexOf('remove-ct') == -1) { // 编辑权限
					$(El + ' .versions .remove').remove();
				};
				$(El + ' .versions .detail').unbind().on('click', function(){
					var id = $(this).attr('data-id');
					detail({id:id});
				});
				$(El + ' .versions .edit').unbind().on('click', function() {
					var commandTemplateId = $(this).parent().attr('data-id');
					goPage('command-template-form?commandTemplateId='+commandTemplateId);
				});
				$(El + ' .versions .remove').unbind().on('click', function() {
					var commandTemplateId = $(this).parent().attr('data-id');
					setTimeout(function() {
						layer.confirm('确认删除？', {
						    btn: ['确认','取消'], //按钮
						    shade: true //显示遮罩
						}, function(lindex){
							layer.close(lindex);
							CommonUtil.operation({
								moduleName: 'commandTemplate',
								oper: 'remove',
								oper_cn: '删除',
								params: {id:commandTemplateId},
								forbidConfirm: true
							}, function(res) {
								layer.msg('删除成功',{icon:6});
								search();
							});
						});
					});
				});
			});
		},
		search = function(){
			var keyword = $(El + ' input[name="keyword"]').val();
			getCommandTemplates({subsystemCode:moduleCode,keyword:keyword});
		},
		detail = function(data){
			var tpl = command_template_detail_tpl.innerHTML,
				view = null;
		
			CommonUtil.operation({
				moduleName: 'commandTemplate',
				oper: 'detail',
				params: data,
				forbidConfirm: true
			}, function(res) {
				var lwIndex = null;
				setTimeout(function() {
					lwIndex = layer.open({
						type : 1,
						title : '指令模板详情',
						shadeClose: false,
						closeBtn: 1, 
						anim: 2,
						skin : 'layui-layer-rim', //加上边框
						area : [ '400px', '400px' ], //宽高
						content : '<div class="command-template-open"></div>',
						end: function() {
							layer.close(lwIndex);
						}
					});
					view = $('.command-template-open');
					laytpl(tpl).render(res.result, function(html){
						view.html(html);
					});
				})
			})
		};
	return {
		init: init
	}
}());