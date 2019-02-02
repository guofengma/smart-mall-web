CommandTemplateForm = (function(){
	var moduleCode,
		moduleName,
		El,
		versionfunctions,
		fPersonalParameters,
		commandTemplateId,
		configure_list = [],
		isEmpty = false, // 判断是否有字段没填写
		status = true; // 判断填写字段是否通过验证
	var init = function(data){
			moduleCode = data.moduleCode;
			moduleName = data.moduleName;
			commandTemplateId = data.commandTemplateId;
			El = '#' + moduleCode + '-command-template-form';
			configure_list = [];
			save();
			if(commandTemplateId) {
				CommonUtil.operation({
					moduleName: 'commandTemplate',
					oper: 'detail',
					params: {id:commandTemplateId},
					forbidConfirm: true
				}, function(res) {
					var temp = res.result;
					$(El + ' input[name="id"]').val(temp.id);
					$(El + ' input[name="name"]').val(temp.name);
					$(El + ' select[name="versionCode"]').val(temp.versionCode);
					$(El + ' .form-group').removeClass('hide');
					temp.commandModuleDetail.forEach(function(value){
						configure_list.push({
							id: value.id,
							commandCode: value.commandCode,
					        commandName: value.commandName,
					        commandParameter: value.commandParameter,
					        personalParameter: value.personalParameter
						});
					});
					getVersionfunctions({versionCode: temp.versionCode});
				});
			};
			$(El + ' select[name="versionCode"]').on('change', function() {
				var versionCode = $(this).val();
				
				configure_list = [];
				$(El + ' .form-group').removeClass('hide');
				getVersionfunctions({versionCode: versionCode});
			});
			$(El + ' .add-configure i').on('click',function() {
				getConfigures();
				isEmptyFn(configure_list);
				if(!isEmpty) {
					render(versionfunctions,configure_list.length + 1);
				}
			});
			$(El + ' .configures').on('blur', 'input.value-box', function() {
				var self = $(this),
					value = self.val(),
					reg = new RegExp(self.attr('data-reg').trim());
				status = true;
				if(!reg.test(value)) {
					layer.msg('只能数字',{icon: 0});
					self.focus();
					status = false;
				}
			});
			$(El + ' .configures').on('click', '.remove', function() {
				var self = $(this),
					parent = self.parents('.configure'),
					sort = parent.attr('data-sort');
				parent.remove();
				if(sort < configure_list.length) {
					configure_list.splice(sort, 1);
				};
				if($(El + ' .configures .configure').length == 1) {
					$(El + ' .configures .remove').remove();
				};
			});
			
		},
		getVersionfunctions = function(data){
			CommonUtil.operation({
				moduleName: 'device',
				oper: 'getFunctionsByVersion',
				params: data,
				forbidConfirm: true
			}, function(res) {
				versionfunctions = res.result;
				render(versionfunctions,configure_list.length);
			});
		},
		render = function(data, num){
			var tpl = command_template_form_configure_tpl.innerHTML,
				view = $(El + ' .configures');
			
			if(!(num && num >= 1)) {
				num = 1;
			};
			laytpl(tpl).render(data, function(html){
				var AllHtml = '';
				for(var i = 0; i < num; i++) {
					AllHtml += html;
				}
				view.html(AllHtml);
				if(num == 1) {
					view.find('.remove').remove();
				};
				if(configure_list.length > 0) {
					setInfo();
				};
				$(El + ' select[name="commandCode"]').unbind().on('change', function() {
					var self = $(this),
						parent = self.parents('.configure'),
						commandCode = self.val(),
						subTpl = command_template_form_parameters_tpl.innerHTML,
						subView = parent.find('.parameters');
					versionfunctions.forEach(function(value){
						if(value.fName == commandCode) {
							var fPersonalParametersString = null,
								fCommondParameters = value.fCommondParameters;
							fCommondParameters.forEach(function(commondParameter,index) {
								fCommondParameters[index].string = JSON.stringify(commondParameter);
							});
							fPersonalParametersString = JSON.stringify(value.fPersonalParameters);
							parent.attr('data-fPersonalParameters',fPersonalParametersString );
							laytpl(subTpl).render(fCommondParameters, function(html){
								subView.html(html);
							});
						}
					})
					
				});
			});
		},
		setInfo = function() {
			var configure_els = $(El + ' .configures .configure'),
				len = configure_list.length,
				subTpl = command_template_form_parameters_tpl.innerHTML;
				
			configure_els.each(function(index, value) {
				$(value).attr('data-sort', index);
				if(index > len-1) {
					return false;
				};
				var self = $(value),
					subView = self.find('.parameters'),
					configure_item = configure_list[index],
					fCommondParameters = configure_item.commandParameter,
					fPersonalParametersString = JSON.stringify(configure_item.personalParameter);
				if(configure_list[index].id) {
					self.attr('data-id', configure_list[index].id);
				}
				self.attr('data-fPersonalParameters',fPersonalParametersString);
				self.find('select[name="commandCode"]').val(configure_item.commandCode);                                                                                                                               
				fCommondParameters.forEach(function(commondParameter, index) {
					fCommondParameters[index].string = JSON.stringify(commondParameter);
				})
				laytpl(subTpl).render(fCommondParameters, function(html){
					subView.html(html);
					var value_box_els = subView.find('.value-box');
					value_box_els.each(function(index3,value_box_el){
						$(value_box_el).val(fCommondParameters[index3].pValue);
					})
				})
			});
		},
		getConfigures = function(){
			var configure_els = $(El + ' .configures .configure');
			configure_list = [];
			configure_els.each(function(index, value) {
				var temp = {},
					self = $(value),
					commandCode = self.find('select[name="commandCode"]').val(),
					commandName = self.find('option[value="' + commandCode + '"]').html(),
					personalParameter = self.attr('data-fPersonalParameters'),
					id = self.attr('data-id');
					parameter_els = self.find('.parameters .form-group'),
					parameters = [];
				if(personalParameter && personalParameter.length > 0) {
					personalParameter = JSON.parse(personalParameter);
					temp = {
						commandCode: commandCode,
						commandName: commandName,
						personalParameter: personalParameter
					};
					if(id && id.length > 0) {
						temp.id = id;
					};
					parameter_els.each(function(index2,parameter_el) {
						parameter_el = $(parameter_el);
						var commandParameter = JSON.parse(parameter_el.attr('data-string')),
							pValue = parameter_el.find('.value-box').val();
						commandParameter.pValue = pValue;
						parameters.push(commandParameter);
					});
					temp.commandParameter = parameters;
				} else {
					temp = {
						commandCode: commandCode,
						commandName: commandName,
						personalParameter: personalParameter
					};
				}
				configure_list.push(temp);
			});
		},
		isEmptyFn = function(data){
			isEmpty = false;
			data.forEach(function(value, index) {
				if(!(value.commandCode && value.commandCode.length > 0)) {
					isEmpty = true;
					layer.msg('您有指令动作未填写',{icon: 5});
					return false;
				} else {
					var temp_commandParameters = value.commandParameter;
					temp_commandParameters.forEach(function(value2, index2){
						if(!(value2.pValue && value2.pValue.length > 0)) {
							isEmpty = true;
							layer.msg('您有' + value2.pDescription + '未填写',{icon: 5});
							return false;
						};
					});
				}
			});
		},
		save = function() {
			$(El).validate({
			    rules: {
			    	name:{
			        	required: true,
		            	rangelength: [1,20]
			        },
			        versionCode:{
			        	required: true
			        }
			    },
			    messages: {
			    	name:{
			        	required: icon + "请输入指令名称",
		     	        rangelength: icon + "指令名称的长度介于2-20之间"
			        },
			        versionCode: {
			        	required: icon+'请选择版本号'
			        }
			    },
			    submitHandler:function(form){
			    	var formData = $(form).serializeObject(),
			    		versionCode = formData.versionCode,
			    		versionName = $(El + ' option[value="' + versionCode + '"]').html(),
			    		isRepeat = false;
			    	delete 	formData.pValue;
			    	formData.versionName = versionName;
			    	if(!status) { // 有字段没通过验证
						return false;
					}
			    	getConfigures();
					isEmptyFn(configure_list);
					if(isEmpty) {
						return false;
					}  else {
						let tempList = formData.commandCode;
							len = tempList.length;
						if(typeof tempList == 'object') {
							for(let i = 0; i < len-1; i ++) {
								for(let j = i+1; j < len; j ++) {
									if(tempList[i] == tempList[j]) {
										isRepeat = true;
										break;
									}
								} 
							}
						}
						if(isRepeat) {
							layer.msg('指令动作不能重复',{icon: 0});
							return false;
						}
						configure_list.forEach(function(value1, index1) {
							value1.commandParameter.forEach(function(value2, index2) {
								var pValue = value2.pValue,
									reg = new RegExp(value2.pRegexExp.trim());
								if(!reg.test(pValue)) {
									var configure_el = $(El + ' .configures .configure')[index1],
										value_box_el = $(configure_el).find('.value-box')[index2];
									layer.msg(value2.pDescription + '只能数字',{icon: 0});
									$(value_box_el).focus();
									status = false;
									return false;
								}
								if(!status) {
									return false;
								}
							});
							if(!status) {
								return false;
							};
							configure_list[index1].versionCode = versionCode;
							configure_list[index1].versionName = versionName;
							configure_list[index1].sort = index1 + 1;
						});
						if(status) {
							formData.list = configure_list;
							delete formData.commandCode;
							layer.confirm('确认保存？', {
							    btn: ['确认','取消'], //按钮
							    shade: true //显示遮罩
							}, function(lindex){
								layer.close(lindex);
								CommonUtil.operation({
									moduleName: 'commandTemplate',
									oper: 'save',
									oper_cn: '保存',
									params: {commandModuleStr: JSON.stringify(formData)},
									forbidConfirm: true
								}, function(res) {
							    	goPage('index',{type:'command-template-set'});
									layer.msg('保存成功！', {icon: 6,time: 2000});
								});
							});
							
						};
					}
			    }    
			});
		};
	return {
		init: init
	};		
}());