import { Socket } from "socket.io";
import { logtest } from "./Musicplayer";
logtest();
console.log("started4");
// Setup basic express server
import express from 'express';
const app = express();
const server = require('http').createServer(app);
// const ks = require('node-key-sender')
//var io = require('../..')(server);
const io = require('socket.io')(server);
const port = process.env.PORT || 61000;
let on = false;
import bodyParser from "body-parser";
import subprocess from 'child_process';


import nconf from 'nconf';
nconf.use('file', { file: './config.json' });
nconf.load();


// var lockersocket;
import SerialPort from 'serialport';
const Readline = SerialPort.parsers.Readline;
const parser = new Readline({ delimiter: '\r\n' });
import path from 'path';
import mysql from 'mysql';

let con = mysql.createConnection({
	host: nconf.get("mysql").host,
	user: nconf.get("mysql").user,
	password: nconf.get("mysql").password,
	database: nconf.get("mysql").database
});


// const MPC = require('mpc-js').MPC;
// const mpc = new MPC();

import { MPC } from 'mpc-js';
const mpc = new MPC();

function save() {
	nconf.save(function (err: { message: any; }) {
		if (err) {
			console.error(err.message);
			return;
		}
		console.log('Configuration saved successfully.');
	});
}

interface MusicStats {
	artist: string | undefined;
	title: string | undefined;
	playing: boolean;
	duration: number | undefined;
	elapsed: number | undefined;
}

const musicstats: MusicStats = {
	artist: "",
	title: "",
	playing: false,
	duration: 0,
	elapsed: 0,
};



let datapoints: any[] = [];
let minute = new Date();
let tempthisminute: any[] = [];
var humiditythisminute: any[] = [];


console.log("ports")
SerialPort.list().then(
	ports => ports.forEach(/*console.log*/
		(port) => {
			console.log(port.path);

		}
	),
	err => console.error(err)
)

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

app.use('/js', express.static(__dirname + '/../public/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/../node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/../node_modules/gpxparser/dist/')); // redirect JS jQuery

