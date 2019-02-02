var Emin = {};

function exportReport(url, data){
    var param = [];
    
    for (var key in data){
        var value = data[key];
        if (value.constructor == Array){
            value.forEach(function(_value){
                param.push(key + "=" + _value);
            });
        }else{
            param.push(key + '=' + value);
        }
    }
    param.push('ecmName=' + CommonUtil.getHeaders().systemEcmName);
    param.push('ecmId=' + CommonUtil.getHeaders().systemEcmId);
    param.push('token=' + encodeURI(CommonUtil.getHeaders().systemEcmName));
    param = param.join("&");
	if(Emin.downloadFrame == undefined){
		var downloadFrame = document.createElement("iframe")
		downloadFrame.style.display = "none";
		Emin.downloadFrame = downloadFrame;
		document.body.appendChild(Emin.downloadFrame)
	}
	Emin.downloadFrame.src = encodeURI(url + "?" + param);
}

function charLen(val) {
	var l = val.length,
		blen = 0;
	
	for(var i = 0; i < l; i++) {
		if ((val.charCodeAt(i) & 0xff00) != 0) {
			blen ++;
		}
		blen ++;
	}
	return blen;
}