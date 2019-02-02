var EminFileUpload = (function(){
	var uploaderId,
		html,
		title,
		filesType,
		fileNumLimit,
		uploadPics = [],
		fileSizeLimit,//所有文件大小
		fileSingleSizeLimit,//单个文件大小
		paramsInit = function(p) {
			p = p ? p : {};
			
			uploaderId = new Date().getTime();
			html = '<div id="uploadInterface" style="z-index:999;">'+
					'<div class="webuploader" id="' + uploaderId + '">'+
					$('#webuploaderTPL').html() +
			    '</div>'+
			'</div>';
			title = p.title;
			filesType = p.filesType ? p.filesType : ['img'];
			fileNumLimit = p.fileNumLimit ? p.fileNumLimit : 1;
			fileSizeLimit = p.fileSizeLimit ? p.fileSizeLimit : null;
			fileSingleSizeLimit = p.fileSingleSizeLimit ? p.fileSingleSizeLimit: null;
		},
		uploadFileCore = function(p, callback) {
			setTimeout(function() {
				layer.open({
					type : 1,
					title : title,
					skin : 'layui-layer-rim', //加上边框
					area : [ '60%', '450px' ], //宽高
					content : '<div class="wrapper-content">' + html + '</div>',
					btn : [ '确定'],
					yes : function(lindex, layero) {
						if (uploadPics.length == 0) {
							layer.msg('请上传张图片后再点击此按钮', {icon: 5});
							return false;
						} else {
							if (typeof callback == 'function') {
								callback(uploadPics);
							}
							layer.closeAll();
						}
					}
				});
				CUploadFiles({
					uploaderId: uploaderId,
					filesType: filesType,
					uploadUrl: '/file/upload.do',
					fileNumLimit: fileNumLimit,
					fileSizeLimit: fileSizeLimit,
					fileSingleSizeLimit: fileSingleSizeLimit,
				}, function(file, response){
					if(response.success){
						var ImgUrl = response.result.storage[2].fileStorageUrl;
						uploadPics.push(response.result);
					} else {
						layer.msg(response.message?response.message:'上传失败', {icon: 5});
					}

				});
			});
		},
		init = function(p, callback) {
			paramsInit(p);
			uploadFileCore(p, callback);
		};
		
	this.init = init;
});

//无确定按钮，上传成功后执行回调函数
var EminAontherFileUpload = (function(){
	var uploaderId,
		html,
		title,
		filesType,
		fileNumLimit,
		fileSizeLimit,//所有文件大小
		fileSingleSizeLimit,//单个文件大小
		_this = this,
		paramsInit = function(p) {
			p = p ? p : {};
			
			uploaderId = new Date().getTime();
			html = '<div id="uploadInterface" style="z-index:999;">'+
					'<div class="webuploader" id="' + uploaderId + '">'+
					$('#webuploaderTPL').html() +
			    '</div>'+
			'</div>';
			title = p.title;
			filesType = p.filesType ? p.filesType : ['img'];
			fileNumLimit = p.fileNumLimit ? p.fileNumLimit : 1;
			fileSizeLimit = p.fileSizeLimit ? p.fileSizeLimit : null;
			fileSingleSizeLimit = p.fileSingleSizeLimit ? p.fileSingleSizeLimit: null;
		},
		uploadFileCore = function(p, callback) {
			_this.open = layer.open({
				type : 1,
				title : title,
				skin : 'layui-layer-rim', //加上边框
				area : [ '60%', '450px' ], //宽高
				content : '<div class="wrapper-content">' + html + '</div>'
			});
			CUploadFiles({
				uploaderId: uploaderId,
				filesType: filesType,
				uploadUrl: p.uploadUrl ? p.uploadUrl:'/file/upload.do',
				forbidConfirm: p.forbidConfirm ? p.forbidConfirm : false,
				forbidLoading: p.forbidLoading == false ? p.forbidLoading : true,
				confirmMsg: p.confirmMsg ? p.confirmMsg:'',
				data: p.data,
				uploadFn: p.uploadFn ? p.uploadFn : null,
				fileNumLimit: fileNumLimit,
				fileSizeLimit: fileSizeLimit,
				fileSingleSizeLimit: fileSingleSizeLimit,
			}, function(file, response){
				if (typeof callback == 'function') {
					callback(response);
				}
			});
		},
		init = function(p, callback) {
			paramsInit(p);
			uploadFileCore(p, callback);
			
		};	
	this.init = init;
});