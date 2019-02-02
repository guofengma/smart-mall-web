var FloorDevicePublic = (function(){
	let getDataByKey = function(datas, id, key) {//根据key获取数据中的指定条目,默认id
		key = key ? key : 'id';
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			if (d[key] == id) {
				return d;
			}
		}
		return false;
	};
	return {
		getDataByKey: getDataByKey
	}
})()