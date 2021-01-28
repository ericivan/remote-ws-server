const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 8010})

const code2ws = new Map();
wss.on('connection', (ws, request) => {
    let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    code2ws.set(code, ws)

    console.log(code);
    ws.sendData = (event, data) => {
        ws.send(JSON.stringify({event, data}));
    }
    ws.on('message', function incoming(message) {

        let parsedMessage = {};

        try {
            parsedMessage = JSON.parse(message);
        } catch (e) {
            console.log(e);

            return;
        }

        let {event, data} = parsedMessage;

        if (event === 'login') {
            console.log({code})
            ws.sendData('logined', {code})
        } else if (event === "control") {
            let remote = +data.remote;

            if (code2ws.has(remote)) {

                ws.sendData("controlled", {remote});

                let remoteWs = code2ws.get(remote);

                ws.sendRemote = remoteWs.sendData;

                remoteWs.sendRemote = ws.sendData;

                ws.sendRemote("be-controlled", {remote: code})
            }
        } else if (event === 'forward') {
            ws.sendRemote(data.event, data.data);
        }
    });

    ws.on('close', () => {
        code2ws.delete(code);
        clearTimeout(ws._closeTimeout)
    })

    ws._closeTimeout = setTimeout(() => {
        ws.terminate();
    },600000)
})

//{"event":"control","data":{"remote": 670080}}
//{"event":"login"}
//{"event":"forward","data":{"event":"offer","data":{"offer":"sdp"}}}
