
var cenConSubSys = (function(){
	var init = function(data){
		var el = '#sub-system-manage-html';
		
		$(el + ' .sub-sys-type-item').on('click','.edit',function(){
			var sub_sys_code = $(this).parents('.sub-sys-type-item').attr('data-code');//当前编辑的子系统的code
			goPage('sub-system-form?code='+sub_sys_code);
		});
	};
	
	return {
		init: init
	};
}())
