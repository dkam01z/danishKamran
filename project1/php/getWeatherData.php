<?php

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();

$url = 'http://api.weatherapi.com/v1/forecast.json?key=' . $_REQUEST['apiKey'] . '&q=' . $_REQUEST['capital'] . '&days=4&aqi=no';

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$result = curl_exec($ch);

echo $result;

$executionEndTime = microtime(true) / 1000;
$executionTime = ($executionEndTime - $executionStartTime) . ' seconds';



?>