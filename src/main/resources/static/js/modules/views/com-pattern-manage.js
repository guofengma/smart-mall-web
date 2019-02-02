var patternSetManage = (function(){
	let El = '#pattern-set',
		operationCodes;
	let	init = function(data){
			patternsReander();
			operationCodes = data.operationCodes?data.operationCodes:'';
		},
		patternsReander = function(data){
			let tpl = pattern_set_items_tpl.innerHTML,
				view = $(El + ' .pattern-set-items');
			
			data = data ? data : {};
			PatternInterface.combpatterns({},function(res){
				laytpl(tpl).render(res, function(html){
					view.html(html);
					if(operationCodes.indexOf('remove-pat-set') == -1) { // 删除权限
						$(El + ' .pattern-set-items .remove').remove();
					};
					if(operationCodes.indexOf('add-pat-set') == -1) { // 添加权限
						$(El + ' .add-pattern').remove();
					};
					if(data.combPatternId) {
						$(El + ' .pattern-set-items div[data-id="'+data.combPatternId+'"]').addClass('actived');
					};
					
					$(El + ' .pattern-set-items .add-pattern i').unbind().on('click', function() {
						openPatternSetPanel();
					});
					$(El + ' .pattern-set-items .pattern-set-item').unbind().on('click', function() {
						let id = $(this).attr('data-id');
						$(El + ' .pattern-set-items .pattern-set-item').removeClass('actived');
						$(this).addClass('actived');
						patternDetail({id: id});
					});
					$(El + ' .pattern-set-items .pattern-set-item .remove').unbind().on('click', function(event){
						event.stopPropagation();
						let id = $(this).parent().parent().attr('data-id');
						removePattern({id: id});
					});
					
					if(res.length >= 20){
						$(El + ' .add-pattern').addClass('hide');
						$(El + ' .tips').addClass('hide');
						$(El + ' .tips').removeClass('hide');
					}
				});
			})	
		},
		openPatternSetPanel = function(data) {
			let submitData = {},
				subSysData = {},
				tpl = pattern_set_tpl.innerHTML,
				view,combPatternId;
			data = data?data:{};
			combPatternId =  data.id ? data.id : null;
			setTimeout(function() {
				lwIndex = layer.open({
					type : 1,
					title : combPatternId ? '编辑模式' : '新增模式',
					shadeClose: false,
					closeBtn: 1, 
					anim: 2,
					skin : 'layui-layer-rim', //加上边框
					area : [ '600px', '400px' ], //宽高
					content : '<div class="pattern-set-open">' + $('.pattern-set-panel').html() + '</div>',
					btn : ['保存'],
					yes: function(lindex, layero) {
						let status = true;
						submitData.id = $('.pattern-set-open input[name="id"]').val();
						submitData.name = $('.pattern-set-open input[name="name"]').val();
						submitData.remark = submitData.name;
						
						/*layer.close(lindex);*/
						if(submitData.name.length == 0){
							layer.msg('请填写模式名称',{icon: 5});
							return false;
						}
						if($.isEmptyObject(subSysData)) {
							layer.msg( '未选择任何子系统',{icon: 5});
							return false;
						}
						for(key in subSysData){
							if($.isEmptyObject(subSysData[key])) {
								let name =  $('.pattern-set-open div[data-code="' + key + '"] .sub-sys-name').text();
								layer.msg( name + '未选择模式',{icon: 5});
								status = false;
								break;
							};
							if(submitData.id.length > 0) {
								subSysData[key].subsystemPatternSetId = submitData.id;
							};
						};
						if(status) {
							let temp = [];
							for(key in subSysData) {
								temp.push(subSysData[key]);
							};
							submitData.list = temp;
							
							CommonUtil.operation({
								moduleName: 'com-pattern',
								oper: 'saveCombpattern',
								oper_cn: '保存',
								params: {
									subsystemPatternSetStr: JSON.stringify(submitData)
								}
							}, function(res) {
								layer.closeAll();
								layer.msg('模式保存成功！', {icon: 6,time: 2000});
								patternsReander({combPatternId:combPatternId});
								if(combPatternId) {
									patternDetail({id:combPatternId});	
								}
							});
						}
						return false;
					}
				});
				PatternInterface.querySysPat({},function(res){
					
					view = $('.pattern-set-open .row');
					laytpl(tpl).render(res, function(html){
						view.html(html);
						$('.i-checks').iCheck({
							checkboxClass: 'icheckbox_square-green',
							radioClass: 'iradio_square-green',
						});
						if(data.id){
							$('.pattern-set-open input[name="id"]').val(data.id);
							$('.pattern-set-open input[name="name"]').val(data.name);
							subSysData = data;
							delete subSysData.id;
							delete subSysData.name;
							
							for(key in subSysData){
								
								let temp = subSysData[key],
									parent = $('.pattern-set-open div[data-code="' + key + '"]');
								parent.find('.selected-item').html(temp.subsystemPatternName);
								parent.attr('selected-id',temp.id);
								parent.find('button[data-id="'+ temp.subsystemPatternId+'"]').addClass('selected');
								parent.addClass('sub-sys-checked');
								parent.find('input[type="checkbox"]').iCheck('check');
							}
							
						} else {
	//						$('.pattern-set-open .sub-sys-item').each(function(index, value){
	//							let typeCode = $(value).attr('data-code');
	//							subSysData[typeCode] = {};
	//						});
						}
						$('.pattern-set-open .sub-sys-item').on('click', function() {
							let self = $(this);
							if(!self.hasClass('sub-sys-checked')) {
								return false;
							};
							if(self.hasClass('actived')) {
								self.removeClass('actived');
								self.find('.selected-item').removeClass('hide');
								self.find('.all-itmes').addClass('hide');
							} else {
								$('.pattern-set-open .sub-sys-item').removeClass('actived');
								$('.pattern-set-open .sub-sys-item .selected-item').removeClass('hide');
								$('.pattern-set-open .sub-sys-item .all-itmes').addClass('hide');
								self.addClass('actived');
								self.find('.selected-item').addClass('hide');
								self.find('.all-itmes').removeClass('hide');
							};
							
						});
						$('.pattern-set-open .sub-sys-item button').on('click', function(event) {
							event.stopPropagation();
							let self = $(this);
							if(!self.hasClass('selected')){
								let	parent = self.parent().parent().parent(),
									typeCode = parent.attr('data-code'),
									value = self.attr('data-value'),
									id = parent.attr('selected-id');
								
								value = JSON.parse(value);
								if(id && id.length > 0) {
									value.id = id
								};
								
								parent.find('button').removeClass('selected');
								self.addClass('selected');
								parent.find('.selected-item').html(value.subsystemPatternName);
								parent.find('.selected-item').attr('data-id', value.subsystemPatternName);
								subSysData[typeCode] = value;
							}
						});
						
						$('.pattern-set-open .sub-sys-item input[type="checkbox"]').on('ifChecked',function(){//选中
							let subSysCode = $(this).attr('value'),
								parent = $(this).parents('.sub-sys-item');
							$('.pattern-set-open .sub-sys-item[data-code="' + subSysCode +'"]').addClass('sub-sys-checked');
							subSysData[subSysCode] = {};
							parent.trigger('click');
						});
						$('.pattern-set-open .sub-sys-item input[type="checkbox"]').on('ifUnchecked',function(){//取消选中
							let subSysCode = $(this).attr('value'),
								parent = $('.pattern-set-open .sub-sys-item[data-code="' + subSysCode +'"]');
							
							parent.removeClass('sub-sys-checked');
							parent.removeClass('actived');
							parent.find('.selected-item').removeClass('hide');
							parent.find('.all-itmes').addClass('hide');
							parent.find('.selected-item').html("未选择");
							parent.find('.selected-item').removeAttr('data-id');
							parent.find('button').removeClass('selected');
							delete subSysData[subSysCode];
						});
					});
				});
			});
			
		},
		removePattern = function(data){
			layer.confirm('确认删除？', {
			    btn: ['确认','取消'], //按钮
			    shade: true //显示遮罩
			}, function(){
				CommonUtil.operation({
					moduleName: 'com-pattern',
					oper: 'delete',
					oper_cn: '删除',
					params: data
				}, function(res) {
					layer.msg('删除成功！', {icon: 6,time: 2000});
					patternsReander();
				});
			});
		},
		patternDetail = function(data){
			if($(El + ' .detail-container').hasClass('hide')){
				$(El + ' .detail-container').removeClass('hide');
			};
			let tpl = pattern_detail_tpl.innerHTML,
				view = $(El + ' .pattern-msg');
			PatternInterface.detail(data,function(res){
				res.string = JSON.stringify(res);
				laytpl(tpl).render(res, function(html){
					view.html(html);
					adapt();
					if(operationCodes.indexOf('edit-pat-set') == -1) { // 编辑权限
						$(El + ' .pattern-msg .edit').remove();
					};
					$(El + ' .pattern-msg .edit').removeClass('hide');
					$(El + ' .pattern-msg').unbind().on('click', '.edit', function(){
						let id = $(this).attr('data-id'),
							value = JSON.parse($(this).attr('data-value')),
							temp = {
								id: value.id,
								name: value.name
							},
							tempList = value.subsystemPatternSetDetail;
						
						tempList.forEach(function(value, index){
							let code  = value.subsystemCode;
							temp[code] = value;
						});
							
						openPatternSetPanel(temp);
					});
				});
			})
			
		},
		adapt = function() {//表单高度样式适应。
			var adapt_el = El +' .pattern-item-detail .below',
				height_1 = $(adapt_el + ' .col-sm-8')[0].offsetHeight -10;
			$(adapt_el + ' .title').css({'height': height_1 + 'px', 'line-height': height_1 + 'px'});
		};
	return {
		init: init
	};
}());