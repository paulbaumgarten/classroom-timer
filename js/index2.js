/* jshint strict:global */
/* jshint noempty:false */
/* jshint undef:true */
/* jshint browser:true */
/* jshint -W033 */
/* jshint -W069 */
/* global Howl */

'use strict';

/* Colours */
const BACKGROUND = "#212121";
const WARNING1 = "#dd8304";
const WARNING2 = "#dd0404";
const FOREGROUND = "#ffffff";
const DAY_OVER_FOREGROUND = "#515151";

let lastChime = -1; 
let chimesEnabled = true;
let mode = "timer";

let alarms = [];
let labels = [];

/***** UTILITY FUNCTIONS *****/

function pad( n ) {
	var s = n.toString();
	while (s.length < 2) {
	   s = "0" + s;
	}
	return(s);
}

function playChime( soundFile ) {
    if (chimesEnabled) {
        var sound = new Howl({ src: [ soundFile ] });
        sound.play();
    }
}

function secondsToTimeString(s) {
	return Math.floor(Number(s/3600)) + ":" + pad(Math.floor(Number((s%3600)/60)));    
}

function hoursMinutesToSeconds(h,m) {
    return (Number(h) * 3600 + Number(m) * 60);
}

function getTimeNowObject() {
	var now = new Date();
	var res = {};
	res.year = now.getFullYear();
	res.month = now.getMonth() + 1;
	res.day = now.getDate();
	res.hour = now.getHours();
	res.minute = now.getMinutes();
	res.second = now.getSeconds();
	res.dayOfWeek = now.getDay();
	res.secondsOfDay = res.second + res.minute*60 + res.hour*3600;
	return (res);
}

function getTodayDateString() {
	let today = new Date();
	let daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let dateString = pad(today.getDate())+"."+pad(today.getMonth()+1)+"."+(today.getYear()-100);
	return dateString;
}

/***** MAIN TIMER FUNCTIONS *****/

function displayCountdown(current_alarm_seconds_remaining, current_alarm_time) {
	var sCountDownTime = Math.floor(Number(current_alarm_seconds_remaining/60)) + ":" + pad(Math.floor(Number(current_alarm_seconds_remaining%60)));
	var sAlarmTime = Math.floor(Number(current_alarm_time/3600)) + ":" + pad(Math.floor(Number((current_alarm_time%3600)/60))) + ":" + pad(Math.floor(Number(current_alarm_time%60)));
	var now = getTimeNowObject();
	var sTimeNow = pad(now.hour) + ":" + pad(now.minute) + ":" + pad(now.second);
	if (current_alarm_seconds_remaining < 180) {
		document.body.style.backgroundColor = WARNING2;
		if (lastChime !== current_alarm_time) {
			playChime("media/chime.mp3");
			lastChime = current_alarm_time;
		}
	} else if (current_alarm_seconds_remaining < 360) {
		document.body.style.backgroundColor = WARNING1;
	} else {
		document.body.style.backgroundColor = BACKGROUND;
	}
    document.querySelector(".main").style.color = FOREGROUND;
	document.querySelector(".main").innerHTML = sCountDownTime;
	document.querySelector(".current_time").innerHTML = sTimeNow;
	document.querySelector(".current_date").innerHTML = getTodayDateString();
	document.querySelector(".next_alarm").innerHTML = sAlarmTime;
}

function displayTime() {
	var now = getTimeNowObject();
	var sTimeNow = pad(now.hour) + ":" + pad(now.minute);
    document.body.style.backgroundColor = BACKGROUND;
	document.querySelector(".main").innerHTML = sTimeNow;
    document.querySelector(".main").style.color = DAY_OVER_FOREGROUND;
	document.querySelector(".current_time").innerHTML = sTimeNow;
	document.querySelector(".current_date").innerHTML = getTodayDateString();
	document.querySelector(".next_alarm").innerHTML = "--:--";
}

function interval() {
	var now = getTimeNowObject();
	let alarm_count_today = alarms[now.dayOfWeek].length;
	let is_day_over = now.secondsOfDay > alarms[now.dayOfWeek][alarm_count_today-1];
	let is_day_started = now.secondsOfDay > (alarms[now.dayOfWeek][0] - 3600);
	if (is_day_over) {
		/* Day past the last alarm, show clock */
		console.log("_is_day_over");
		displayTime();
	} else if (! is_day_started) {
		/* Over an hour until first alarm, show clock */
		console.log("! is_day_started");
		displayTime();
	} else {
		/* Show countdown to next alarm */
		let current_alarm_key = 0;
		for (var index in alarms[now.dayOfWeek]) {
			if (alarms[now.dayOfWeek][index] < now.secondsOfDay) {
				current_alarm_key = Number(index)+1;
			}
		}
		// What time are we currently in countdown to?
		let current_alarm_time = alarms[now.dayOfWeek][current_alarm_key];
		let current_alarm_seconds_remaining = current_alarm_time - now.secondsOfDay;
		displayCountdown(current_alarm_seconds_remaining, current_alarm_time);
	}
}

function importTimes(data) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            timeInSeconds = key.split(":")[0] * 3600 + key.split(":")[1] * 60
            console.log(key, data[key]);
        }
    }    
}


/***** MAIN() *****/

function myapp() {
	document.documentElement.style.overflow = 'hidden';
	setInterval( interval, 100 );

    alarms = importTimes(times)
    console.log("alarms are",alarms);
}

window.onload = myapp;

