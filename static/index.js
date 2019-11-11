
$(document).ready(function(){

    var naytaOpiskelijanSuoritukset = () => {
        var opiskelijaID = $("#oppilaanID").val()
            if(opiskelijaID){
                $.get("http://localhost:3002/oppilaanSuoritukset/"+opiskelijaID,
                function(data,status,xhr){
    
                    $.each(data, function(index, json_obj){
                        $("#tulokset").append("<p>Oppilas: "+json_obj.nimi+"    Kurssi: "+json_obj.kurssiNimi+"     Arvosana: "+json_obj.arvosana+"</p>")
                        console.log(json_obj.kurssiNimi + json_obj.arvosana)
                    });
                }
            )
            }else{
                console.log("Opiskelija ID on "+opiskelijaID)
            }
            
    }
    
    $("#kirjaudu").click(function(){
        console.log("Nappia painettu")
        naytaOpiskelijanSuoritukset()
        
    })


});

