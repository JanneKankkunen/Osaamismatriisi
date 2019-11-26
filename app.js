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

var kompetenssiObj = {
    nimi: "kompetenssi",
    suoritukset: [
        {
            kurssi: "kurssi1",
            arvosana: "5" 
        }
    ]
};



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


        const kysely = ' SELECT * FROM kayttaja WHERE kayttajaTunnus="'+username+'" AND salasana= "'+password+'"'
        
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
                    console.log(element.Kompetenssi)
                });
                // kayttajanTiedotArrayssa = JSON.stringify(results.array.forEach(element => {
                //     console.log(element)
                // }));

				response.redirect('/home');
                
            } else {
				response.send('Incorrect Username and/or Password!');
            }
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home',(request,response) => {

    if(request.session.loggedin){
        //response.send('Welcome back, '+ request.session.username + '!')
        //response.sendFile(__dirname+"/index.html")
        var objString = JSON.stringify(kompetenssiObj)

        response.render('index', {
            kayttaja: username,
            kayttajanTiedot: kayttajanTiedot,
            kayttajanNimi: kayttajanNimi,
            kayttajanLinja: kayttajanLinja,
            kayttajanKompetenssit: kayttajanKompetenssit,
            kompetenssiObj: objString
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