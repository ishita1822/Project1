const fs = require('fs');
const https = require('https');

// TODO: auto enter to tunnel
// Set your login, password, host, path and path to index.html file
// 1. Set LOGIN, PASSWORD, HOST_NAME, PATH and PATH_TO_FILE in "tokenUpdate.js".
// 2. Login to the tunnel.
// 3. Run "tokenUpdate.js" by command:
//     node tokenUpdate.js
// Params:
//     -a - turn on auto update (Every 3 hours your token will be updated.)
const LOGIN = 'junopoc@continuum.net';
const PASSWORD = 'Pass@1234';
const HOST_NAME = 'idmserver.dtitsupport247.net';
const PATH = '/openam/json/authenticate?realm=/ITSUPPORT247DATASTORE&authIndexType=service&authIndexValue=adminconsoleservice';
// const PATH_TO_FILES = [
//     '../platform-launchpad-ui/index.html',
//     '../platform-launchpad-ui/index-with-menu.html',
//     '../platform-launchpad-ui/remote-test/index.html'
// ]; // ./PORTAL/index.html

const HOURS_INTERVAL = 3; // (INT) The token will be updated every HOURS_INTERVAL hours

const interval = 1000 * 60 * 60 * HOURS_INTERVAL;
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const STATUS_FAILED = 1;
const STATUS_OK = 0;
let AUTO_UPDATE = false;
var tokken;

const PARAMS = {
    AUTO_UPDATE: '-a'
};

process.argv.forEach(function(val) {
    if (val === PARAMS.AUTO_UPDATE) {
        AUTO_UPDATE = true;
    }
});

function showError(message, error) {
    console.log(red, `\n${message}`);
    if (error) {
        console.log(error);
    }
}

function showSuccess(message, data = '') {
    console.log(green, `\n${message} `, data);
}

function showMessage(message) {
    console.log(yellow, `\n${message}`);
}

// function getNewToken(callback) {
function getNewTokenPromise() {
    return new Promise((resolve,reject)=>{
        const options = {
            method: 'POST',
            hostname: HOST_NAME,
            path: PATH,
            headers: {
                'X-OpenAM-Username': LOGIN,
                'X-OpenAM-Password': PASSWORD,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
            }
        };
    
        const req = https.request(options, res => {
            showMessage(`statusCode: ${res.statusCode}`);
            const chunks = [];
            res.on('data', chunk => {
                chunks.push(chunk);
            });
    
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                let result;
                try {
                    result = JSON.parse(body.toString());
                    tokken = result.tokenId;
                    resolve(tokken);
                } catch (e) {
                    showError('ERROR:', e);
                }
            });
        });
    
        req.on('error', error => {
            showError('FAILED NETWORK CONNECTION:', error);
            showError('YOU NEED TO CHECK YOUR TUNNEL OR NETWORK CONNECTION');
        });
    
        req.end();
    })
}
// getNewToken();
// setTimeout(()=>{
//     console.log(tokken);
// },2000);

// getNewTokenPromise().then(
//     (data)=>{
//         console.log(data);
//     }
// ).catch(err => console.error(err));
module.exports = {
    getNewTokenPromise: getNewTokenPromise
};