var StoreInfo = (function(){
	var moduleId = '#store-info',
		currentInfo,
		setInfo = function(si) {
			currentInfo = si;
			CommonUtil.formDataSetAndGet({
				container: moduleId,
				data: currentInfo
			}, function(res) {
				var ifFull = true;
				res = res ? res : {};
				for (key in res) {
					if (!res[key]) {
						ifFull = false;
					}
				}
				if (!ifFull) {
					$(moduleId + ' div.info-line > label.il-cnt').css('display', 'none');
					$(moduleId + ' div.info-line > div.il-input').css('display', 'block');
					layer.msg('请完善商场信息设置！', {icon: 0});
				} else {
					$(moduleId + ' div.info-line > label.il-cnt').css('display', 'block');
					$(moduleId + ' div.info-line > div.il-input').css('display', 'none');
				}
			});
			if (currentInfo.logo && currentInfo.logo.storage) {
				$(moduleId + ' div.show-mallpic > div.picture > img').attr('src', currentInfo.logo.storage[0].fileStorageUrl);
				$(moduleId + ' div.upload-mallpic').addClass('hide');
				$(moduleId + ' div.show-mallpic').removeClass('hide');
			}
		},
		save = function(data,callback){
			if(!data || $.isEmptyObject(data)) {
				return false;
			};
			CommonUtil.operation({
				moduleName: 'store',
				oper: 'save',
				params: data.params||{},
				forbidConfirm: true
			}, function(res) {
				if(typeof callback == 'function') {
					callback(res)
				}
			});
		},
		init = function(p){
			
			$(moduleId + ' div.info-line > label.il-cnt').on('click dbclick', function() {
				$(this).siblings('div.il-input').css('display', 'block');
				$(this).css('display', 'none');
			});
			
			$(moduleId + ' div.info-line > div.il-input > input').on('blur', function() {
				var parentEl = $(this).parent(),
					showEl = parentEl.siblings('label.il-cnt'),
					value = $(this).val(),
					name =  $(this).attr('name');
				
				if (!currentInfo || !currentInfo.id) {
					CommonUtil.reportErrMsg('商场信息不存在! 请联系管理员！');
					return false;
				}
				
				if (!value) {
					return false;
				}

				if (value !== currentInfo[name]) {
					save({params:{
							id: currentInfo.id,
							key: name,
							value: value	
						}
					},function(res){
						currentInfo[name] = value;
						layer.msg('保存成功！', {icon: 6});
						showEl.html(value);
					});
				}
				showEl.css('display', 'block');
				parentEl.css('display', 'none');
			});
			$(moduleId + ' div[role="add-pic"]').unbind().on('click', function() {
				var eminFileUpload = new EminFileUpload();
				
				eminFileUpload.init({
					title: '上传商场图片',
					fileNumLimit: 1,
					filesType: ['img']
				}, function(res) {
					let uploadRes = res;
					save({params:{
							id: currentInfo.id,
							key: 'logo',
							value: JSON.stringify(res[0])	
						}
					},function(res){
						layer.msg('商场图片上传并保存成功！', {icon: 6});
						$(moduleId + ' div.show-mallpic > div.picture > img').attr('src', uploadRes[0].storage[0].fileStorageUrl);
						$(moduleId + ' div.upload-mallpic').addClass('hide');
						$(moduleId + ' div.show-mallpic').removeClass('hide');
					})
					
					
				});
			});
			$(moduleId + ' div[role="clear-pic"]').on('click', function() {
				currentInfo.picture = {};
				save({params:{
						id: currentInfo.id,
						key: 'logo',
						value: ''	
					}
				},function(res){
					layer.msg('商场图片删除成功！', {icon: 6});
					$(moduleId + ' div.show-mallpic > div.picture > img').attr('src', '');
					$(moduleId + ' div.upload-mallpic').removeClass('hide');
					$(moduleId + ' div.show-mallpic').addClass('hide');
				})
			});
		}
			
	return {
		init: init,
		setInfo: setInfo
	}
	
}());