function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

//poolstats.html - valor pago em BRL / AEON
httpGetAsync('https://pooltupi.com/api/pool/payments?limit=100000', function(pagamentos){
	var pagobjeto = JSON.parse(pagamentos);
	var contadorPagamento = 0;
	var totalAEON = 0;
	var totalBRL = 0;
	
	for (var x = 0; x < pagobjeto.length; x++) {
		contadorPagamento += 1;
		totalAEON += (pagobjeto[x].value / 1000000000000) - 0.01;
	}
	
	httpGetAsync('https://min-api.cryptocompare.com/data/price?fsym=AEON&tsyms=BRL,USD,EUR', function(data){
		var objeto = JSON.parse(data);
		var BRL = objeto["BRL"]
		totalBRL = BRL * totalAEON;
		totalBRL = totalBRL.toFixed(2)

		document.getElementById('ps-pagoBRL').innerHTML = totalBRL.toLocaleString('en-US',{ minimumFractionDigits: 2 });
		document.getElementById('ps-pagoAEON').innerHTML = totalAEON.toFixed(0);
	});	
});