'use strict';
const express = require('express');
const http = require('http');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
app.disable('x-powered-by');
app.get('/', (_req, res) => res.type('text/plain').send('Manager PeerServer is running.'));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'manager-peer-server' }));

const peerServer = ExpressPeerServer(server, {
  path: '/',
  proxied: true,
  allow_discovery: false,
  alive_timeout: 60000,
});
app.use('/peerjs', peerServer);

const port = Number(process.env.PORT) || 10000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Manager PeerServer listening on ${port}`);
});
