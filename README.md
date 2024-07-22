# Neighborly chat service

Socket.io chat service

## Testing

Running application tests:

```npm run test```

Running performance tests:

```npm run test-performance```

Example summary performance test: 

```
All VUs finished. Total time: 31 seconds

--------------------------------
Summary report @ 12:34:24(+0200)
--------------------------------

errors.Undefined function "connect": ........................................... 1100
errors.Undefined function "disconnect": ........................................ 1100
socketio.emit: ................................................................. 5500
socketio.emit_rate: ............................................................ 174/sec
socketio.response_time:
  min: ......................................................................... 0
  max: ......................................................................... 1.1
  mean: ........................................................................ 0.1
  median: ...................................................................... 0.1
  p95: ......................................................................... 0.2
  p99: ......................................................................... 0.3
vusers.completed: .............................................................. 1100
vusers.created: ................................................................ 1100
vusers.created_by_name.WebSocket Chat Test: .................................... 1100
vusers.failed: ................................................................. 0
vusers.session_length:
  min: ......................................................................... 10001.8
  max: ......................................................................... 10050.3
  mean: ........................................................................ 10004.6
  median: ...................................................................... 9999.2
  p95: ......................................................................... 9999.2
  p99: ......................................................................... 9999.2
```

https://www.artillery.io/docs/reference/reported-metrics

NOTE: make sure server is running already

## To start the app:
1. Get the config folder called "node-chat-config" from the google drive link and paste it into the node-backend folder.
2. Rename the config folder to "config"
3. Make sure the port in config.env is same as in the frontend's .env
4. Make sure that you have changed directory into ```node-backend``` before the next steps
5. Run **```npm install```** command and wait for completion.
6. Run **```npm run dev```** command to start the frontend server.
