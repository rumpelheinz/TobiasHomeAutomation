'use strict';
import { Cookies } from "./lib/cookies.js"
// for all options, see the docs

let slider = document.getElementById("myRange");

let mainElem = document.getElementById("main");
let rows = mainElem.querySelectorAll('.row');
var totalheight = 0;
rows.forEach(function (row) {
  totalheight += row.offsetHeight;
  console.log(row.offsetHeight);
});

// document.getElementById("myChart").style.height = mainElem.offsetHeight - totalheight - 40 + 'px';
// console.log(document.getElementById("main").offsetHeight);


// let teststring="Simple mixer control 'Headphone',0\n"+
// "Capabilities: pvolume pvolume-joined pswitch pswitch-joined\n"+
// "Playback channels: Mono\n"+
// "Limits: Playback -10239 - 400\n"+
// "Mono: Playback 266 [95%] [2.66dB] [on]\n"
// console.log(teststring);
// console.log(teststring.search(new RegExp("\\[\\d(\\d*)\\%\\]")));
// console.log(parseInt(teststring.substr(teststring.search(new RegExp("\\[\\d(\\d*)\\%\\]"))+1)));


let musicstats = {
  artist: "",
  title: "",
  elapsed: 0,
  duration: 100,
  playing: false
};

function secondsToHHMMSS(sec_num) {
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = Math.floor(sec_num - hours * 3600 - minutes * 60);

  var h = 0;
  var m = 0;
  var s = 0;
  if (hours < 10) {
    h = "0" + hours;
  }
  if (minutes < 10) {
    m = "0" + minutes;
  }
  if (seconds < 10) {
    s = "0" + seconds;
  }
  return "" + hours + ':' + minutes + ':' + seconds;
}




const logindiv = document.getElementById("loggedin");
console.log(logindiv)
let authorized = false;


function checkCookie() {
  let username = Cookies.getCookie("username");
  let password = Cookies.getCookie("password");
  console.log(username + " " + password);

  if (((username !== "") && (username != undefined)) && ((password !== "") && (password != undefined))) {
    //  alert("Welcome again " + username);
    console.log("logged in as: " + username + " " + password);
    // document.getElementById("login").style.display = "none";

    logindiv.innerText = "Logout";
    logindiv.style.fontSize = "small";
    logindiv.style.backgroundColor = "rgba(0,0,0,0)";
    logindiv.onclick = Cookies.clearCookies;
    document.getElementById("loginForm").style.display = "none";
  }
  else {
    logindiv.onclick = openForm;
    document.getElementById("loginForm").style.display = "none";
    logindiv.style.display = "block";
    document.getElementById("loggedin").innerText = "Login"
    console.log("not authorized");
  }
}

checkCookie();

document.getElementById("loginForm").onkeypress = function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    loginClick();
  }
};

function closeForm() {
  document.getElementById("loginForm").style.display = "none";
  logindiv.onclick = openForm;
}

function openForm() {
  console.log("open")
  document.getElementById("loginForm").style.display = "block";
  logindiv.onclick = closeForm;
}

function loginClick() {
  let usernamediv = document.getElementById("username");
  let passworddiv = document.getElementById("password");
  console.log(usernamediv)
  console.log(usernamediv.value)
  // usernamediv.value="hallooooo"
  Cookies.setCookie("password", passworddiv.value);
  Cookies.setCookie("username", usernamediv.value);
  console.log("login");
  window.history.go(0)
}

const loginbutton = document.getElementById("loginbutton");
const closeformbutton = document.getElementById("closeformbutton");

loginbutton.onclick = loginClick;
closeformbutton.onclick = closeForm;
// console.log(getCookie("password"));
let socket = io("/player", {
  auth: {
    token: "test",
    password: Cookies.getCookie("password"),
    username: Cookies.getCookie("username")
  }
})


// let socket = io.connect('/player' );

socket.on('connect', function () { });
socket.on('connect', function () { });

socket.on('response', function (jsonobj) {
  alert(jsonobj.message);
});
socket.on('authorization', function (jsonobj) {
  if (jsonobj >= 1) {
    console.log("Successfully logged in");
  }
  else {
    if (Cookies.getCookie("password")) {
      (alert("This user does not exist. Contact Tobias to ask for login details. Logout to keep this message from poping up."))
    }
  }
});

socket.on('authorizationerror', function (jsonobj) {
  if (Cookies.getCookie("password")) {

  }
});

socket.on('song', function (song) {
  // document.getElementById('name').innerHTML = song.title + " - " + song.artist;
  document.getElementById('artist').innerHTML = song.artist;
  document.getElementById('song').innerHTML = song.title;
  musicstats.duration = song.duration;
  musicstats.elapsed = song.elapsed;
  musicstats.playing = song.playing;
  musicstats.title = song.duration;
  musicstats.artist = song.duration;
  musicstats.elapsed = song.elapsed;
  lastElapsedUpdate = new Date();

  slider.value = song.elapsed;
  slider.max = song.duration;
  document.getElementById("duration").innerHTML = secondsToHHMMSS(musicstats.elapsed);

  // console.log(document.getElementById("myRange").value + " " + song.elapsed + " " + song.duration)
  document.getElementById('playicon').innerHTML = !song.playing ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
});
socket.on('lamp', function (on) {
  document.getElementById('lampbot').innerHTML = !on ? '<i class="far fa-lightbulb"></i>' : '<i class="fas fa-lightbulb"></i>';
  // document.getElementById('lightbulb').innerHTML = !on ? '<i class="far fa-lightbulb"></i>' : '<i class="fas fa-lightbulb"></i>';
});

