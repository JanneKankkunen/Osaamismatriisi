
$(document).ready(function(){


    var naytaOpiskelijanSuoritukset = () => {
        var opiskelijaID = $("#oppilaanID").val()
            if(opiskelijaID){
                $.get("http://localhost:3002/oppilaanSuoritukset/"+opiskelijaID,
                function(data,status,xhr){
    
                    $.each(data, function(index, json_obj){
                        $("#tulokset").append("<p>Oppilas: "+json_obj.nimi+"    Kurssi: "+json_obj.kurssiNimi+"     Arvosana: "+json_obj.arvosana+"</p>")
                        console.log(json_obj.kurssiNimi + json_obj.arvosana)
                    
					var i = 0;
					var x = json_obj.arvosana;
					if (i == 0) {
							i = 1;
							var elem = document.getElementById("myBar");
							var width = 1;
							var id = setInterval(frame, 10);
							function frame() {
							  if (width >= x * 20) {
								clearInterval(id);
								i = 0;
							  } else {
								width++;
								elem.style.width = width + "%";
							  }
							}
						  }
						
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

$("#hakuMatriisiin").click(function(){
  console.log("'Matriisin haku'-nappia painettu")
  var NewRow = osaamismatriisi.insertRow(1);
  var Newcell1 = NewRow.insertCell(0);
  var Newcell2 = NewRow.insertCell(1);
  Newcell1.innerHTML = "Testong";
  Newcell2.innerHTML = "Testomg";
})
