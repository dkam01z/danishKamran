<?php



// gets current time
$executionStartTime = microtime(true);

// getting bounds from request variable
$url = 'http://api.geonames.org/earthquakesJSON?&north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=dkamran&style=full';

// creating curl handle
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // disables SSL certificate verification
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ensures the response from the API is a string
curl_setopt($ch, CURLOPT_URL, $url);

// makes the request to the API
$result = curl_exec($ch); // response is stored in this variable

curl_close($ch); 



echo $result; 



?>