socket.on('socket', function (on) {
  document.getElementById('socketbutton').style = on ? 'color:white' : 'color:black';
});
let lastElapsedUpdate = new Date();
setInterval(function () {
  let newTime = new Date();
  if (musicstats.playing) {
    musicstats.elapsed += (newTime - lastElapsedUpdate) / 1000.0;
    slider.value = musicstats.elapsed;
    document.getElementById("duration").innerHTML = secondsToHHMMSS(musicstats.elapsed);;
    // console.log(musicstats.elapsed);
  }
  lastElapsedUpdate = newTime;
}, 100);

let temp = [];
let hum = [];
let time = [];
let ctx = document.getElementById("myChart").getContext('2d');




socket.on('weather', function (jsonobj) {
  for (var i in jsonobj) {
    var mydate = new Date(jsonobj[i].time);
    // console.log(mydate)
    mydate.setSeconds(0, 0);
    // console.log(mydate)
    temp.push(jsonobj[i].temp);
    hum.push(jsonobj[i].hum);
    time.push(mydate);
  }
  makechart();
});


socket.on('newweather', function (jsonobj) {
  var mydate = new Date(jsonobj.time);
  mydate.setSeconds(0, 0);
  temp.push(jsonobj.temp);
  hum.push(jsonobj.hum);
  time.push(mydate);
  makechart();
});

function makechart() {
  myChart.destroy();
  var ctx = document.getElementById("myChart").getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: time,

      datasets: [{
        label: "Humidity",
        yAxisID: "Humidity",
        data: hum,
        fill: false,
        borderWidth: 2,
        borderColor: 'blue'
      }, {
        label: "Temperature",
        yAxisID: "Temperature",
        data: temp,
        fill: false,
        borderWidth: 2,
        borderColor: 'red'
      }]
    },
    options: {
      maintainAspectRatio: false,
      elements: { point: { radius: 1 } },
      animation: false,
      showTooltips: true,
      responsive: true,
      legend: {
        display: true
      },
      scales: {
        yAxes: [{
          id: "Humidity",
          ticks: {
            beginAtZero: true
          }
        },
        {
          id: "Temperature",
          ticks: {
            beginAtZero: true
          }
        },

        ],

        xAxes: [{
          type: 'time',
          time: {
            unit: 'day',
            unitStepSize: 1,
            displayFormats: {
              'millisecond': 'HH:mm',
              'second': 'HH:mm',
              'minute': 'HH:mm',
              'hour': 'HH:mm',
              'day': 'HH:mm',
              'week': 'HH:mm',
              'month': 'HH:mm',
              'quarter': 'HH:mm',
              'year': 'HH:mm'
            }
          },
          ticks: {
            suggestedMax: 100
          }
        }]
      }
    }

  });
}



var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: time,

    datasets: [{
      data: hum,
      fill: false,
      borderWidth: 2,
      borderColor: 'blue'
    }, {
      data: temp,
      fill: false,
      borderWidth: 2,
      borderColor: 'red'
    }]
  },
  options: {
    maintainAspectRatio: false,
    elements: { point: { radius: 0 } },
    animation: false,
    showTooltips: false,
    responsive: true,
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          fontSize: 40,
          fontStyle: "bold"
        }
      }],

      xAxes: [{
        type: 'time',
        time: {
          unit: 'minute',
          unitStepSize: 1,
          displayFormats: {
            'millisecond': 'hh:mm',
            'second': 'hh:mm',
            'minute': 'hh:mm',
            'hour': 'hh:mm',
            'day': 'hh:mm',
            'week': 'hh:mm',
            'month': 'hh:mm',
            'quarter': 'hh:mm',
            'year': 'hh:mm'
          }
        },
        ticks: {
          suggestedMax: 100,
          fontSize: 40
        }
      }]
    }
  }

});

function toggle() {
  socket.emit("toggle");
}
function lower() {
  socket.emit("lower");
}
function louder() {
  socket.emit("louder");
}
function mute() {
  socket.emit("mute");
}
function previous() {
  socket.emit("previous");
}
function play() {
  socket.emit("play");
  console.log("play");
}
function next() {
  socket.emit("next");
}
function togglesocket(number) {
  socket.emit("togglesocket", { number: number });
}

window.toggle = toggle;
window.lower = lower;
window.louder = louder;
window.previous = previous;
window.play = play;
window.next = next;
window.mute = mute;
window.togglesocket = togglesocket;

