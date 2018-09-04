const request = require('request');
const Request = request.Request;
const {https , http} = require('http2-client');
const initBefore = Request.prototype.init;

function init(options){
    if (options){
        if (options.disableHttp2){
            this.disableHttp2 = true;
        }
    }
    return initBefore.call(this,options);
}
/*
When unit testing third party modules are not re-required while code is,
Therefore, we need to make sure we don't re-patch the request module.
*/
init.http2Patched = true;
if (!Request.prototype.init.http2Patched){
    Request.prototype.init = init;
    Object.defineProperties(Request.prototype , {
        httpModule :{
            get(){
                return this._httpModule;
            },
            set(v){
                const selectedProtocol = v&& v.globalAgent && v.globalAgent.protocol;
    
                if (this.disableHttp2)
                    this._httpModule = v;
                else if (selectedProtocol == 'https:')
                    this._httpModule = https;
                else if(selectedProtocol == 'http:')
                    this._httpModule = http;
                else
                    this._httpModule = v;
            }
        }
    })
}


module.exports = request;