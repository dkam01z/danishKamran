<?php




$executionStartTime = microtime(true);

// getting bounds from request variable
$url = 'http://api.geonames.org/earthquakesJSON?&north=' . $_REQUEST['north'] . '&south=' . $_REQUEST['south'] . '&east=' . $_REQUEST['east'] . '&west=' . $_REQUEST['west'] . '&username=dkamran&style=full';

// creating curl handle
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_URL, $url);

// makes the request to the API
$result = curl_exec($ch); 

curl_close($ch); 



echo $result; 



?>