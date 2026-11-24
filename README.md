# manager-peer-server

Existing PeerJS signaling service for Manager Game. It forwards WebRTC negotiation
messages; game state, purchases and SQLite remain in their existing game services.

Start with `npm ci --ignore-scripts` and `npm start` (Node.js 24).
`PORT` defaults to 10000; the executable still binds to `0.0.0.0`.
Importing `createPeerServer()` does not start a listener.

## Protocol checks

`npm test` starts a child server on an ephemeral loopback port and verifies:

- `/health` and `/peerjs/peerjs/id`;
- WebSocket `/peerjs/peerjs` with the default `peerjs` key;
- rejection of an invalid WebSocket key;
- forwarding OFFER, ANSWER and CANDIDATE, disconnect and reconnection.

PeerJS's HTTP ID generator is public; an ID response does not authorize a
WebSocket connection. Discovery remains disabled. Proxy handling and the
60-second alive timeout are unchanged.

These tests use synthetic messages and do not establish a WebRTC data channel.
The game repository owns browser-to-browser gameplay and external signaling QA.
Local PASS does not certify the availability of the hosted Render service.
The workflow runs tests only and does not deploy or change production settings.
