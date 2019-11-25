
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
  var tbl = document.getElementById('osaamismatriisi'), // table reference
  row = tbl.insertRow(tbl.rows.length),      // append table row
  i;
  for (i = 0; i <= data; i++) { // insert table cells to the new row
    createCell(row.insertCell(i), i, 'row'); // tähän pitäis saada tehtyä semmonen systeemi mikä hakee databasesta kompetenssien määrän ja päräyttää sen verran rivejä taulukkoon
  }
})
function createCell(cell, text, style) {
  var div = document.createElement('div'), // create DIV element
      txt = document.createTextNode(text); // create text node
  div.appendChild(txt);                    // append text node to the DIV
  div.setAttribute('class', bg);           // set DIV class attribute
  div.setAttribute('className', style);    // set DIV class attribute for IE (?!)
  cell.appendChild(div);                   // append DIV to the table cell
}
