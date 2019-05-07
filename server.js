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
    //debugger;
    db.collection("Usrs").find(req.body).toArray((error, docs) => {

        var sResponseUsr = null;

        if (error) {
            console.log(error);
            sResponseUsr = {
                error : error.message
            };

        } else {
            //debugger;
            if (docs.length == 1) {

                var sViewName = "";
                var sIdPoint = "";

                if (docs[0].id_salePoint !== "0") {

                    sViewName = "salePoint";
                    sIdPoint = docs[0].id_salePoint;

                } else if (docs[0].id_massagePoint !== "0") {

                    sViewName = "massagePoint"
                    sIdPoint = docs[0].id_massagePoint;
                }

                sResponseUsr = {
                    success : {
                        sesionId : docs[0].id + "|" + sIdPoint + "|8912hdn|p28647|901218b",
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

app.post('/therapists', function(req, resp){
    //debugger;
    var sResponseUsr = null;

    if (req.body.session !== undefined && req.body.session !== null &&
            req.body.session !== "") {

        var aData = req.body.session.split('|');

        db.collection("Usrs").find({id_massagePoint : aData[1]}).toArray((error, docs) => {

            if (error) {
                console.log(error);
                sResponseUsr = {
                    error : error.message
                };

            } else {
                //debugger;
                if (docs.length > 0) {

                    var users  = [];

                    docs.forEach(function(user) {

                        var usrTmp = {
                            id : user.id,
                            name : user.name
                        };

                        users.push(usrTmp);
                    });

                    sResponseUsr = {
                        success : {
                            therapists : users
                        }
                    };

                } else {

                    sResponseUsr = {
                        error : "No hay terapeutas para el centro de masaje seleccionado."
                    };
                }
            }     

            resp.send(sResponseUsr);   
        });
    } else {
        
        sResponseUsr = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponseUsr);  
    }
});

app.post('/massagePoint', function(req, resp){
    //debugger;
    var sResponse = null;

    if (req.body.session !== undefined && req.body.session !== null &&
            req.body.session !== "") {

        var aData = req.body.session.split('|');

        db.collection("MassagePoint").find({id : aData[1]}).toArray((error, docs) => {

            if (error) {
                console.log(error);
                sResponse = {
                    error : error.message
                };

            } else {
                //debugger;
                if (docs.length == 1) {

                    sResponse = {
                        success : {
                            pointName : docs[0].name,
                            pointLocation : docs[0].location
                        }
                    };

                } else {

                    sResponse = {
                        error : "Existen dos o mas sucursales."
                    };
                }
            }     

            resp.send(sResponse);   
        });

    } else {
        
        sResponse = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponse);  
    }
});

app.get('/creams', function(req, resp){
    //resp.send('this is a GET');
    var creamTypes = [];
    var creams = [];
    var sResponse = null;

    db.collection("CreamType").find({status : "1"}).toArray((error, docs) => {

        if (error) {
            console.log(error);
            sResponse = {
                error : error.message
            };

        } else {
            //debugger;
            if (docs.length > 0) {

                creamTypes = docs;

                db.collection("Cream").find({status : "1"}).toArray((errorCream, docsCream) => {

                    if (errorCream) {
                        console.log(errorCream);
                        sResponse = {
                            error : errorCream.message
                        };
            
                    } else {
                        //debugger;
                        if (docsCream.length > 0) {
            
                            creams = docsCream;
                            
                            var creamsResp = [];

                            creams.forEach(function(cream) {
                                //debugger;
                                /*var creamTmp = {
                                    id : '',
                                    name : '',
                                    tipo : '',
                                    subType : '',
                                    week : false
                                }*/
                                var creamTmp = {
                                    name : '',
                                    tipo : '',
                                    week : false
                                }
                                
                                creamTmp.name = cream.name;

                                var foundType = false;
                                var iRecTypes = 0;
                                while (!foundType && iRecTypes < creamTypes.length) {

                                    if (creamTypes[iRecTypes].id === cream.id_creamType) {

                                        foundType = true;
                                        creamTmp.week = creamTypes[iRecTypes].daysWeek === "1" ? true : false;
                                        creamTmp.tipo = creamTypes[iRecTypes].name;

                                    } else {
                                        
                                        iRecTypes = iRecTypes + 1;
                                    }
                                }

                                creamsResp.push(creamTmp);

                            });
                            sResponse = {
                                success : {
                                    creams : creamsResp
                                }
                            };
            
                        } else {
            
                            sResponse = {
                                error : "No existen cremas activas."
                            };
                        }
                    }          

                    resp.send(sResponse);   
            
                });

            } else {

                sResponse = {
                    error : "No existen tipos de crema activos."
                };
            }
        }
    });
});

app.post('/salePoint', function(req, resp){
    //debugger;
    var sResponse = null;

    if (req.body.session !== undefined && req.body.session !== null &&
            req.body.session !== "") {

        var aData = req.body.session.split('|');

        db.collection("SalePoint").find({id : aData[1]}).toArray((error, docs) => {

            if (error) {
                console.log(error);
                sResponse = {
                    error : error.message
                };

            } else {
                //debugger;
                if (docs.length == 1) {

                    sResponse = {
                        success : {
                            saleName : docs[0].name,
                            saleLocation : docs[0].location
                        }
                    };

                } else {

                    sResponse = {
                        error : "Existen dos o mas puntos de venta."
                    };
                }
            }     

            resp.send(sResponse);   
        });

    } else {
        
        sResponse = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponse);  
    }
});

app.post('/sellers', function(req, resp){
    //debugger;
    var sResponseUsr = null;

    if (req.body.session !== undefined && req.body.session !== null &&
            req.body.session !== "") {

        var aData = req.body.session.split('|');

        db.collection("Usrs").find({id_salePoint : aData[1]}).toArray((error, docs) => {

            if (error) {
                console.log(error);
                sResponseUsr = {
                    error : error.message
                };

            } else {
                //debugger;
                if (docs.length == 1) {

                    sResponseUsr = {
                        success : {
                            sellerId : docs[0].id,
                            sellerName : docs[0].name
                        }
                    };

                } else {

                    sResponseUsr = {
                        error : "No hay vendedores para el punto de venta seleccionado."
                    };
                }
            }     

            resp.send(sResponseUsr);   
        });
    } else {
        
        sResponseUsr = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponseUsr);  
    }
});

app.post('/orders', function(req, resp){
    
    var sResponseUsr = null;

    if (req.body.session !== undefined && req.body.session !== null &&
            req.body.session !== "") {
        
        var aData = req.body.session.split('|');

        var orders = [];
        var creams = [];
        var sResponse = null;

        db.collection("Order").find({massage_point : aData[1], status : '1'}).toArray((error, docs) => {

            if (error) {
                console.log(error);
                sResponse = {
                    error : error.message
                };

            } else {
                //debugger;
                if (docs.length > 0) {

                    docs.forEach(function(doc) {

                        var order  = {
                            order : doc.folio,
                            name : doc.client_name,
                            contact : doc.client_contact,
                            products : {
                                list : "",
                                tipo : "textarea"
                            }
                            
                        };

                        doc.products.forEach(function(product) {
                            //debugger;
                            var creamName = product.name;

                            if (order.products.list === "") {

                                order.products.list = creamName;

                            } else {

                                order.products.list = order.products.list + ", " 
                                        + creamName;
                            }
                        });

                        orders.push(order);
                    });

                    sResponse = {
                        success : {
                            orders : orders
                        }
                    };

                } else {

                    sResponse = {
                        error : "No existen tipos de crema activos."
                    };
                }

                resp.send(sResponse);  
            }
        });

    } else {
            
        sResponseUsr = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponseUsr);  
    }
});

app.post('/saveOrder', function(req, resp){
    //debugger;
    var sResponseUsr = null;

    if (req.body.idSession !== undefined && req.body.idSession !== null &&
            req.body.idSession !== "") {

        var aData = req.body.idSession.split('|');

        var currentDate = new Date();
        var date = currentDate.getDate();
        var month = currentDate.getMonth(); 
        var year = currentDate.getFullYear();

        var order = {
            client_name : req.body.clientN,
            client_contact : req.body.clientC,
            massage_point : aData[1],
            user_id : aData[0],
            folio : Math.floor((Math.random() * 1000000000) + 999999999),
            status : "1",
            date : date + "/" + month + "/" + year,
            products : req.body.products
        };

        db.collection("Order").save(order, function(err){

            if (err) {
                console.log(err);
                sResponseUsr = {
                    error : err.message
                };

            } else {
                sResponseUsr = {
                    success : "Orden enviada"
                };
            }

            resp.send(sResponseUsr);

        });
        
    } else {
        
        sResponseUsr = {
            error : "Peticion incompleta, intente nuevamente."
        };
        
        resp.send(sResponseUsr);  
    }
});