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

var objKompes = []
var objKompe1 = {}
objKompe1.nimi = "Tyhja"
objKompes.push(objKompe1)

var prosenttiTaulukko = []
var nimiTaulukko = []


app.post('/auth', (request, response) => {
	username = request.body.username;
    var password = request.body.password;
	if (username && password) {


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


                

                results.forEach(element => {
                    
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


app.get('/',(req,res) => {
    res.render('login')
})


app.listen(port, () => {
    console.log('Server is up on port '+port)

})