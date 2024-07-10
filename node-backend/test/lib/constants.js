exports.socketResponseType = {
    open: 1,
    close: 2,
    ping: 3,
    pong: 4,
    message: 5,
    upgrade: 6,
    noop: 7
}

exports.socketResponseCode = {
    connect: 1,
    disconnect: 2,
    event: 3,
    ack: 4,
    error: 5
}