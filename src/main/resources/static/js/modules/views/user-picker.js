var UserPicker = function(container) {
    var that = this;
    that.checkedItems = [];
    var containerId = '#user-picker ';
    var form = containerId + 'form';
    var table = containerId + 'table';
    var paginate = containerId + '.paginate';
    var loadPcode = function(searchData) {
    	CommonUtil.ajaxRequest({
			url: 'user/list',
			data: searchData,
			forbidLoading: true
		}, function(pcode) {
			$(container).html(pcode);
	    	checkItems();
			$(form + ' select[name="flockId"]').val(searchData && searchData.flockId ? searchData.flockId : '');
			$(form + ' button').unbind('click').click(function() {
				var data = $(this).data();
				eval(data.opt + '()');
			});
			
			$(table).footable();
		    var paginateP = $(paginate).data();
		    laypage.render({
				elem: $(paginate)[0], //注意，这里的 test1 是 ID，不用加 # 号
				count: paginateP.totalcount, //数据总数 //从服务端得到
				limit: paginateP.limit,
				curr: paginateP.curr,
				theme: '#0069b6',
			  	layout: ['count', 'prev', 'page', 'next', 'limit', 'skip'],
				jump : function(obj, first) {
					if(!first) {
						CommonUtil.formDataSetAndGet({
							container: form, 
							data: {
								page: obj.curr,
								limit: obj.limit
							}
						}, loadPcode)
					}
				}
			});
			
		    $(form).keydown(function(e) {
				var theEvent = e || window.event;
				var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
				if (code == 13) {
					submitForm();
					return false;
				}
				return true;
			});
		});
    };
	var submitForm = function() {
		CommonUtil.formDataSetAndGet({
			container: form
		}, loadPcode)
	};
	
	var resetForm = function() {
		CommonUtil.formDataSetAndGet({
			container: form, 
			data: {
				page: 1,
				keyword: '',
				flockId:''
			}
		}, loadPcode)
	};
	

	var checkItems = function() {
		$('.i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
		CommonUtil.itemsCheck({
			allSelector: table + ' input[name="select-all"]',
			itemSelector: table + ' input[name="select-item"]'
		}, function(items) {
			that.checkedItems = items;
		});
	};
	
	var init = function(callback) {
		loadPcode();
	};
	
	init();
};

var ServiceUserPicker = function(container, code) {
    var that = this;
    that.checkedItems = [];
    var containerId = container + ' #service-user-picker ';
    var form = containerId + 'form';
    var table = containerId + 'table';
    var loadPcode = function(searchData) {
		searchData = searchData ? searchData : {};
		searchData.code = code;
		$http.get({
			url: 'user/serviceList',
			data: searchData,
			forbidLoading: true
		}, function(pcode) {
			$(container).html(pcode);
	    	checkItems();
			$(form + ' select[name="flockId"]').val(searchData && searchData.flockId ? searchData.flockId : '');
			$(form + ' button').unbind('click').click(function() {
				var data = $(this).data();
				eval(data.opt + '()');
			});
			$(table).footable();
			
		    $(form).keydown(function(e) {
				var theEvent = e || window.event;
				var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
				if (code == 13) {
					submitForm();
					return false;
				}
				return true;
			});
		})
    };
	var submitForm = function() {
		CommonUtil.formDataSetAndGet({
			container: form
		}, loadPcode)
	};
	
	var resetForm = function() {
		CommonUtil.formDataSetAndGet({
			container: form, 
			data: {
				page: 1,
				keyword: '',
				flockId: ''
			}
		}, loadPcode)
	};
	

	var checkItems = function() {
		$('.i-checks').iCheck({
		    checkboxClass: 'icheckbox_square-green',
		    radioClass: 'iradio_square-green',
		});
		CommonUtil.itemsCheck({
			allSelector: table + ' input[name="select-all"]',
			itemSelector: table + ' input[name="select-item"]'
		}, function(items) {
			that.checkedItems = items;
		});
	};
	
	var init = function(callback) {
		loadPcode();
	};
	
	init();
};