<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../account/auth/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
	http_response_code(200);
	echo '{"code":200, "error":"-", "message": {"status": true}}';
} else {
	http_response_code(200);
	echo '{"code":200, "error":"-", "message": {"status": false}}';
}

?>