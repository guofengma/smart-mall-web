var MapSelection = function(params, callback) {
	$.extend(this, params);
	this.value = this.value ? this.value : '成都市OCG国际中心B座';
	var map = new BMap.Map(this.mapId); // 创建Map实例
	var geoc = new BMap.Geocoder();
	var addressEl = document.querySelector(this.root + ' .point-info > span');
	
	this.geocPoint = function(point) {
		$(that.root + ' .coordinate-animate').addClass('c-animating');
		$(that.root + ' .coordinate-animate').unbind('animationend').on('animationend', function(e) {
			$(this).removeClass('c-animating');
		})
		geoc.getLocation(point, function(rs) {
			var addComp = rs.addressComponents;
			var selectionInfo = addComp.province
					+ addComp.city
					+ addComp.district
					+ addComp.street
					+ addComp.streetNumber
					+ (rs.surroundingPois.length > 0 ? rs.surroundingPois[0].title
							: '');
			if (addressEl.innerText !== selectionInfo) {
				if (typeof callback == 'function') {
					addressEl.innerText = selectionInfo;
					addressEl.style.marginLeft = '-'
							+ (addressEl.offsetWidth / 2)
							+ 'px';
					rs.address = selectionInfo;
					callback(rs);
				} else {
					addressEl.innerText = params.value;
					addressEl.style.marginLeft = '-'
							+ (addressEl.offsetWidth / 2)
							+ 'px';
				}
			}
		});
	};
	this.relocate = function(address) {
		geoc.getPoint(address, function(point) {
			if (point) {
				console.info(address, '-', map.getZoom())
				map.centerAndZoom(point, map.getZoom());
				that.geocPoint(point);
			} else {
				layer.msg("您输入的地址没有解析到结果，请准确输入！");
			}
		});
	};
	this.init = function() {
		// 百度地图API功能
		var styleJson = [ {
			"featureType" : "land",
			"elementType" : "all",
			"stylers" : {
				"color" : "#eeeeeeff"
			}
		}, {
			"featureType" : "subway",
			"elementType" : "all",
			"stylers" : {
				"color" : "#6fa8dcff",
				"weight" : "0.1",
				"saturation" : -58
			}
		}, {
			"featureType" : "green",
			"elementType" : "all",
			"stylers" : {
				"color" : "#d9ead3ff"
			}
		}, {
			"featureType" : "water",
			"elementType" : "all",
			"stylers" : {
				"color" : "#cfe2f3ff"
			}
		}, {
			"featureType" : "highway",
			"elementType" : "all",
			"stylers" : {
				"color" : "#f6b26bff",
				"weight" : "0.6"
			}
		} ]
		map.setMapStyle({
			styleJson : styleJson
		});// 添加带有定位的导航控件
		map.setZoom(16);
		that.relocate(that.value);
		map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
		map.addEventListener("zoomend", function(e) {
			that.relocate(that.value);
		});
		if (that.forbidEdit) {
			map.disableDragging();
			return false;
		}

		map.enableDragging();
		var navigationControl = new BMap.NavigationControl({
			// 靠左上角位置
			anchor : BMAP_ANCHOR_TOP_LEFT,
			// LARGE类型
			type : BMAP_NAVIGATION_CONTROL_LARGE,
			// 启用显示定位
			enableGeolocation : true
		});
		map.addControl(navigationControl);
		map.addEventListener("dragend", function(e) {
			var point = map.getCenter();
			map.centerAndZoom(point, map.getZoom());
			that.geocPoint(point);
		});
	};
	var that = this;
	that.init();
};