const request = require('../../lib/index');
const {Http2Debug} = require('http2-debug');

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

const httpModule = require('http');
const SERVER_HOST = '0.0.0.0';

const HTTP_PORT = 8080;
const HTTP2_PORT = 8443;

const HTTP_URL = `http://${SERVER_HOST}:${HTTP_PORT}`;
const HTTP2_URL = `https://${SERVER_HOST}:${HTTP2_PORT}`;

const serverCloseActions = [];

const onHttpServerReady = new Promise((resolve , reject)=>{
    try{
        const server = httpModule.createServer((req, res) => {
            getBody(req)
            .then((bodyRaw)=>{
                const body = JSON.parse(bodyRaw ? bodyRaw : "{}");
                const headers = req.headers;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    path : req.url,
                    method : req.method,
                    body,
                    headers
                }));
            })
            .catch((err)=>{
                res.status(500).end('')
            })
        });
        server.listen(HTTP_PORT,SERVER_HOST, (err) => {
            if (err)
                return reject(err);

            serverCloseActions.push(server.close.bind(server));
            resolve()
        });
    }
    catch(err){
        reject(err);
    }
});
const onHTTP2ServerReady = new Promise((resolve , reject)=>{
    http2Debug = new Http2Debug;
    http2Debug.createServer((err)=>{
        if (err)
            return reject(err);
        resolve();
        serverCloseActions.push(http2Debug.stopServer.bind(http2Debug));
    });
})  

describe('e2e' , ()=>{
    before(()=>{
        return Promise.all([
            onHTTP2ServerReady,
            onHttpServerReady
        ])
    })
    describe('#request',()=>{
        it('Should be able to make http2 request' , async ()=>{
            return new Promise((resolve , reject)=>{
                request({
                    uri : `${HTTP2_URL}/test1`,
                    method : 'post',
                    json:{
                        name : 'test1'
                    },
                    headers : {
                        'tesT-me' :'90'
                    }
                }, function (error, response, respBody) {
                    if (error)
                        return reject(error);
                    try{
                        const json = JSON.parse(respBody.body);
                        expect(response.httpVersion).eq('2.0')
                        expect(json.name).eq('test1');
                        expect(respBody.headers['test-me']).eq('90');
                        expect(response.statusCode).eq(200);
                        expect(respBody.headers[':method']).eq('POST');
                        resolve();
                    }
                    catch(err){
                        reject(err);
                    }
                   
                });
            })
        });
        it('Should not make http2 request if disableHttp2 is true' , ()=>{
            return new Promise((resolve , reject)=>{
                request({
                    uri : `${HTTP2_URL}/test1`,
                    disableHttp2 : true,
                    method : 'post',
                    json:{
                        name : 'test1'
                    },
                    headers : {
                        'tesT-me' :'90'
                    }
                }, function (error, response, respBody) {
                    if (error)
                        resolve();
                    else
                        reject();                   
                });
            })
        });
        it('Should be able to make http1.1 request' , ()=>{
            return new Promise((resolve , reject)=>{
                request({
                    uri : `${HTTP_URL}/test1`,
                    method : 'post',
                    json:{
                        name : 'test1'
                    },
                    headers : {
                        'tesT-me' :'90'
                    }
                }, function (error, response, body) {
                    if (error)
                        return reject(err);
                    try{
                        expect(body.body.name).eq('test1');
                        expect(body.headers['test-me']).eq('90');
                        expect(response.statusCode).eq(200);
                        expect(response.body.method).eq('POST');
                        resolve();
                    }
                    catch(err){
                        reject(err);
                    }
                   
                });
            })
        });
    });
    after(async ()=>{
       return new Promise((resolve)=>{
            serverCloseActions.forEach((action)=>{
                action();
            });
            setTimeout(resolve , 100)
       })
    })
})

function getBody(stream){
    return new Promise((resolve , reject)=>{
        let bodyRaw = '';
        stream.on('data' , (chunk)=>{
            bodyRaw+=chunk;
        });
        stream.on('end',(chunk)=>{
            if (chunk)
                bodyRaw+=chunk;
            resolve(bodyRaw);
        });
        stream.on('error' , (err)=>{
            reject(err)
        })
    })
}
