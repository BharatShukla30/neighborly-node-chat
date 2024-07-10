const ws = require('k6/ws');
const { check } = require('k6');
const http = require('k6/http');
const { Trend } = require('k6/metrics');

const socketResponseType = {
    open: 1,
    close: 2,
    ping: 3,
    pong: 4,
    message: 5,
    upgrade: 6,
    noop: 7
}

const socketResponseCode = {
    connect: 1,
    disconnect: 2,
    event: 3,
    ack: 4,
    error: 5
}

function makeConnection(domain) {
    let res;

    // Establishing a `polling` transport and getting the `sid`.
    res = http.get(`http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}`);

    const sid = getSid(res.body);

    const data = `${socketResponseType.message}${socketResponseCode.connect}`;
    const headers = { 'Content-type': 'text/plain;charset=UTF-8' };

    // `message connect` event
    res = http.post(
        `http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}&sid=${sid}`,
        data,
        { headers: headers }
    );

    // also seems to be needed...
    res = http.get(
        `http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}&sid=${sid}`
    );

    return sid;
}

/**
 * This method will check:
 * 1. The type of socket.io response
 * 2. The response code
 * And act accordingly.
 * @param message the socket.io response
 */
function checkResponse(response) {
    return { type: parseInt(response[0]), code: parseInt(response[1]) };
}

/**
 * In our message we're returning an array, but this may not be the case your app.
 * If that's the case, change the regex in the 'match' const.
 * @param response socketio response message
 * @returns the data from the response message
 */
function getArrayFromRequest(response) {
    const match = /\[.+\]/;
    const parsedResponse = response.match(match);
    return parsedResponse ? JSON.parse(parsedResponse[0]) : 'No Response';
}

/**
 * This function will only check for 'event' messages.
 * To see what other types of messages you can check for,
 * look at the enums in constants.ts.
 * @param msg message sent from socket.io backend client
 * @param checks a function that you pass through which performs checks on the parsed message
 */
function checkForEventMessages(msg, checks) {
    // Check for event messages
    const msgObject =
        // you can change this to check for other message types
        checkResponse(msg).type === socketResponseType.message &&
        checkResponse(msg).code === socketResponseCode.event
            ? getArrayFromRequest(msg) // get data from message
            : null;

    if (msgObject) {
        checks(msgObject);
    }
}

function hashDate() {
    return (+new Date()).toString(36);
}

function getSid(parserEncoding) {
    const match = /{.+?}/;
    const response = parserEncoding.match(match);
    return response ? JSON.parse(response[0]).sid : 'No Response';
}

const options = {
    vus: 1,
    duration: '10s',
    tags: {
        testName: 'socketsio poc'
    }
};

// this trend will show up in the k6 output results
let messageTime = new Trend('socketio_message_duration_ms');

function defaultFunction() {
    const domain = `localhost:5001`;
    let startTime = 0;
    let endTime = 0;

    const sid = makeConnection(domain);

    // Let's do some websockets
    const url = `ws://${domain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

    let response = ws.connect(url, {}, function (socket) {
        socket.on('open', function open() {
            console.log('connected');
            socket.send('2probe');
            socket.send('5');
            socket.send('3');

            // send an event message
            startTime = Date.now();
            socket.send(
                `${socketResponseType.message}${socketResponseCode.event}["chat message","hello k6"]`
            );

            socket.setInterval(function timeout() {
                socket.ping();
                console.log('Pinging every 1sec (setInterval test)');
            }, 1000 * 5);
        });

        // You can also send http messages
        http.get('https://test-api.k6.io/public/crocodiles/?format=json');

        // This will constantly poll for any messages received
        socket.on('message', function incoming(msg) {
            // checking for event messages
            checkForEventMessages(msg, function (messageData) {
                endTime = Date.now();
                console.log(`
          I've received an event message! 
          message=${messageData[1]}
          vu=${__VU.toString()} 
          iter=${__ITER.toString()} 
          time=${Date.now().toString()}
        `);
            });
        });

        socket.on('close', function close() {
            console.log('disconnected');
        });

        socket.on('error', function (e) {
            console.log('error', JSON.stringify(e));
            if (e.error() != 'websocket: close sent') {
                console.log('An unexpected error occured: ', e.error());
            }
        });

        socket.setTimeout(function () {
            console.log('2 seconds passed, closing the socket');
            socket.close();
        }, 1000 * 2);
    });

    check(response, { 'status is 101': r => r && r.status === 101 });

    // Log message time
    messageTime.add(endTime - startTime);
};

module.exports = {
    options,
    default: defaultFunction
};
