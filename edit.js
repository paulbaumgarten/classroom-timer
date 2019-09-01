/* jshint strict:global */
/* jshint noempty:false */
/* jshint undef:true */
/* jshint browser:true */
/* jshint -W033 */
/* jshint -W069 */
/* global Howl */

'use strict';

function secondsToTimeString(s) {
	return Math.floor(Number(s/3600)) + ":" + pad(Math.floor(Number((s%3600)/60)));    
}

function hoursMinutesToSeconds(h,m) {
    return (Number(h) * 3600 + Number(m) * 60);
}

function displayAlarmsList(alarms) {
    var htmlElement = document.querySelector("#alarms-list");
    var html = "";
    console.log("alarms = ", alarms);
    if (alarms && alarms[0] && alarms[0][0]) {
        for (var day in alarms) {
            html += "<td>";
            for (var key in alarms[day]) {
                html += secondsToTimeString(alarms[day][key]);
                html += "<button onClick=\"removeAlarm(this);\" data-day=\""+day+"\" data-alarm=\""+alarms[day][key]+"\" class=\"button_remove\"><img src=\"icons8-delete_sign.png\" alt=\"Remove\"></button><br>";
            }
            html += "</td>\n";
        }
    }
    html = "<table><tr><td>Sunday</td><td>Monday</td><td>Tuesday</td><td>Wednesday</td><td>Thursday</td><td>Friday</td><td>Saturday</td></tr><tr>\n" + html + "</tr></table>";
    htmlElement.innerHTML = html;
}

function addAlarm() {
    var newAlarm = document.querySelector("#new-alarm").value;
    if (newAlarm === "") {
        alert("Invalid / incomplete time provided. Please try again.");
    } else {
        console.log("Adding new alarm: ",newAlarm);
        newAlarm = newAlarm.split(":");
        var seconds = hoursMinutesToSeconds(newAlarm[0],newAlarm[1]);
        var alarms = JSON.parse(localStorage.alarms);
        for (var day = 0; day < 7; day++) {
            alarms[day].push(seconds);
            alarms[day] = alarms[day].sort((a,b) => a-b);
        }
        localStorage.alarms = JSON.stringify(alarms);
        displayAlarmsList(alarms);
    }
}

function removeAlarm(e) {
    var removeAlarm = Number(e.dataset.alarm);
    var removeDay = Number(e.dataset.day);
    var alarms = JSON.parse(localStorage.alarms);
    var index = (alarms[removeDay]).indexOf(removeAlarm);
    console.log("Removing alarm: ",index,removeDay,removeAlarm);
    alarms[removeDay].splice(index,1);
    localStorage.alarms = JSON.stringify(alarms);
    displayAlarmsList(alarms);
}

function main() {
    if (localStorage.alarms) {
        var alarms = JSON.parse(localStorage.alarms)
    } else {
        var alarms = [];
        alarms[0] = defaults;        
        alarms[1] = defaults;        
        alarms[2] = defaults;        
        alarms[3] = defaults;        
        alarms[4] = defaults;        
        alarms[5] = defaults;        
        alarms[6] = defaults;   
        localStorage.alarms = JSON.stringify(alarms);
    }
    displayAlarmsList(alarms);
    document.querySelector("#button_add").onclick = addAlarm;
    document.querySelectorAll(".button_remove").onclick = removeAlarm;
}


window.onload = main;

