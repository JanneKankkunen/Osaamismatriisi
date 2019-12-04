$(document).ready(function(){
    console.log("terve js")

    $.get("http://localhost:3002/opintoLinjat", (data,status,xhr) =>{
        $.each(data,(index,dataObj) => {
            $('#opintoLinjanValinta').append(`<option value="${dataObj.linjaID}">${dataObj.linjaNimi}</option>`)
        })

    })

    $("#kayttajanLisaysFormi").submit(function(event){
        var data = $("#kayttajanLisaysFormi").serialize();
        const url = "http://localhost:3002/lisaaKayttaja?"+data
        
        $.ajax({
            url: url,
            type: "POST",
            success: function(result){
                console.log("Onnistui kayttajanLisays.js ajax")
            }
        })
    })

});
