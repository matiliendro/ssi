const fs = require('fs')
const bodyParser = require('body-parser')
const ngrok = require('ngrok')
const open = require('open')
const decodeJWT = require('did-jwt').decodeJWT
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util
const express = require('express')
const { Credentials } = require('uport-credentials')
const file_pk = "priv_key.txt";
const file_credential = 'credential.txt'
const new_credential = Credentials.createIdentity();

const credentials = new Credentials({
    appName: 'Login ejemplo',
    did: new_credential.did,
    name: 'Erick', 
    country: 'Argentina',
    privateKey:new_credential.privateKey
});

fs.writeFile(file_pk, new_credential.privateKey, (err) =>{
    if(err) throw err;
    console.log(`PK almacenada '${file_pk}'`);
})

fs.writeFile(file_credential, new_credential.did, (err) =>{
    if(err) throw err;
    console.log(`Credencial almacenada '${file_credential}'`);
})

let endpoint = 'endpoint01'
const app = express();
app.use(bodyParser.json({ type: '*/*' }))

app.get('/', (req, res) => {
    credentials.createDisclosureRequest({
        requested: ["name", "email", "image", "country", "phone"],
        notifications: true,
        callbackUrl: endpoint + '/callback'
    }).then(requestToken => {
        console.log(decodeJWT(requestToken))
        const uri = 
    message.paramsToQueryString(message.messageToURI(requestToken),
    {callback_type: 'post'})
        const qr = transports.ui.getImageDataURI(uri)
        res.send(`<div>
                    <center>
                    <style>
                        body {background-color: lightblue;}
                        h1 {color: blue;}
                        p {color: SlateBlue; font-size:40px; font-weight: bold; font-family: Sans-serif}
                    </style>
                    <br>
                    <p>Bushido - Uport Login</p>
                        <img src="${qr}"/>
                    </center>
                  <div>`)
    })
})

app.post('/callback', (req, res) => {
    const jwt = req.body.access_token
    console.log(jwt);
    credentials.authenticateDisclosureResponse(jwt).then(credentials => {
        console.log(credentials);
    }).catch(err => {
        console.log(err)
    })    
})

const server = app.listen(8080, () => {
    ngrok.connect(8080).then(ngrokUrl => {
        endpoint = ngrokUrl
        // open(endpoint, {app: 'firefox'});
        setTimeout(() => open(endpoint, {app: 'firefox'}), 1200)
        console.log(`Login Service runing, open at ${endpoint}`)
    })
})