app.use('/css', express.static(__dirname + '/../public/css')); // redirect CSS bootstra
app.use('/public', express.static(__dirname + '/../public')); // redirect CSS bootstra
app.use('/Readme', express.static(__dirname + '/../Readme')); // redirect CSS bootstra
app.use('/tiles', express.static(__dirname + '/../Lantmateriets-Fjallkarta/tiles')); // redirect CSS bootstra
// Routing
//app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(__dirname + '/../public'));
app.get('/player', function (req, res) {
	res.sendFile(path.join(__dirname + '/../public/MusicPlayer.html'));
});
app.get('/readme', function (req, res) {
	res.sendFile(path.join(__dirname + '/../README.md'));
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const playersocket = io.of('/player');
// journalctlsocket = io.of('/journalctl');
// spotifysocket = io.of('/spotify');
// lockersocket = io.of('/locker');
const terminalsocket = io.of('/terminal');

con.connect(function (err) {
	if (err) console.log(err);
});

import fs from 'fs';
const backgroundimages: string[] = []
fs.readdir("./public/images/backgrounds", (err, files) => {
	files.forEach(file => {
		backgroundimages.push(file);
		// console.log(file);
	});
});
app.get('/backgroundimage', function (req, res) {

	res.sendFile(path.join(__dirname + '/../public/images/backgrounds/' + backgroundimages[Math.floor(Math.random() * backgroundimages.length)]));
});

app.post('/login', function (req, res) {

	// var data = JSON.parse(req);
	// stephistory = JSON.parse(req);
	console.log(req);
	// console.log(JSON.parse(req.body.PostData));
	res.send("hello");
	res.end();
});

const androidSendStepsRoute=nconf.get("StepRoute");
if (!androidSendStepsRoute){
	throw new Error('"StepRoute" is not set in nconf');
}
app.post(androidSendStepsRoute, function (req, res) {
	console.log("Inserting steps! ${} bytes", req.body.PostData.length);
	// console.log(JSON.stringify(req.body));
	var data = JSON.parse(req.body.PostData);
	//stephistory=req.body.PostData
	let stephistory = JSON.parse(req.body.PostData);
	// console.log(JSON.parse(req.body.PostData));
	res.send("hello");
	res.end();

	console.log("Connected!");
	let mystring = "INSERT INTO steps (datum, steps, name ) VALUES  ";
	for (let i = 0; i < stephistory.steps.length; i++) {
		let elem = stephistory.steps[i];
		console.log(elem);
		if (i != 0) {
			mystring += ","
		}
		console.log(stephistory.steps[i].name)
		mystring += "(" + con.escape(elem.Day) + "," + con.escape(elem.Steps) + "," + con.escape(stephistory.user_name) + ")";
	}
	mystring += " ON DUPLICATE KEY UPDATE steps= GREATEST(steps,VALUES(steps));";
	console.log(mystring);
	// console.log(mystring);
	con.query(mystring, function (err, result) {
		if (err) throw err;
		console.log(result.legth + " values inserted" + result);
		con.query("insert into updates (name) values (" + con.escape(stephistory.user_name) + ");",
			function (err, result) {
				if (err) throw err;
				console.log("updated " + stephistory.user_name);
			});
	});
});


app.get('/stepcounts', function (req, res) {
	let mystring = " Select DATE_FORMAT(datum, '%Y-%m-%d') as Day, steps as Steps , name as name from steps ORDER BY datum desc;";
	con.query(mystring, function (err, result) {
		if (err) throw err;
		// console.log(result);
		let steps = result;
		mystring = " Select max(time) as time,name from updates group by name ORDER BY time desc; ";
		con.query(mystring, function (err, result) {
			if (err) throw err;
			// console.log(result);
			// console.log("/stepcounts Sending ", result.length);
			res.send({ steps: steps, updates: result });
		});
	});
});


let num = 0;
let InfoHubPort: SerialPort | undefined;

function connectPort(name: string, num: number): SerialPort | undefined {
	console.log(name + '' + num)
	InfoHubPort = new SerialPort(name + '' + num, {
		baudRate: 9600
	}, (err) => {
		if (err) {
			console.log('Error: ', err.message);
			if (num < 10) {
				num++;
				InfoHubPort = connectPort(name, num);
				return InfoHubPort;
			} else {
				InfoHubPort = undefined;
				return InfoHubPort;
			}
		} else {
			console.log("Success " + InfoHubPort);
			return undefined;
		}
	})
	InfoHubPort.pipe(parser)
	return InfoHubPort;
}
InfoHubPort = connectPort('/dev/ttyACM', num);



function parseAmixerVolume(stdout: string) {
	let pos = stdout.search(new RegExp("\\[\\d(\\d*)\\%\\]")) + 1;
	let firstsubstr = stdout.substr(pos);
	let volume = parseInt(firstsubstr)
	console.log(volume);
}
function next() {
	console.log('next');
	// ks.sendCombination(['control', 'f8']);
	subprocess.exec(" mpc --port=6610 --h=localhost next");
}

var lower = function () {
	console.log('lower');
	subprocess.exec("amixer -M  sset 'Headphone' 5%-", (err, stdout, stderr) => {
		if (err) {
			console.error(`amixer error: ${err}`);
			return;
		}
		parseAmixerVolume(stdout);
	});

	// ks.sendCombination(['control', 'f2'])
}
var louder = function () {
	console.log('louder');
	// ks.sendCombination(['control', 'f3']);
	subprocess.exec("amixer -M  sset 'Headphone' 5%+", (err, stdout, stderr) => {
		if (err) {
			console.error(`amixer error: ${err}`);
			return;
		}
		parseAmixerVolume(stdout);
	});
}
var mute = function () {
	console.log('mute');
	// ks.sendCombination(['control', 'f4']);
	subprocess.exec("amixer -M  sset 'Headphone' toggle", (err, stdout, stderr) => {
		if (err) {
			console.error(`amixer error: ${err}`);
			return;
		}
		parseAmixerVolume(stdout);
	});
}
var previous = function () {
	console.log('previous');
	// ks.sendCombination(['control', 'f6'])
	subprocess.exec(" mpc --port=6610 --h=localhost prev");
}
function play() {
	console.log('play');
	// ks.sendCombination(['control', 'f7']);
	subprocess.exec(" mpc --port=6610 --h=localhost toggle");
}
function getLight() {
	// console.log(nconf.get("lampstate"));
	return nconf.get("lampstate");
}
function getsocket(number: number) {
	// console.log(nconf.get("lampstate"));
	return nconf.get("socket");
}
function setLight(on: boolean, shouldSave: boolean, shouldWrite: boolean) {
	if (on) {
		if (shouldWrite)
			InfoHubPort?.write("lightOn\n");
		nconf.set("lampstate", true);
	}
	else {
		if (shouldWrite)
			InfoHubPort?.write("lightOff\n");
		nconf.set("lampstate", false);
	}
	playersocket.emit("lamp", on)
	if (shouldSave) {
		save();
	}
}

function setSocket(number: number, on: boolean, shouldSave: boolean, shouldWrite: boolean) {
	console.log("setSocket " + number + " " + on);
	if (shouldWrite)
		InfoHubPort?.write("socket " + number + " " + (on ? "1" : "0") + "\n");
	nconf.set("socket", on);

	playersocket.emit("socket", on)
	if (shouldSave) {
		save();
	}
}



function toggle() {
	// console.log(getLight())
	if (getLight()) {
		setLight(false, false, true);
	}
	else {
		setLight(true, false, true);
	}
}
function togglesocket(number: number) {
	console.log("togglesocket " + number);
	if (getsocket(number)) {
		setSocket(number, false, false, true);
	}
	else {
		setSocket(number, true, false, true);
	}
}

// function locktoggle() {
// 	console.log('locktoggle');
// 	lockersocket.emit('locktoggle', ' ');
// }

// app.get('/play', function (req, res) {
// 	play()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });
// app.get('/next', function (req, res) {
// 	next()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });
// app.get('/previous', function (req, res) {
// 	previous()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });
// app.get('/lower', function (req, res) {
// 	lower()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });
// app.get('/louder', function (req, res) {
// 	louder()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });
// app.get('/mute', function (req, res) {
// 	mute()
// 	res.sendFile(path.join(__dirname + '/public/mediacontrolls.html'));
// });


{
	let mystring = " Select datum, humidity as humidity, temp as temp  from humiditytemp where (`Datum` > DATE_SUB(now(), INTERVAL 7 DAY)) ORDER BY datum asc;";
	con.query(mystring, function (err, result) {
		if (err) throw err;
		console.log("SQL humiditytempresults: ", result.length)
		for (let row in result) {
			datapoints.push({
				time: new Date(result[row].datum),
				hum: result[row].humidity,
				temp: result[row].temp
			})
		}
	});
}

// const Journalctl = require('journalctl');
// // const journalctl = new Journalctl({ all: true });

// journalctlsocket.on('connection', function (socket) {
// 	// console.log()
// });
// journalctl.on('event', (event) => { journalctlsocket.emit("update", event); });




const seriallog: Buffer[] = [];
// Read data that is available but keep the stream from entering "flowing mode"
// function setReadable() {
InfoHubPort?.on("open", function () {
	console.log("connected to Arduino")
	InfoHubPort?.on("data", (data: Buffer) => {
		// console.log(new String(data))
		seriallog.push(data)
		if (seriallog.length > 100) {
			seriallog.shift();
		}
		terminalsocket.emit("received", "" + data);
	})
	if (InfoHubPort != null)
		parser.on('data', function (data) {
			const split = (data).split(' ')

			console.log("Arduino: " + split);
			if (split[0] == 'Humidity:') {
				humiditythisminute.push(parseFloat(split[1]))
				tempthisminute.push(parseFloat(split[4]))
				// console.log(humiditythisminute[tempthisminute.length - 1])
				// console.log(tempthisminute[tempthisminute.length - 1])
				let curDate = new Date()
				if (tempthisminute.length > 10 && humiditythisminute.length > 10 && Math.floor(curDate.getMinutes() / 15) != Math.floor(minute.getMinutes() / 15)) {

					let summa = 0;
					let summ = 0;
					console.log(tempthisminute)
					console.log(humiditythisminute)
					for (var i in tempthisminute) {
						summ += tempthisminute[i];
					}

					for (var i in humiditythisminute) {
						summa += humiditythisminute[i];
					}

					console.log(" ", summa, summ)
					let time = minute;
					let temp = summ / tempthisminute.length;
					let hum = summa / humiditythisminute.length;
					datapoints.push({
						time: time,
						temp: temp,
						hum: hum
					})

					{
						// console.log("date ${} temp${} hum ${}", time, temp, hum);
						let mystring = "INSERT IGNORE INTO humiditytemp (datum, humidity, temp ) VALUES  ";

						mystring += "( FROM_UNIXTIME(" + Math.floor((new Date()).valueOf() * 0.001) + "), " + hum + "," + temp + ");";
						// console.log(mystring);
						con.query(mystring, function (err, result) {
							if (err) throw err;
							// console.log(result);
							// console.log(result.length);
							// console.log(" values inserted");
						});
					}
					tempthisminute = []
					humiditythisminute = []
					// console.log(datapoints)
					minute = new Date()
					playersocket.emit('newweather', {
						time: time,
						temp: temp,
						hum: hum
					});
					if (datapoints.length > 2 * 24 * 7) {
						datapoints.shift()
					}
				}
				//  var ret={temp: split[1]}
				//  playersocket.emit('weather',datapoints);
			}
			// console.log('Data:', data);
			if (split[0] === 'turned' && split.length > 1) {
				if (split[1] == "off") {
					setLight(false, true, false);
				}
				else {
					setLight(true, true, false);
				}
			}
			if (split[0] == "START") {
				setLight(getLight(), false, false);
				// InfoHubPort.write("art " + musicstats.artist + "\nsong " + musicstats.title + "\n");
			}
			if (split[0] === "Got:" && split.length > 1) {
				if (split[1] == "'lightOff'") {
					setLight(false, true, false);
				}
				if (split[1] == "'lightOn'") {
					setLight(true, true, false);
				}
			}


			if (data == 'volumeUp')
				louder()
			if (data == 'volumeDown')
				lower()
			if (data == 'previousSong')
				previous()
			if (data == 'pauseToggle')
				play()
			if (data == 'nextSong')
				next()
			// if (data == 'g\r')
			// 	toggle()
			// if (data == 'f\r')
			// 	toggle()
			// if (data == 'h\r')
			// 	toggle()
		});
})


on = true;

function checkMPCStatus() {
	mpc.status.status().then(status => {
		console.log("changedplayer")
		console.log(status)
		if (status.state == 'play') {
			mpc.status.currentSong().then(song => {
				// console.log(`Playing `, song);
				musicstats.playing = true;
				musicstats.artist = song.artist
				musicstats.title = song.title;
				musicstats.duration = song.duration;
				musicstats.elapsed = status.elapsed;
				playersocket.emit('song', musicstats);
				InfoHubPort?.write("art " + musicstats.artist + "\nsong " + musicstats.title + "\n");

			})
		}
		else {
			mpc.status.currentSong().then(song => {
				// console.log(`not playing `, song);
				musicstats.playing = false;
				musicstats.artist = song?.artist
				musicstats.title = song?.title;
				musicstats.duration = song?.duration;
				musicstats.elapsed = status?.elapsed;
				playersocket.emit('song', musicstats);
				InfoHubPort?.write("art " + musicstats.artist + "\nsong " + musicstats.title + "\n");
			})
		}
	})
}

mpc.connectTCP("localhost", 6610).then(() => {
	console.log("connected to mpc");
	mpc.playbackOptions.setRandom(true);
	mpc.playbackOptions.setRepeat(true);
	mpc.currentPlaylist.playlistInfo().then((info) => {
		if (info.length == 0) {
			mpc.storedPlaylists.listPlaylists().then((info2) => {
				console.log("Playlists:");
				console.log(info2);
				let favouriteplaylist = info2.find((entry) => {return entry.name == "concentrate"});
				if (favouriteplaylist)
					mpc.storedPlaylists.load(favouriteplaylist.name);
				else
					mpc.storedPlaylists.load(info2[0].name);
			})
		}
		console.log(info);
	});
	checkMPCStatus();
}).catch((err) => { throw err });

mpc.on('changed-player', (e) => {
	checkMPCStatus();
});


setInterval(
	function () {
		if (musicstats.playing) {
			if (musicstats.elapsed) musicstats.elapsed += 1;
		}
	},
	1000);

terminalsocket.on('connection', function (socket: Socket) {
	for (let i in seriallog) {
		socket.emit("received", "" + seriallog[i]);
	}
	socket.emit("authorization", authorization(socket));

	socket.on('send', function (jsonobj) {
		console.log(jsonobj)
		if (authorization(socket) > 0) {
			InfoHubPort?.write("" + jsonobj + "\n");
		}
		else {
			socket.emit("authorization", 0);
		}
	})
})

function authorization(socket: Socket) {
	// return true;
	if (!socket.handshake) { console.error("No handshake"); return 0; }
	if (!socket.handshake.auth) {
		console.error("no auth"); return 0;
	}
	if (!socket.handshake.auth.password) { console.error("no token"); return 0; }
	if (socket.handshake.auth.password === nconf.get("password")) {
		return 1;
	}
	else {
		console.log("wrong password");
		return 0;
	}
}
// const https=require('https');
// function getIp(ip){
// 	https.get('https://ipapi.co/'+ip+'/json/', function(resp){
// 		let body = ''
// 		resp.on('data', function(data){
// 			body += data;
// 		});

// 		resp.on('end', function(){
// 			let loc = JSON.parse(body);
// 			console.log(loc);
// 		});
// 	});
// };

playersocket.on('connection', function (socket: Socket) {
	var agent = socket.handshake.headers['user-agent'];
	let tmpAddress = socket.handshake.headers["x-forwarded-for"];
	let address: undefined | string;
	if (tmpAddress && (tmpAddress instanceof String)) {
		address = tmpAddress.split(",")[0];
	}
	else {
		address = tmpAddress?.[0].split(",")[0];
	}

	console.log(address);
	// getIp(address);

	console.log("Io Connection from (Name: " + socket.handshake.auth?.username + " , PSW:" + socket.handshake.auth?.password + " " + authorization(socket) + ")\nAgent "+agent);
	socket.emit("authorization", authorization(socket));
	socket.emit('song', musicstats);
	socket.emit('weather', datapoints);
	socket.emit('lamp', getLight());
	socket.emit("socket", nconf.get("socket"))

	socket.on('disconnect', function () {
		socket.emit('IO disconnected ' + agent);
	});

	socket.on('lower', function (jsonobj) {
		if (authorization(socket) > 0) {
			lower()
		}
		else {
			socket.emit("authorization", authorization(socket));
		}
	})
	socket.on('louder', function (jsonobj) {
		if (authorization(socket) > 0) {
			louder()
		}
		else {
			socket.emit("authorization", authorization(socket));
		}
	})
	socket.on('mute', function (jsonobj) {
		if (authorization(socket) > 0) {


			mute()
		}
		else {
			socket.emit("authorization", authorization(socket));
		}
	})
	socket.on('previous', function (jsonobj) {
		if (authorization(socket) > 0) {

			previous()
		}
		else {
			socket.emit("authorization", authorization(socket));
		}
	})
	socket.on('play', function (jsonobj) {
		console.log("play");
		// console.log(socket);
		if (authorization(socket) > 0) {

			play()
		}
		else {
			socket.emit("authorization", authorization(socket));
			
		}
	})
	socket.on('next', function (jsonobj) {
		if (authorization(socket) > 0) {

			next()
		}
		else {
			socket.emit("authorization", authorization(socket));
		}
	})
	socket.on('toggle',
		function (jsonobj) {
			if (authorization(socket) > 0) {
				toggle()
			}
			else {
				socket.emit("authorization", authorization(socket));
			}
		});
	socket.on('togglesocket',
		function (jsonobj) {
			if (authorization(socket) > 0) {

				console.log("togglesocket");
				togglesocket(jsonobj.number);
			}
			else {
				socket.emit("authorization", authorization(socket));
			}


		});
})


const CronJob = require('cron').CronJob;
const job = new CronJob('00 00 10 * * *', function () {
	const d = new Date();
	console.log('ALARM:', d);
	setLight(true, true, true);
	setSocket(1, true, true, true);
	play();
}, null, true, 'Europe/Berlin');
job.start();



// setInterval(function () {
// 	return;
// 	//playinglisten = subprocess.spawn('gettitle')

// 	var cut = subprocess.spawn("cut", ["-d", " ", "-f", "3-"]);
// 	var grep = subprocess.spawn("grep", [" artist "]);
// 	grep.stdout.pipe(cut.stdin);
// 	var cmus = subprocess.spawn("cmus-remote", ['-Q']);
// 	//playinglisten = subprocess.spawn('cmus-remote', ["-Q ", " | grep ' artist '" /* | cut -d ' ' -f 3- "*/ ]);

// 	cut.stdout.on('data', (data) => {
// 		console.log(" " + data);
// 		newartist = "" + data;
// 		if (newartist != artist) {
// 			artist = newartist;
// 			playersocket.emit('artist', artist + ' - ' + title);
// 			InfoHubPort.write('artist ' + artist + '\0');
// 		}

// 	})
// 	cmus.stdout.pipe(grep.stdin);

// 	cmus.on('error', (err) => {
// 		console.log(err)
// 		console.log('Failed to start subprocess.');
// 	});

// 	var cuttitle = subprocess.spawn("cut", ["-d", " ", "-f", "3-"]);
// 	var greptitle = subprocess.spawn("grep", [" title "]);
// 	greptitle.stdout.pipe(cuttitle.stdin);
// 	var cmustitle = subprocess.spawn("cmus-remote", ['-Q']);
// 	cmustitle.stdout.pipe(greptitle.stdin);
// 	cuttitle.stdout.on('data', (data) => {
// 		console.log(" " + data);
// 		newtitle = data;
// 		if (newtitle != title) {
// 			title = newtitle;
// 			playersocket.emit('song', artist + ' - ' + title);
// 			InfoHubPort.write('title ' + title + '\0');
// 		}

// 	})

// 	cut.stdout.on('data', (data) => {
// 		console.log(" " + data);
// 		newartist = "" + data;
// 		if (newartist != artist) {
// 			artist = newartist;
// 			playersocket.emit('artist', artist + ' - ' + title);
// 			InfoHubPort.write('artist ' + artist + '\0');
// 		}

// 	})
// 	cmustitle.on('error', (err) => {
// 		console.log(err)
// 		console.log('Failed to start subprocess.');
// 	});

// }, 1000);
/*
setInterval (function(){
playinglisten=subprocess.spawn('rhythmbox-client', ['--print-playing'])
playinglisten.stdout.on('data',(data)=>{
playersocket.emit('song',' '+data)
if (''+data!=olddata){
olddata=''+data;
ret=olddata.split('- ')
artist=ret[0]
title=ret[1]
console.log(artist)
console.log(title)
InfoHubPort.write('artist '+artist+'\0')
InfoHubPort.write('artist '+title+'\0')
}
console.log(' '+data)
})

playinglisten.stderr.on('data',(data)=>{
console.log(data)

})
playinglisten.on('close',(data)=>{
console.log(data)

})
},1000)*/
