(function(w){
	var RepairGroupManage = function(){
		let searchFormSelector = '#repair-group-searchform',
			tableSelector = '#repair-group-table',
			_this = this;
		let getRepairGroupView = function(data) {
			data = data ? data : {}
			_this.params = data;
			CommonUtil.ajaxRequest({
    			url: 'user/repair-group',
    			type: 'get',
    			data: data,
    			forbidConfirm: true,
    			forbidLoading: false,
    		}, function(res) {
				$('#repair-group-html .panel-body').html(res);
				eventInit();
			})	
		},
		//新增运维班组
		createRepairGroup = function(p){
			CommonUtil.ajaxRequest({
    			url: 'user/create-repair-group',
    			type: 'get',
    			data: {},
    			forbidConfirm: true,
    			forbidLoading: false,
    		}, function(res) {
    			let createPanel = layer.open({
    				type: 1,
    				title: '新建维修班组',
    				shadeClose: false,
    				closeBtn: 1, 
    				anim: 2,
    				skin : 'layui-layer-rim', //加上边框
    				area : [ '850px', '600px' ], //宽高
    				content : '<div class="create-open">' + res + '</div>'
    			});
    			$('.create-open .repair-group-basic-form select[name="subsystemCodes"]').chosen({
					allow_single_deselect: true, //删除选项
					max_selected_options: 999, //多选上限
					disable_search:true, //禁用搜索框
					placeholder_text_multiple:'选择' //提示值
				});
			})
		},
		//编辑运维班组基本信息
		editGroup = function(data){
			let teamId = data.teamId;
			CommonUtil.ajaxRequest({
    			url: 'user/edit-group',
    			type: 'get',
    			data: {id: teamId},
    			forbidConfirm: true,
    			forbidLoading: false,
    		}, function(res) {
    			setTimeout(function(){
    				let eidtPanel = layer.open({
        				type: 1,
        				title: '编辑基本信息',
        				shadeClose: false,
        				closeBtn: 1, 
        				anim: 2,
        				skin : 'layui-layer-rim', //加上边框
        				area : [ '600px', '400px' ], //宽高
        				btn: ['确认'],
        				content : '<div class="repair-group-edit-open">' + res + '</div>',
        				yes: function(lindex) {
        					let formEl = $('.repair-group-edit-open .repair-group-basic-form'),
        						formData = formEl.serializeObject(),
        						teamGroupDeviceDtos = [];
        					if (!formEl.valid()) {
        	        			return false;
        	        		}
        					if(!(formData.subsystemCodes && formData.subsystemCodes.length > 0)) {
        						layer.msg('请选择维修系统',{icon:3});
        						return false;
        					} else {
        						if(typeof formData.subsystemCodes == 'string') {
        							formData.subsystemCodes = [formData.subsystemCodes]
        						}
        						formData.subsystemCodes.forEach(function(value){
        							teamGroupDeviceDtos.push({
        								systemCode: value,
        								systemName: formEl.find('option[value="'+value+'"]').text(),
        								teamId: teamId
        							})
        						})
        					}
        					data.id = teamId;
        					data.name = formData.name;
        					data.teamGroupDeviceDtos = teamGroupDeviceDtos;
        					delete data.repairSystemCodes;
        					console.log('data',data)
        					CommonUtil.operation({
        						moduleName: 'repair-group',
        						oper: 'updateTeamGroup',
        						type: 'post',
            					oper_cn: '保存',
        						params: {
        							teamGroupDto:JSON.stringify(data)
        						}
        					}, function(res) {
        						getRepairGroupView(_this.params)
        						layer.close(lindex);
        						layer.msg('保存成功！', {icon: 6,time: 2000});
        					});
        				}
        			});
        			
        			let openSelector = $('.repair-group-edit-open');
        			openSelector.find('.repair-group-basic-form').css({'margin-top':'20px','border':'none'})
        			openSelector.find('input[name="name"]').val(data.teamName);
        			if(data.repairSystemCodes.length > 0) {
        				data.repairSystemCodes.forEach(function(value) {
        					openSelector.find('option[value="'+ value +'"]').attr('selected','selected');
    					});
    				};
    				//初始化chosen插件
    				openSelector.find('.repair-group-basic-form select[name="subsystemCodes"]').chosen({
    					allow_single_deselect: true, //删除选项
    					max_selected_options: 999, //多选上限
    					disable_search:true, //禁用搜索框
    					placeholder_text_multiple:'选择' //提示值
    				});
    			})
			})
		},
		forbiddenGroup = function(data,oper_cn){
			CommonUtil.operation({
				moduleName: 'repair-group',
				oper: 'forbiddenGroup',
				type: 'get',
				oper_cn: oper_cn,
				params: data
			}, function(res) {
				getRepairGroupView(_this.params)
				layer.msg(oper_cn + '成功！', {icon: 6,time: 2000});
			});
		},
		search = function(){
			let formData = $(searchFormSelector).serializeObject();
			getRepairGroupView(formData);
		},
		eventInit = function(){
			//搜索
			$(searchFormSelector + ' button.submit').unbind().on('click',function(){
				$(searchFormSelector + ' input[name="page"]').val(1);
				search();
			});
			//搜索框内额回车事件
			$(searchFormSelector).unbind('keydown').keydown('.form-control',function(){
				if(event.keyCode==13){
					$(searchFormSelector + ' button.submit').trigger('click');
					return false;
			    }
			});
			//重置
			$(searchFormSelector + ' .reset').on('click', function() {
				CommonUtil.formDataSetAndGet({
					container: searchFormSelector,
					data: {
						page: 1,
						teamName: ''
					}
				})
				search();
			});
			//编辑
			$(tableSelector).unbind();
			$(tableSelector).on('click','.editItem',function(){
				let obj = $(this).parents('tr').attr('data-obj'),
					systems = [],
					repairSystemCodes = [];
				
				obj = JSON.parse(obj);
				systems = obj.systemName ? obj.systemName : [];
				systems.forEach(function(value){
					repairSystemCodes.push(value.code);
				})
				obj.repairSystemCodes = repairSystemCodes;
				delete obj.systemName;
				
				console.log(repairSystemCodes,obj)
				editGroup(obj);
			});
			//禁用
			$(tableSelector).on('click','.disabledItem',function(){
				let teamId = $(this).parents('td').attr('data-id');
				forbiddenGroup({teamIds: teamId,isforbidden: true},'禁用');
				
			});
			//启用
			$(tableSelector).on('click','.enabledItem',function(){
				let teamId = $(this).parents('td').attr('data-id');
				forbiddenGroup({teamIds: teamId,isforbidden: false},'启用');
				
			});
			//删除
			$(tableSelector).on('click','.remove',function(){
				let teamId = $(this).parents('td').attr('data-id');
				CommonUtil.operation({
					moduleName: 'repair-group',
					oper: 'delTeamGroup',
					type: 'get',
					oper_cn: '删除',
					params: {teamId: teamId}
				}, function(res) {
					layer.msg('删除成功！', {icon: 6,time: 2000});
					getRepairGroupView(_this.params);
				});
			});
		},
		init = function(p){
			p = p ? p : {};
			_this.userFlockIds = p.userFlockIds ? p.userFlockIds : null;
			getRepairGroupView();
		};
		this.init = init;
		this.createRepairGroup = createRepairGroup;
		this.getRepairGroupView = getRepairGroupView;
		
	};
	w['RepairGroupManage'] = RepairGroupManage;
	return w;
})(window)