//缩放面板的方法
(function(w){
var ScalePanelFn = function(el){
	let scalePanelSelector = el + ' div.scale-panel',
		percentageListSelector = el + ' div.scale-panel .percentage-items',
		panelWidth = 0;

	//收起
	function retrack(el) {
		panelWidth = $(scalePanelSelector)[0].clientWidth;
		$(scalePanelSelector + ' .direction')
		.removeClass('direction-right')
		.addClass('direction-left')
		.attr('title','展开');
		$(scalePanelSelector + ' .direction i')
		.removeClass('fa-caret-right')
		.addClass('fa-caret-left');
		$(scalePanelSelector).animate({right: 107 - panelWidth + 'px'}, "slow");	
	};
	//展开
	function spread() {
		$(scalePanelSelector + ' .direction')
		.removeClass('direction-left')
		.addClass('direction-right')
		.attr('title','收起');
		$(scalePanelSelector + ' .direction i')
		.removeClass('fa-caret-left')
		.addClass('fa-caret-right');
		$(scalePanelSelector).animate({right: '0px'}, "slow");
	};
	//显示比例选择框
	function showPercentageList(callback) {
		let tempW = $(scalePanelSelector + ' .percentage')[0].clientWidth;
		if(tempW==0) {
			tempW = $(scalePanelSelector + ' .percentage')[1].clientWidth
		}
		
		if($(percentageListSelector).hasClass('hide')) {
			$(percentageListSelector).removeClass('hide').css({'width':tempW+ 'px'});
			//选择缩放比例
			$(percentageListSelector + ' li').unbind().on('click',function(){
				let percent = parseInt($(this).html());
				$(scalePanelSelector + ' .percentage span').html(percent);
				hidePercentageList()
				if(typeof callback == 'function') {
					callback(percent/100)
				}
			})
			//点击其他任意区域，隐藏示比例选择框
			setTimeout(function(){
				$(document).one('click',function(){
					hidePercentageList();
				})
			})
		} else {
			$(percentageListSelector).addClass('hide');
		}
		
		
	};
	//隐藏示比例选择框
	function hidePercentageList() {
		if(!$(percentageListSelector).hasClass('hide')) {
			$(percentageListSelector).addClass('hide');
		}
			 
	};
	function init(el) {
		$(scalePanelSelector).removeClass('hide');
		$(scalePanelSelector).find('.percentage span').html('100');
		panelWidth = $(scalePanelSelector)[0].clientWidth;
		/*if($(el).parents('.layui-layer').length < 1) {*/
			/*retrack();*/
			console.log($(scalePanelSelector + ' a.direction'))
			$(scalePanelSelector + ' a.direction').unbind().on('click',function(){
				if($(this).hasClass('direction-left')) {//调用展开方法
					spread();
				} else{//调用收起方法
					retrack();
				}
			});
		/*} else {
			spread()
		}*/
		
		
	};
	init(el);
	this.showPercentageList = showPercentageList;
};
w['ScalePanelFn'] = ScalePanelFn;
	return w;
})(window)