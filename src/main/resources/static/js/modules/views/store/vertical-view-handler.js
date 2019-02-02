/**
 * Danica
 * 20180601
 * 园区俯视图操作函数
 */
var verticalViewHandler = (function(){
	let $box, // 操作对象，返回位置信息时需要用
		picLoad, // 图片加载事件
		getPosInfo, // 获得操作对象及图片的结果信息
		init; // 匿名函数入口
	/**
	 * 加载图片获得图片原始长宽
	 * @param  {[type]}   picUrl   [图片加载地址]
	 * @param  {Function} callback [回调函数]
	 */
	picLoad = function(picUrl, callback) {
		let img = new Image;
        img.src = picUrl;
        img.onload = function() {
        	callback(img.width, img.height);
        };
	};

	getPosInfo = function() {
		let posInfo = {},
			img = $($box.find('img')[0]);

		posInfo = $box.position();
		posInfo.w = img.width();
		posInfo.h = img.height();
		posInfo.imgSrc = img.attr('src');
		

		return posInfo;
	};

	init = function(p, callback) {
		p = p ? p : {};
		
		if (!p.handlerSelector || $(p.handlerSelector).length === 0) {
			return false;
		}

		let targetPic = $(p.handlerSelector + ' > div.move_target > img'),
			moveContainer = $(p.handlerSelector + ' > img');
		
		$box = $(p.handlerSelector + ' > div.move_target');
		$box.css('display', 'block');
		$box.css('top', p.picInfo.top);
		$box.css('left', p.picInfo.left);
		if (p.targetPicUrl) {
			targetPic.attr('src', p.targetPicUrl);
			targetPic.attr('width', p.picInfo.width);
			$box.css('width', p.picInfo.width);
			$box.css('height', p.picInfo.height);
		}
		picLoad(targetPic.attr('src'), function(w, h) {
			$box.unbind();
			$box.mousedown(function(e) {
			    var offset = $(this).offset();
			    this.posix = {
			    	'w': $(this)[0].clientWidth,
			    	'h': $(this)[0].clientHeight,
			    	'x': e.pageX - offset.left,
			    	'y': e.pageY - offset.top
			    };
			    $.extend(document, {
			    	'move': true,
			    	'move_target': this,
			    	'move_container': moveContainer
			    });

			    $box.addClass('zoom');
			}).on('mousedown', '.coor', function(e) {
			    var containerx = {
				    	'w': moveContainer[0].clientWidth,
				    	'h': moveContainer[0].clientHeight
				    },
				    boxPosition = $box.position(),
			    	posix = {
			            'w': $box.width(),
			            'h': $box.height(),
			            'x': e.pageX,
			            'y': e.pageY,
			            'left': boxPosition.left,
			            'top': boxPosition.top
			        };
			    $box.addClass('zoom');
			    $.extend(document, {'move': true, 'call_down': function(e) {
		        	var boxWidth = e.pageX - posix.x + posix.w,
			    		boxHeight = e.pageY - posix.y + posix.h;

			    	boxWidth = (boxWidth + posix.left) > containerx.w ? (containerx.w - posix.left) : boxWidth;
			    	boxHeight = (boxHeight + posix.top) > containerx.h ? (containerx.h - posix.top) : boxHeight;

					boxWidth = Math.max(30, boxWidth);
					boxHeight = Math.max(30, boxHeight);

					var scale = boxWidth / w;

					if (h * scale > boxHeight) {
						scale = boxHeight / h;
					}
					targetPic.attr('width', w * scale);

		        	$box.css({
			            'width': boxWidth,
			            'height': boxHeight
			        });
			    }});
			    $box.parents('.vertical-view-handler').unbind('mouseup').mouseup(function(e) {
					callback(getPosInfo());
				})
			    return false;
			})/*.mouseup(function(e) {
				callback(getPosInfo());
			}).on('mouseup', '.coor', function(e) {
				callback(getPosInfo());
			});*/
		})
	};

	return {
		init: init,
		getPosInfo: getPosInfo
	};
}());