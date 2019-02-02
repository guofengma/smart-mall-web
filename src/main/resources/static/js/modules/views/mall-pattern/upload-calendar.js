//上传日历
var CalendarUpload = function(){
	let EL = '#mall-pattern-calendar-manage',
		year = '',
		calendarLoading = null;
	init = function(data){
		/*openPanel(data);*/
		//查询日历是否初始化
		isCalendarInit({},function(res){
			year = res.year
			if(res.result) {
				$(EL + ' .tips').html('');
			} else{
				$(EL + ' .tips').html('<p>' + res.message + '，您可通过“<span>上传模板</span>”去配置</p>');
			}
		})
		//提示语
		let lIndex = null;
		$(EL + ' .help').unbind().on('mouseenter',function(){
			lIndex = null;
			$(EL + ' .help').unbind('click').on('click',function(){
				let self = $(this),
					msg = '您只需在模板中配置有别于普通工作日和周末的特殊日期';
				setTimeout(function(){
					lIndex = layer.tips("<span style='color:#666666'>"+msg+"</span>", self[0], {
						tips: [2, '#F3F3F3'],
						time: 100000
					});
				})
			})
		}).on('mouseleave', function(){
			if(lIndex) {
				setTimeout(function(){
					layer.close(lIndex);
				})
			}
		});
		//上传按钮绑定事件
		$(EL + ' .upload-btn').unbind().on('click',function(){
			openPanel();
		})
	},
	openPanel = function(data){//打开上传的界面
		var calendarFileUpload = new EminAontherFileUpload();
		setTimeout(function() {
			calendarFileUpload.init({
				title: '上传本地文件',
				confirmMsg: '将直接覆盖之前的设置，是否继续？',
				fileNumLimit: 1,
				uploadUrl: 'mall-pattern-calendar/uploadMallPatternCalendar',
				filesType: ['excel'],
				data:{},
				uploadFn: function(uploader, state){
					let selectedYear = $('#calender-upload-timer').val();
					console.log(uploader,state)
					if(year && year != '') {
						let confirmPanel = layer.confirm("将直接覆盖之前的设置，是否继续？", {
						    btn: ['是','否'], //按钮
						    shade: true, //显示遮罩
						    icon: 3
						}, function(){
							layer.close(confirmPanel);
							calendarLoading = layer.load()
							if (state === 'ready' ) {
				            	uploader.option('formData',{year:year})
				                uploader.upload();
				            } else if ( state === 'paused' ) {
				            	uploader.option('formData',{year:year})
				                uploader.upload();
				            } else if ( state === 'uploading' ) {
				                uploader.stop();
				            } 
						},function(){
							layer.close(confirmPanel);
						});
						
					} else {
						layer.msg('请选择年份',{icon:5});
						return false;
					}
					
				}
			}, function(res) {
				layer.closeAll();
				if(res.success){
					goPage('mall-pattern-calendar');
					layer.msg('导入成功', {icon: 6});
				} else {
					layer.msg(res.message?res.message:'导入失败', {icon: 5});
				}
				
			})
			$('.layui-layer-content').append('<a class="download" style="position: absolute;right: 20px;text-decoration: underline;color: #666666;cursor: pointer;">下载模板</a>')
			$('.layui-layer-content .webuploader .queueList').before('<span>年份：<span>&nbsp;&nbsp;<input class="form-control" id="calender-upload-timer" placeholder="请选择年份" name="timeSelect">')
			$('#calender-upload-timer').css({
				'display': 'inline-block',
				'width': '200px',
				'margin-bottom': '20px',
				'padding': '10px',
				'background-color':'#eeeeee'
			})
			.val(year)
			.attr('readonly','readonly');
			laydate.render({ 
				elem: '#calender-upload-timer',
				type: 'year',
				min: 0,
				value: year,
				btns: ['now', 'confirm']
			});
			$('.layui-layer-content .download').on('click',function(){
				downloadTemplate()
			});
		});
	},
	downloadTemplate = function(){
		var url = base + 'mall-pattern-calendar/getUploadMallPatternCalendarExcelFile';
		console.log('allala',url)
		window.location.href =  url;
	},
	isCalendarInit = function (p,callback) {
		CommonUtil.operation({
			moduleName: 'mall-pattern-calendar',
			oper: 'findInitResultMallPatternByYear',
			type: 'get',
			params: {year:p.year},
			forbidConfirm: true
		}, function(res) {
			if(typeof callback == 'function') {
				callback(res);
			}
		});
	};
	return {
		init: init
	};
}();
