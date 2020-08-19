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

//       8:25  8:45  9:30  10:05 10:50 11:15 11:55 12:35 13:35 14:20 14:55 15:40 17:00
let presets = [
	{
		"school": "International School of Lausanne, Switzerland",
		"times": [
			[],
			[30300,31500,34200,36300,39000,40500,42900,45300,48900,51600,53700,56400,61200],
			[30300,31500,34200,36300,39000,40500,42900,45300,48900,51600,53700,56400,61200],
			[30300,31500,34200,36300,39000,40500,42900,45300,48900,51600,53700,56400,61200],
			[30300,31500,34200,36300,39000,40500,42900,45300,48900,51600,53700,56400,61200],
			[30300,31500,34200,36300,39000,40500,42900,45300,48900,51600,53700,56400,61200],
			[]
		]
	},
	{
		"school": "Sha Tin College (2019), Hong Kong",
		"times": [
			[],
			[8*3600+5*60,8*3600+15*60,8*3600+35*60,9*3600+43*60,10*3600+50*60,11*3600+15*60,12*3600+18*60,13*3600+10*60,14*3600+13*60,15*3600+20*60],
			[8*3600+5*60,8*3600+15*60,8*3600+35*60,9*3600+43*60,10*3600+50*60,11*3600+15*60,12*3600+18*60,13*3600+10*60,14*3600+13*60,15*3600+20*60],
			[8*3600+5*60,8*3600+15*60,8*3600+35*60,9*3600+43*60,10*3600+50*60,11*3600+15*60,12*3600+18*60,13*3600+10*60,14*3600+13*60,15*3600+20*60],
			[8*3600+5*60,8*3600+15*60,8*3600+35*60,9*3600+43*60,10*3600+50*60,11*3600+15*60,12*3600+18*60,13*3600+10*60,14*3600+13*60,15*3600+20*60],
			[8*3600+5*60,8*3600+15*60,8*3600+35*60,9*3600+43*60,10*3600+50*60,11*3600+15*60,12*3600+18*60,13*3600+10*60,14*3600+13*60,15*3600+20*60],
			[]
		]
	},
	{
		"school": "Sha Tin College (2020 truncated), Hong Kong",
		"times": [
			[],
			[8*3600+15*60,8*3600+30*60,9*3600+10*60,9*3600+55*60,10*3600+25*60,11*3600+5*60,11*3600+50*60,12*3600+20*60,13*3600+0*60],
			[8*3600+15*60,8*3600+30*60,9*3600+10*60,9*3600+55*60,10*3600+25*60,11*3600+5*60,11*3600+50*60,12*3600+20*60,13*3600+0*60],
			[8*3600+15*60,8*3600+30*60,9*3600+10*60,9*3600+55*60,10*3600+25*60,11*3600+5*60,11*3600+50*60,12*3600+20*60,13*3600+0*60],
			[8*3600+15*60,8*3600+30*60,9*3600+10*60,9*3600+55*60,10*3600+25*60,11*3600+5*60,11*3600+50*60,12*3600+20*60,13*3600+0*60],
			[8*3600+15*60,8*3600+30*60,9*3600+10*60,9*3600+55*60,10*3600+25*60,11*3600+5*60,11*3600+50*60,12*3600+20*60,13*3600+0*60],
			[]
		]
	}
];

let alarms = [
	[], [], [], [], [], [], []
];

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

/***** EDIT MODE FUNCTIONS *****/

function removeAlarm(e) {
    var removeAlarm = Number(e.dataset.alarm);
    var removeDay = Number(e.dataset.day);
    var index = (alarms[removeDay]).indexOf(removeAlarm);
    console.log("Removing alarm: ",index,removeDay,removeAlarm);
    alarms[removeDay].splice(index,1);
    localStorage.alarms = JSON.stringify(alarms);
    displayEditDetails();
}

function insertAlarm() {
    var newAlarm = document.querySelector("#new-alarm").value;
    if (newAlarm === "") {
        alert("Invalid / incomplete time provided. Please try again.");
    } else {
        console.log("Adding new alarm: ",newAlarm);
        newAlarm = newAlarm.split(":");
        var seconds = hoursMinutesToSeconds(newAlarm[0],newAlarm[1]);
        for (var day = 0; day < 7; day++) {
            alarms[day].push(seconds);
            alarms[day] = alarms[day].sort((a,b) => a-b);
        }
        localStorage.alarms = JSON.stringify(alarms);
        displayEditDetails();
    }
}

function importPreset(e) {
	let preset_id = Number(e.dataset.presetid);
	console.log("[importPreset] ",preset_id);
	alarms = presets[preset_id]["times"];
	displayEditDetails();
	localStorage.alarms = JSON.stringify(alarms);
}

function displayEditDetails() {
	let html = "";
	for (let day = 0; day < 7; day++) {
		html += "      <td>";
		for (let key = 0; key<alarms[day].length; key++) {
			html += "         "+String(secondsToTimeString(alarms[day][key]));
			html += "<button onClick=\"removeAlarm(this);\" data-day=\""+day+"\" data-alarm=\""+alarms[day][key]+"\" class=\"button_remove\"><img src=\"img/icons8-delete_sign.png\" alt=\"Remove\"></button><br>\n";
		}
		html += "      </td>";
	}
	let html_wrapper = "<table>\n";
	html_wrapper += "   <tr><td>Sunday</td><td>Monday</td><td>Tuesday</td><td>Wednesday</td><td>Thursday</td><td>Friday</td><td>Saturday</td></tr>\n";
	html_wrapper += "   <tr>\n";
	html_wrapper += html;
	html_wrapper += "   </tr>\n";
	html_wrapper += "</table>";
    document.querySelector("#alarms-list").innerHTML = html_wrapper;
	// Generate presets list
	html = "";
	for (let i=0; i<presets.length; i++) {
		html += "<button type='button' onClick=\"importPreset(this);\" class='import_preset' data-presetid='"+String(i)+"' data-school='"+presets[i]["school"]+"'>"+presets[i]["school"]+"</button><br>\n";
	}
    document.querySelector("#presets").innerHTML = html;
    document.querySelector("#button_add").onclick = insertAlarm;
	document.querySelectorAll(".button_remove").onclick = removeAlarm;
	document.querySelectorAll(".import_preset").onclick = importPreset;
	console.log("displayEditDetails done")
}

function displayEditMode(activate) {
	console.log("Settings edit mode to ",activate);
	if (activate) {
		document.documentElement.style.overflow = 'visible';
		document.querySelector(".main-container").style.display = "none";
		document.querySelector(".edit-container").style.display = "block";
		displayEditDetails();
	} else {
		document.documentElement.style.overflow = 'hidden';
		document.querySelector(".main-container").style.display = "grid";
		document.querySelector(".edit-container").style.display = "none";
	}
}

/***** MAIN() *****/

function myapp() {
	document.documentElement.style.overflow = 'hidden';
	document.querySelector("#edit_button").addEventListener("click", function(e) {displayEditMode(true); });
	document.querySelector("#save_button").addEventListener("click", function(e) {displayEditMode(false); });

	setInterval( interval, 100 );

	if (localStorage.alarms) {
		alarms = JSON.parse(localStorage.alarms)
		console.log("alarms are",alarms);
	} else {
		displayEditMode(true);
	}
}

window.onload = myapp;

