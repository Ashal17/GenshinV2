<?php

$url_uid = 'http://enka.network/api/uid/';
$url_profile = 'https://enka.network/api/profile/%s/hoyos/%s/builds/';

$json = json_decode(file_get_contents("php://input"));
$jsondata = $json ->data;
$uid = $jsondata ->uid;

if (!is_numeric($uid) || strlen($uid)<9 || strlen($uid)>10) {
	http_response_code(400);
	echo "{'code':'400', 'error':'Input is not valid UID', 'message':'Input is not valid UID'}";
	exit();
}

$context = stream_context_create([
	'http' => [
		'method' => 'GET', 
        'header'  => 'User-Agent: ashal.eu/1.0'
	]
]);

$response_uid = file_get_contents($url_uid . $uid, false, $context);

if ($response_uid === FALSE) { 
	$error = $http_response_header[11];
	http_response_code(400);
	echo "{'code':'400', 'error':'" . $error . "', 'message':'" . $error . "'}";
	exit();
}

$parsedresponse = json_decode($response_uid);

if (array_key_exists('owner', $parsedresponse)) {
	$owner = $parsedresponse-> owner;
	$hash = $owner -> hash;
	$username = $owner -> username;

	$response_profile = file_get_contents(sprintf($url_profile, $username, $hash), false, $context);
	$profile_builds = json_decode($response_profile);
	
	$parsedresponse -> profile_builds = $profile_builds;
	array_push($parsedresponse, $profile_builds);
}
http_response_code(200);
echo json_encode($parsedresponse);

?>