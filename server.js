const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const credentials = "consultUsr:usr123";
const endPointSrv = "testdb-shard-00-01-nwmaa.mongodb.net:27017/";
const securitySrv = "ssl=true&authSource=admin&serverSelectionTryOnce=false";
const timeOutSrv = "&serverSelectionTimeoutMS=15000";
const urlDB = "mongodb://"+ credentials + "@" + endPointSrv + "?" + securitySrv + timeOutSrv;

var db;

MongoClient.connect(urlDB, function(err, database){

    if (err)
        return console.log(err);

    app.listen(3000, function(){
        console.log('listing the app in port 3000');
    });

});

var client = new MongoClient(urlDB, { useNewUrlParser: true });
client.connect(err => {
    const collection = client.db("TstNature").collection("Order");
    // perform actions on the collection object
    db = client.db("TstNature");
    //client.close();
});

//app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/', function(req, resp){
    //resp.send('this is a GET');
    resp.sendFile(__dirname + '/index.html')
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Allow', 'GET, POST');
    next();
});

app.post('/validateUser', function(req, resp){
    debugger;
    db.collection("Usrs").find(req.body).toArray((error, docs) => {

        var sResponseUsr = null;

        if (error) {
            console.log(error);
            sResponseUsr = {
                error : error.message
            };

        } else {
            debugger;
            if (docs.length == 1) {

                var sViewName = "";

                if (docs[0].id_salePoint !== "0") {

                    sViewName = "salePoint";

                } else if (docs[0].id_massagePoint !== "0") {

                    sViewName = "massagePoint"
                }

                sResponseUsr = {
                    success : {
                        sesionId : docs[0].id + "|" +docs[0].id_massagePoint + "|8912hdn|p28647|901218b",
                        view : sViewName
                    }
                };

            } else {

                sResponseUsr = {
                    error : "Usuario ingresado invalido."
                };
            }
        }     

        resp.send(sResponseUsr);   
    });
});