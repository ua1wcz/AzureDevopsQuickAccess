function timeIntervalToVerbal(timeInMs) {
	var verbal = {};
	var sec = Math.floor(timeInMs / 1000);
	if (sec < 60) {
		verbal.num = sec;
		verbal.str = "sec";
	} else {
		var min = Math.floor(sec / 60);
		if (min < 60) {
			verbal.num = min;
			verbal.str = "min";
		} else {
			var hour = Math.floor(min / 60);
			if (hour < 24) {
				verbal.num = hour;
				verbal.str = "hour";
			} else
			{
				var day = Math.floor(hour / 24);
				verbal.num = day;
				verbal.str = "day";
			}
		}
	}
	if (verbal.num > 1) {
		verbal.str += "s";
	}
	return verbal.num.toString() + " " + verbal.str;
}
