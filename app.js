const connection = require('./connection')
const express = require('express')
var session = require('express-session')
const bodyParser = require('body-parser')



const app = express()
const port = process.env.PORT || 3002

app.set("view engine","hbs")

app.use(express.json())



app.use("/static", express.static('./static/'))

app.use(session({
    secret: 'osMatrice',
    resave: true,
    saveUninitialized: true
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var username = "";
var kayttajanOikeaNimi = ""
var kayttajanTiedot = "tyhja";

var objKompes = []
var objKompe1 = {}
objKompe1.nimi = "Tyhja"
objKompes.push(objKompe1)

var prosenttiTaulukko = []
var nimiTaulukko = []

app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


app.post('/auth', (request, response) => {
    
    
    objKompes = []
    objKompe1 = {}
    objKompe1.nimi = "Tyhja"
    objKompes.push(objKompe1)
    prosenttiTaulukko = []
    nimiTaulukko = []
    
    username = request.body.username;
    var password = request.body.password;


	if (username && password) {


        const megaKysely = ' SELECT DISTINCT kayttaja.kayttajaTyyppi,kayttaja.nimi, opintoLinja.linjaNimi, kompetenssi.kompetenssiNimi as "Kompetenssi", kurssi.kurssiNimi, kurssisuoritus.arvosana '+
        'FROM ((((((kayttaja INNER JOIN opintolinja on kayttaja.opintoLinja = opintolinja.linjaID) '+
        'INNER JOIN linjankompetenssit ON opintoLinja.linjaID = linjankompetenssit.linjaID) '+
        'INNER JOIN kompetenssi ON kompetenssi.kompetenssiID = linjankompetenssit.kompetenssiID) '+
        'INNER JOIN kurssisuoritus ON kurssisuoritus.kayttajaID = kayttaja.kayttajaID) '+
        'INNER JOIN kompetenssinkurssit ON kompetenssinkurssit.kompetenssiID = kompetenssi.kompetenssiID) '+
        'INNER JOIN kurssi ON kurssi.kurssiID = kurssisuoritus.kurssiID) '+
        'WHERE kayttaja.kayttajaTunnus ="'+username+'"  AND kompetenssinkurssit.kurssiID = kurssi.kurssiID '+
        'AND kayttajaTunnus="'+username+'" AND salasana= "'+password+'"'


        
        
		connection.query(megaKysely, (error, results) => {
            if (results.length > 0) {
				request.session.loggedin = true;
                request.session.username = username;
                
                kayttajanTiedot = JSON.stringify(results);
                
                if(results[0].kayttajaTyyppi === 2){
                    return response.redirect('/admin')
                }
                

                results.forEach(element => {
                    kayttajanOikeaNimi = element.nimi
                    //populoidaan kompetenssi taulukko, kompetenssi objekteilla joilla nimet,
                    for(var x = 0; x < objKompes.length; x++){
                        if(objKompes[x].nimi === "Tyhja"){
                            objKompes[x].nimi = element.Kompetenssi
                            objKompes[x].kayttajanArvosanat = 0
                        }
                        var indexOfNimi = -1
                        indexOfNimi = objKompes.findIndex(i => i.nimi === element.Kompetenssi)
                        if(indexOfNimi > -1){
                            continue;
                        }else{
                            var kompetenssiObj = {}
                            kompetenssiObj.nimi = element.Kompetenssi
                            kompetenssiObj.kayttajanArvosanat = 0
                            kompetenssiObj.maxKurssit = 0
                            kompetenssiObj.kompetenssiProsentti = 0
                            objKompes.push(kompetenssiObj)
                            
                        }
                    }

                    //haetaan käyttäjän yhteisarvosanat kompetenssia kohden
                    for(var x = 0; x < objKompes.length; x++){
                        if(objKompes[x].nimi === element.Kompetenssi){
                            objKompes[x].kayttajanArvosanat += element.arvosana
                            break;
                        }
                    }
                });
				response.redirect('/home');
                
            } else {
				response.send('Incorrect Username and/or Password!');
            }
        });
        
        const kysely = ' SELECT kompetenssiNimi, kompetenssinkurssit.kompetenssiID, COUNT(kurssiID) kurssienLkm FROM kompetenssinkurssit '+
        'INNER JOIN kompetenssi ON kompetenssi.kompetenssiID = kompetenssinKurssit.kompetenssiID GROUP BY kompetenssiID '

        connection.query(kysely,(error,results) => {
            if (results.length > 0) {
				request.session.loggedin = true;
                request.session.username = username;

                results.forEach(element => {
                    objKompes.forEach(kompetenssiObj => {
                        if(kompetenssiObj.nimi === element.kompetenssiNimi){
                            kompetenssiObj.maxKurssit = element.kurssienLkm
                        }
                    })
                })

                objKompes.forEach(kompe => {
                    kompe.kompetenssiProsentti = kompe.kayttajanArvosanat  / (kompe.maxKurssit * 5) * 100
                });

                objKompes.forEach(kompe => {
                    if(nimiTaulukko.length < results.length){
                        nimiTaulukko.push(kompe.nimi)
                    }
                    if(prosenttiTaulukko.length < results.length){
                        prosenttiTaulukko.push(kompe.kompetenssiProsentti)
                    }
                })
            }
        })
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home',(request,response) => {

    if(request.session.loggedin){
        response.render('index', {
            kayttaja: username,
            nimiTaulu: nimiTaulukko,
            prosenttiTaulu: prosenttiTaulukko,
            kayttajanOikeaNimi: kayttajanOikeaNimi,
            helpers: {
                json: function(context){
                    return JSON.stringify(context)
                }
            }
        })
    }else{
        response.send('Please login to view this page!')
    }
})
//käyttäjän lisäys submitin painaminen kayttajanLisays.hbs(kaiketi?)
app.post('/lisaaKayttaja',(request,response) => {
    
    
    
    var kayttajaTyyppiID = 1
    if(request.query.kayttajaTyyppi === "admin"){
        kayttajaTyyppiID = 2
    }

    if(!request.query.username){
        console.log()
    }


    const kysely = ' INSERT INTO kayttaja (kayttajaTunnus, opintoLinja, salasana, nimi, kayttajaTyyppi) '+
    'VALUES ("'+request.query.username+'",'+ request.query.opintoLinjaVal+',"'+request.query.password+'","'+
    request.query.oikeaNimi+'",'+kayttajaTyyppiID+') '
    
    connection.query(kysely,(err,results) => {
        if(err){
            throw err;
        }
        console.log("1 record inserted")
        response.redirect('admin')
    })
    
    console.log(kysely)

})
//käyttäjän lisäys linkin painaminen admin.hbs
app.get('/kayttajanLisays',(req,res) => {
    res.render('kayttajanLisays')
})
//jos kayttajatyyppiID 2 eli admin, mennää tänne
app.get('/admin',(request,response) => {
    if(request.session.loggedin){
        response.render('admin')
    }else{
        console.log("käännytettiin pois /admin kohasta")
    }
})

app.get('/opintoLinjat',(request,response) => {

    const kysely = "SELECT linjaNimi, linjaID FROM opintolinja"
    connection.query(kysely, (err,results) => {
        if(results.length > 0){
            response.send(results)
        }else{
            res.send("ERROR at /opintoLinjat")
        }
    })

})

app.get('/logout', function(req, res){
    if (req.session){
        req.session.destroy(function (err) {
            if (err){
                console.log(err)
            }
            console.log("Kirjauduttu ulos");
            res.redirect('http://localhost:3002/');
        });
    }
});

//jos ei mikään edeltävistä urlin lopuista niin mennää tänne
app.get('/',(req,res) => {
    res.render('login')
})


app.listen(port, () => {
    console.log('Server is up on port '+port)

})