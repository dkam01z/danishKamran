<?php

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();


$url = 'https://restcountries.com/v2/alpha/' . $_REQUEST['countryCode'] ;





curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 


$result = curl_exec($ch);
curl_close($ch);

echo $result; 
$executionEndTime = microtime(true) / 1000;
$executionTime = ($executionEndTime - $executionStartTime) . ' seconds';

?>