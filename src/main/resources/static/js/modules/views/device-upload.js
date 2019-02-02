//设备批量上传
var DeviceUpload = function(){
	let init = function(data){
		openPanel(data);
	},
	openPanel = function(data){//打开上传的界面
		var devicesFileUpload = new EminAontherFileUpload();
		setTimeout(function() {
			devicesFileUpload.init({
				title: '设备批量上传',
				confirmMsg: '您确定要将文件中的所有设备批量导入至<strong> ' + data.areaName + '&nbsp;' + data.floorName + ' </strong>吗',
				forbidLoading: false,
				fileNumLimit: 1,
				uploadUrl: 'device/uploadDevices',
				filesType: ['excel'],
				data:{floorId:data.floorId}
			}, function(res) {
				layer.closeAll();
				if(res.success){
					console.log($('section.device-manage .all-subsys-devices'));
					$('section.device-manage .all-subsys-devices').trigger('click');
					let tempAlarmConfirm = null,
						html = '<div>导入完毕</div>',
						result = res.result ? res.result : [];
					if(result.length > 0) {
						result.forEach(function(value){
							let tempHtml = '<div><strong>'+ value.sheetName + ' </strong>导入成功'+
												'<span style="color:red">'+ value.sheetSuccessTotal + '</span>条，导入失败'+
												'<span style="color:red">'+ value.sheetFailTotal +'</span>条'+
												'<p>状态检测中，请稍后刷新</p>'+
											'</div>';
							html += tempHtml;
						});
					};
					tempAlarmConfirm = layer.confirm(html, {
						btn: ['下载导入结果'], //按钮
						shade: true //显示遮罩
					}, function(){
						var url = base  + "device/downloadTempFile";
						console.log(document.getElementById("ifile"))
						document.getElementById("ifile").src = url;
						layer.close(tempAlarmConfirm)
					});
				} else {
					
					layer.msg(res.message?res.message:'导入失败', {icon: 5});
				}
				
			})
			$('.layui-layer-content').append('<a class="download" style="position: absolute;right: 20px;text-decoration: underline;color: #666666;cursor: pointer;">下载模板</a>')
			
			$('.layui-layer-content .download').on('click',function(){
				downloadTemplate()
			});
		});
	},
	downloadTemplate = function(){
		var url = base + 'device/getUploadDeviceExcelFile';
		window.location.href =  url;
	};
	return {
		init: init
	};
}();

