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
var kayttajanTiedot = "tyhja";
var kayttajanTiedotArrayssa = [];


var kayttajanNimi = "XnimiX";
var kayttajanLinja = "XlinjaX";
var kayttajanKompetenssit = [];
var kayttajanKurssitJaArvosanat = [];

//kompetenssi objektiin pitäis saada:
//  Kompetenssin sisältämien kurssien lukumäärä
//  Käyttäjän yhteisarvosana kursseista, joita on suorittanut kompetenssin sisältä
//  Kompetenssi nimi
// 

var kompetenssiObj1 = {}
var kompetenssiObj2 = {}
var kompetenssiObj3 = {}
var kompetenssiObj4 = {}
var kompetenssiObj5 = {}

var kompetenssiObjt = [kompetenssiObj1,kompetenssiObj2,kompetenssiObj3, kompetenssiObj4, kompetenssiObj5]


app.post('/auth', (request, response) => {
	username = request.body.username;
    var password = request.body.password;
	if (username && password) {

        //tähän pitää lisätä vielä kurssien lukumäärä kompetenssiä kohden

        const megaKysely = ' SELECT DISTINCT kayttaja.nimi, opintoLinja.linjaNimi, kompetenssi.kompetenssiNimi as "Kompetenssi", kurssi.kurssiNimi, kurssisuoritus.arvosana '+
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
                
                kayttajanNimi = JSON.stringify(results[0].nimi)
                kayttajanLinja = JSON.stringify(results[0].linjaNimi)


                //Kompetenssit taulukkoon
                results.forEach(element => {
                    if(kayttajanKompetenssit.indexOf(element.Kompetenssi) === -1){
                        kayttajanKompetenssit.push(element.Kompetenssi)
                    }
                });
                
                kompetenssiObj1.nimi = kayttajanKompetenssit[0]
                kompetenssiObj2.nimi = kayttajanKompetenssit[1]
                kompetenssiObj3.nimi = kayttajanKompetenssit[2]
                kompetenssiObj4.nimi = kayttajanKompetenssit[3]
                kompetenssiObj5.nimi = kayttajanKompetenssit[4]
                // kayttajanTiedotArrayssa = JSON.stringify(results.array.forEach(element => {
                //     console.log(element)
                // }));
                
                kompetenssiObjt.forEach(kompetenssi => {
                    kompetenssi.kayttajanArvosanatYhteensa = 0
                    results.forEach(element => {
                        if(kompetenssi.nimi === element.Kompetenssi){
                            kompetenssi.kayttajanArvosanatYhteensa += element.arvosana
                        }
                    })
                })


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
                    kompetenssiObjt.forEach(kompetenssiObj => {
                        if(kompetenssiObj.nimi === element.kompetenssiNimi){
                            kompetenssiObj.maxKurssit = element.kurssienLkm
                        }
                    })
                })

                kompetenssiObjt.forEach(kompe => {
                    kompe.maxArvosanat = kompe.maxKurssit * 5
                })

                kompetenssiObjt.forEach(kompe => {
                    kompe.kompetenssiProsentti = kompe.kayttajanArvosanatYhteensa / kompe.maxArvosanat * 100
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
            kayttajanTiedot: kayttajanTiedot,
            kayttajanNimi: kayttajanNimi,
            kayttajanLinja: kayttajanLinja,
            kayttajanKompetenssit: kayttajanKompetenssit,
            kompetenssiObj1: kompetenssiObj1,
            kompetenssiObj2: kompetenssiObj2,
            kompetenssiObj3: kompetenssiObj3,
            kompetenssiObj4: kompetenssiObj4,
            kompetenssiObj5: kompetenssiObj5
            , helpers: {
                json: function(context){
                    return JSON.stringify(context)
                }
            }
        })
    }else{
        response.send('Please login to view this page!')
    }
})


app.get('/oppilaat',(req,res) => {

    const kysely = "SELECT * FROM opiskelija"
    connection.query(kysely,(err,opiskelijat) => {
        if(err){
            res.send("erroria pukkaa /oppilaat kohassa")
        }
        
        res.send(opiskelijat)
        
    })
})


app.get('/oppilas/:id',(req,res) => {

    const kysely = "SELECT * FROM opiskelija WHERE opiskelijaID="+req.params.id+" "
    connection.query(kysely,(err,opiskelija) => {
        if(err){
            res.send("erroria pukkaa /oppilas kohassa")
        }else{
            res.send(opiskelija)
        }
        
    })
})

app.get('/oppilaanSuoritukset/:opiskelijaID',(req,res) => {

    const kysely = "SELECT DISTINCT opiskelija.nimi, kurssi.kurssiNimi,kurssisuoritus.arvosana "+
    "FROM (kurssisuoritus INNER JOIN kurssi "+
    "ON kurssisuoritus.kurssiID = kurssi.kurssiID) "+
    "INNER JOIN opiskelija ON kurssisuoritus.opiskelijaID = opiskelija.opiskelijaID "+
    "WHERE opiskelija.opiskelijaID = "+req.params.opiskelijaID

    connection.query(kysely,(err, tiedot) => {
        if(err){
            res.send("Erroria tulee opiskelijan tietoja haettaessa")
        }else{
            res.send(tiedot)
        }
        
    })
})


app.get('/',(req,res) => {
    res.render('login')
})


app.listen(port, () => {
    console.log('Server is up on port '+port)

})