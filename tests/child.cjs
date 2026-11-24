const s=require('../server.js').createPeerServer();s.listen(0,'127.0.0.1',()=>process.send({port:s.address().port}));
