$('#submitApiRequest1').click(function() {
    $.ajax({
        url: "libs/php/findPostcode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            postalcode: $('input[name="postalcode"]').val(),
            country: $('input[name="country"]').val(),
            radius: $('input[name="radius"]').val(),
            maxRows: $('input[name="maxRows"]').val(),
        },
        success: function(result) {
            console.log(JSON.stringify(result));

            if (result.status.name == "ok" && result.data.length > 0) {

				$('#rowOneHeading').html('City');
                $('#rowTwoHeading').html('Lat:');
                $('#rowThreeHeading').html('Lng:');
                $('#rowFourHeading').html('postalCode:');
                $('#rowFiveHeading').html('countryCode:');
                
                $('#rowOneResult').html(result.data[0].adminName2); 
                $('#rowTwoResult').html(result.data[0].lat);
                $('#rowThreeResult').html(result.data[0].lng);
                $('#rowFourResult').html(result.data[0].postalCode);
                $('#rowFiveResult').html(result.data[0].countryCode);
            } else {
                $('#resultField').html("Could not fetch data").css("color", "red");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#resultField').html("Error: " + textStatus + " - " + errorThrown).css("color", "red");
        }
    });
});



$('#submitApiRequest2').click(function() {
	$.ajax( {
		url: 'libs/php/earthquakes.php',
		method: "POST",
		dataType: 'json',

		data: {
			north: $('input[name="north"]').val(),
			south: $('input[name="south"]').val(),
			east: $('input[name="east"]').val(),
			west: $('input[name="west"]').val(),
		},

		success: function(result) {

			console.log(result);

			if (result.status.name == "ok" && result.data.length > 0) {
				
                $('#rowOneHeading').html('Date and Time:');
                $('#rowTwoHeading').html('Depth:');
                $('#rowThreeHeading').html('Magnitude:');
                $('#rowFourHeading').html('Longitude:');
                $('#rowFiveHeading').html('Latitude:');
                $('#rowOneResult').html(result['data'][0]['datetime']);
                $('#rowTwoResult').html(result['data'][0]['depth']);
                $('#rowThreeResult').html(result['data'][0]['magnitude']);
                $('#rowFourResult').html(result['data'][0]['lng']);
                $('#rowFiveResult').html(result['data'][0]['lat']);

			} else {

                $('#resultField').html("Could not fetch data").css("color", "red");
            }

            

		},
		error: function(jqXHR, textStatus, errorThrown) {
            $('#resultField').html("Error: " + textStatus + " - " + errorThrown).css("color", "red");
        }
					
	})


})

$('#submitApiRequest3').click(function() {
	$.ajax( {
		url: 'libs/php/findNearByWeather.php',
		method: "POST",
		dataType: 'json',

		data: {
			lat: $('input[name="lat"]').val(),
			lng: $('input[name="lng"]').val(),

		},

		success: function(result) {

			console.log(result);

			if (result.status.name == "ok" ){
				
                $('#rowOneHeading').html('datetime:');
                $('#rowTwoHeading').html('temperature:');
                $('#rowThreeHeading').html('humidity:');
                $('#rowFourHeading').html('stationName:');
                $('#rowFiveHeading').html('clouds:');
                $('#rowOneResult').html(result['data']['datetime']);
                $('#rowTwoResult').html(result['data']['temperature']);
                $('#rowThreeResult').html(result['data']['humidity']);
                $('#rowFourResult').html(result['data']['stationName']);
                $('#rowFiveResult').html(result['data']['clouds']);

			} else {
                $('#resultField').html("Could not fetch data").css("color", "red");
            }

		},
		error: function(jqXHR, textStatus, errorThrown) {
            $('#resultField').html("Error: " + textStatus + " - " + errorThrown).css("color", "red");
        }
					
	})


})