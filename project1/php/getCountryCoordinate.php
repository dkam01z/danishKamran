<?php

$executionStartTime = microtime(true);

$country = urlencode($_REQUEST['country']);
$apiKey = urlencode($_REQUEST['apiKey']);

$url = "https://api.geoapify.com/v1/geocode/search?country={$country}&apiKey={$apiKey}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

echo $result; // Return the result directly

?>
