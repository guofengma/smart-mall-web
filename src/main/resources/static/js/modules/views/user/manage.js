(function(w){
	var UserManage = function() {
		var userFlocks = null,
			userTableSelector  = '#user-table',
			searchFormSelector = '#user-searchform',
			_this = this;
		var init = function(p) {
				getStaffView();
				getRepairGroupFlocks();
			},
			getStaffView = function(data) {
				_this.params = data ? data : {};
				CommonUtil.ajaxRequest({
	    			url: 'user/staff',
	    			type: 'get',
	    			data: data,
	    			forbidConfirm: true,
	    			forbidLoading: false,
	    		}, function(res) {
					$('#staff-html .panel-body').html(res);
					renderFlocks({flockId:$(searchFormSelector + ' select').attr('data-value')});
					eventInit();
				});
			},
			getRepairGroupFlocks = function(){
				CommonUtil.operation({
				 	moduleName: 'repair-group',
				 	oper: 'groupFlocks',
				 	type: 'get',
				 	oper_cn: '查询',
				 	forbidConfirm: true,
				 	forbidLoading: true,
				 	params: {}
				 }, function(res) {
					 _this.repairGroupFlocks = res.result;
				 })
			},
			resetPassword = function(p){
				CommonUtil.operation({
				 	moduleName: 'user',
				 	oper: 'reset-password',
				 	type: 'post',
				 	oper_cn: '重置密码',
				 	forbidConfirm: true,
				 	forbidLoading: true,
				 	params: p
				 }, function(res) {
					 layer.msg('密码重置成功',{icon:6})
				 })
			},
			showForm = function(data){
				var tpl = userFormTpl.innerHTML,
					view;
				let lwIndex = null;
				setTimeout(function() {
					lwIndex = layer.open({
						type : 1,
						title : data.id?'编辑员工':'添加员工',
						shadeClose: false,
						closeBtn: 1, 
						anim: 2,
						skin : 'layui-layer-rim', //加上边框
						area : [ '600px', '400px' ], //宽高
						content : '<div class="user-open">' + $('#user-add-edit').html() + '</div>',
						end: function() {
							layer.close(lwIndex);
						}
					});
					view = $('.user-open #user-form-view');
					laytpl(tpl).render(userFlocks, function(html){
						view.html(html);
						if(data.id){
							userInterface.userDetail({id:data.id},function(res){
								var temp_personFlocks = res.personFlocks,
									personFlockIds = [];
								console.log(res);
								$('#user-form input[name="id"]').val(res.id);
								$('#user-form input[name="realName"]').val(res.realName);
								$('#user-form input[name="mobile"]').val(res.mobile);
								if(temp_personFlocks.length > 0) {
									temp_personFlocks.forEach(function(value) {
										$('#user-form option[value="'+value.id+'"]').attr('selected','selected');
										personFlockIds.push(value.id);
									});
									personFlockIds.join(',');
								};
								
								//初始化chosen插件
								$('#user-form select').chosen({
									allow_single_deselect: true, //删除选项
									max_selected_options: 999, //多选上限
									disable_search:true, //禁用搜索框
									placeholder_text_multiple:'请选择角色' //提示值
								}); 
								/*$('#user-form select').on('chosen:ready', function(e, params) {
									$("#user-form select").val(personFlockIds)//设置值  
									$('#user-form select').trigger('chosen:updated');//更新选项  
									console.log('准备就绪')
								});*/
							})
							
						} else {
							//初始化chosen插件
							$('#user-form select').chosen({
								allow_single_deselect: true, //删除选项
								max_selected_options: 999, //多选上限
								disable_search:true, //禁用搜索框
								placeholder_text_multiple:'请选择角色' //提示值
							}); 
						};
						$('#user-form').validate({
							rules: {
								realName:{
									required: true,
									rangelength: [1,20]
								},
								mobile:{
									required: true,
									phone: true
								}
							},
							messages: {
								realName:{
									required: icon + "请输入姓名",
									rangelength: icon + "姓名的长度介于2-20之间"
								},
								mobile: {
									required: icon+'请填写手机号码',
									phone: icon + '请填写11位有效的手机号码'
								}
							},
							submitHandler:function(form){
								var formData = $(form).serializeObject(),
									repairGroupFlockNum = 0,//用于判断角色是否是运维成员和运维负责人
									repairGroupFlockNames = ''
								if(!(formData.personFlocks && formData.personFlocks.length > 0)) {
									layer.msg('未选择角色', {icon: 5});
									return false;
								};
								
								console.log('formData',typeof formData.personFlocks)
								if(typeof formData.personFlocks != 'string') {
									formData.personFlocks.forEach(function(v1) {
										_this.repairGroupFlocks.forEach(function(v2){
											if(v1 == v2.id) {
												repairGroupFlockNum += 1
												repairGroupFlockNames = repairGroupFlockNames + v2.value + ' '
											}
										})
									})
									formData.personFlocks = formData.personFlocks.join(',');	
								}
								if(repairGroupFlockNum >= 2) {
									layer.msg(repairGroupFlockNames + '不能同时存在', {icon: 5});
									return false;
								}
								CommonUtil.operation({
									moduleName: 'user',
									oper: 'save',
	            					oper_cn: '保存',
									params: formData
								}, function(res) {
									goPage('index',{subModule:'staff'});
									layer.msg('保存成功！', {icon: 6,time: 2000});
								});
							}    
						});
					});
				});
			},
			disabled = function(data) {
				setTimeout(function() {
					layer.confirm('确认禁用？', {
						btn: ['确认','取消'], //按钮
						shade: true //不显示遮罩
					}, function(){
						userInterface.changeStatus(data,function(){
							layer.closeAll()
							goPage('index',{subModule:'staff'});
							layer.msg('禁用成功！', {icon: 6, time: 2000});
							
						});
					});
				});
			},
			enabled = function (data) {
				setTimeout(function() {
					layer.confirm('确认启用？', {
						btn: ['确认','取消'], //按钮
						shade: true //不显示遮罩
					}, function(){
						userInterface.changeStatus(data,function(){
							layer.closeAll()
							goPage('index',{subModule:'staff'});
							layer.msg('启用成功！', {icon: 6, time: 2000});
						});
						
					});
				});
			},
			remove = function(data){
				CommonUtil.operation({
					moduleName: 'user',
					oper: 'remove',
					oper_cn: '删除',
					params: {
						id:data.id
					}
				}, function(res) {
					goPage('index',{subModule:'staff'});
					layer.msg('删除成功！', {icon: 6,time: 2000});
				});
			},
			renderFlocks = function(data){
				userInterface.getFlocks({},function(res){
					var html = '<option value="">所有角色</option>';
					console.log($(searchFormSelector + ' select'))
					userFlocks = res;
					if(res.length > 0) {
						res.forEach(function(value){
							html += '<option value="' + value.id+ '">' + value.name + '</option>';
						})
						$(searchFormSelector + ' select').html(html);
						$(searchFormSelector + ' select').val(data.flockId);
					}
					
				});
			},
			search = function(){
				let formData = $(searchFormSelector).serializeObject();
				getStaffView(formData);
			},
			eventInit = function(){
				$(searchFormSelector + ' .reset').on('click', function() {
					CommonUtil.formDataSetAndGet({
						container: searchFormSelector,
						data: {
							page: 1,
							keyword: '',
							flockId: ''
						}
					})
					$(searchFormSelector + ' select').val('');
					search();
				});
				$(userTableSelector).unbind();
				$(userTableSelector).on('click','.disabledItem',function(){
					var id = $(this).parent().attr('data-id');
					disabled({id:id,status:false});
				});
				$(userTableSelector).on('click','.enabledItem',function(){
					var id = $(this).parent().attr('data-id');
					enabled({id:id,status:true});
				});
				$(userTableSelector).on('click','.editItem',function(){
					var id = $(this).parent().attr('data-id');
					showForm({id:id});
				});
				$(userTableSelector).on('click','.remove',function(){
					var id = $(this).parent().attr('data-id');
					remove({id:id});
				});
				$(userTableSelector).on('click','.resetPassword',function(){
					var data = $(this).parent().data();
					resetPassword(data);
				});
				
				$(searchFormSelector + ' button.submit').unbind().on('click',function(){
					$(searchFormSelector + ' input[name="page"]').val(1);
					search();
				});
				//搜索框内的回车事件
				$(searchFormSelector).unbind('keydown').keydown('.form-control',function(){
					if(event.keyCode==13){
						$(searchFormSelector + ' button.submit').trigger('click');
						return false;
				    }
				});
			};
			 
		this.init =  init,
		this.showForm = showForm,
		this.getStaffView = getStaffView	
	};
	w['UserManage'] = UserManage;
	return w;
})(window)