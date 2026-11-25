'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{fork}=require('node:child_process'),{once}=require('node:events'),{randomUUID}=require('node:crypto');
test('HTTP and actual PeerJS socket contract: forwarding, close and reconnect',async t=>{
 const child=fork(require.resolve('./child.cjs'),{stdio:['ignore','ignore','ignore','ipc']});t.after(()=>child.kill());
 const [{port}]=await once(child,'message',{signal:AbortSignal.timeout(10000)}),url='http://127.0.0.1:'+port;
 assert.deepEqual(await (await fetch(url+'/health')).json(),{ok:true,service:'manager-peer-server'});
 const id=await fetch(url+'/peerjs/peerjs/id');assert.equal(id.status,200);assert((await id.text()).length>10);
 assert.equal((await fetch(url+'/outside-peerjs')).status,404);
 const invalid=new WebSocket(url.replace('http:','ws:')+'/peerjs/peerjs?key=wrong-key&id=fixture&token=fixture');t.after(()=>invalid.close());const [rejected]=await once(invalid,'message',{signal:AbortSignal.timeout(5000)});assert.equal(JSON.parse(rejected.data).type,'ERROR');
 async function connect(id){
  const socket=new WebSocket(url.replace('http:','ws:')+'/peerjs/peerjs?key=peerjs&id='+id+'&token='+randomUUID());t.after(()=>socket.close());
  const [event]=await once(socket,'message',{signal:AbortSignal.timeout(5000)});assert.equal(JSON.parse(event.data).type,'OPEN');return socket;
 }
 const aid='qa-'+randomUUID(),bid='qa-'+randomUUID(),a=await connect(aid),b=await connect(bid);
 for(const [from,to,dst,type]of [[a,b,bid,'OFFER'],[b,a,aid,'ANSWER'],[a,b,bid,'CANDIDATE']]){
  const received=once(to,'message',{signal:AbortSignal.timeout(5000)}),payload={fixture:true,type:'data',connectionId:'fixture-channel'};from.send(JSON.stringify({type,dst,payload}));
  const [e]=await received,message=JSON.parse(e.data);assert.equal(message.type,type);assert.deepEqual(message.payload,payload);
 }
 a.close();await once(a,'close');await new Promise(r=>setTimeout(r,100));const restored=await connect(aid);assert.equal(restored.readyState,WebSocket.OPEN);
});
