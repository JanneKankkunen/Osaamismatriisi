const express = require('express')
const connection = require('./connection')
const bodyParser = require('body-parser')
const cors = require('cors')


const app = express()
const port = process.env.PORT || 3002

app.use(express.json())


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors())

app.use("/static", express.static('./static/'))

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
    res.sendFile(__dirname+'/index.html')
})


app.listen(port, () => {
    console.log('Server is up on port '+port)

})