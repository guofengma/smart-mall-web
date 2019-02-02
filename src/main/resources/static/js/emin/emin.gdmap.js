var GaodeMap = function(p, callback) {
	var map = null,
		container = p.container ? p.container : '',
		number = p.number ? p.number : 'GD001',
		geocoder = function(addr) {
		 	var geocoder = new AMap.Geocoder();
		    //地理编码,返回地理编码结果
		    geocoder.getLocation(addr, function(status, result) {
		    	console.dir(status);
		        if (status === 'complete' && result.info === 'OK') {
		            geocoder_CallBack(result);
		        }
		    });
		},
		addMarker = function(i, d) {
		    var marker = new AMap.Marker({
		        map: map,
		        position: [d.location.getLng(), d.location.getLat()]
		    });
		    var infoWindow = new AMap.InfoWindow({
		        content: d.formattedAddress,
		        offset: {
		            x: 0,
		            y: -30
		        }
		    });
		    marker.on("mouseover", function(e) {
		        infoWindow.open(map, marker.getPosition());
		    });
		},
		geocoder_CallBack = function(data) {
			var addrTipStr = "",
		    	geocode = data.geocodes;//地理编码结果数组
		    
		    if (!container) {
		    	layer.open({
					type : 1,
					title : '地图',
					skin : 'layui-layer-rim', //加上边框
					area : [ '60%', '485px' ], //宽高
					content : '<div class="gd-container" id="gaode-map"></div>'
				});
		    	container = 'gaode-map';
		    }
		    	
		    map = new AMap.Map(container, {
	            resizeEnable: true
	        });
		    
		    for (var i = 0; i < geocode.length; i++) {
		        //拼接输出html
		        addrTipStr += "<span style=\"font-size: 12px;padding:0px 0 4px 2px; border-bottom:1px solid #C1FFC1;\">" + "<b>地址</b>：" + geocode[i].formattedAddress + "" + "&nbsp;&nbsp;<b>的地理编码结果是:</b><b>&nbsp;&nbsp;&nbsp;&nbsp;坐标</b>：" + geocode[i].location.getLng() + ", " + geocode[i].location.getLat() + "" + "<b>&nbsp;&nbsp;&nbsp;&nbsp;匹配级别</b>：" + geocode[i].level + "</span>";
		        addMarker(i, geocode[i]);
		    }
		    $('#' + container).parent().append('<div class="gaode-tip" id="' + container + '-tip"></div>');
		    
		    map.setFitView();
		    
		    document.getElementById(container + '-tip').innerHTML = addrTipStr;
		};
		
	if (number == 'GD001' && p.addr) {
		geocoder(p.addr)
	}
};