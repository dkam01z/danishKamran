<?php

$executionStartTime = microtime(true) / 1000;

$ch = curl_init();

$url = 'https://newsapi.org/v2/top-headlines?country=' . $_REQUEST['country'] . '&apiKey=' . $_REQUEST['apiKey'];

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_USERAGENT, 'script.js/1.0');

$result = curl_exec($ch);

echo $result;

$executionEndTime = microtime(true) / 1000;
$executionTime = ($executionEndTime - $executionStartTime) . ' seconds';



?>