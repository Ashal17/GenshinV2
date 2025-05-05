<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../account/auth/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$user_id = $_SESSION["id"];
	$input = file_get_contents("php://input");
	$errormessage = false;
	$errorcode = 500;
	$sql = "UPDATE genshin_users SET artifact_storage_objects = ? WHERE id = ?";

	if($input){
		if($stmt = mysqli_prepare($link, $sql)){
			mysqli_stmt_bind_param($stmt, "si", $param_input, $param_userid);
			$param_userid = $user_id;
			$param_input = $input;
			if (mysqli_stmt_execute($stmt)){
				//success
			} else {
				$errormessage = "Error when updating artifact storage data";
			}
		} else {		
			$errormessage = "Error when updating artifact storage data";
		}

	} else {
		$errorcode = 400;
		$errormessage = "No artifact storage input data provided";
	}
	

	mysqli_close($link);				
	if ($errormessage) {
		if ($errorcode == 400) {
			http_response_code(400);
			echo '{"code":400, "error":"Bad Request", "message":"' . $errormessage . '"}';
		} else {
			http_response_code(500);
			echo '{"code":500, "error":"Internal Server Error", "message":"' . $errormessage . '"}';
		}		
	} else {
		http_response_code(200);
		echo '{"code":200, "error":"-", "message":"Success"}';
	}
				
	
}else{
	http_response_code(403);
	echo '{"code":403, "error":"Forbidden", "message":"You have been logged out. Please use \"Stay logged in\" option or relog before trying again."}';
}

?>