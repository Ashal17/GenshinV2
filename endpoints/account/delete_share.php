<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../php/account/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$user_id = $_SESSION["id"];
	$input = json_decode(file_get_contents("php://input"));
	$share_link = $input ->share_link;
	$errormessage = false;
	$errorcode = 500;

	$sql = "UPDATE genshin_shares SET active = 0 WHERE user_id = ? AND BINARY share_link = ?";
	if($stmt = mysqli_prepare($link, $sql)){
		mysqli_stmt_bind_param($stmt, "is", $param_userid, $param_link);
		$param_userid = $user_id;
		$param_link = $share_link;
		if (mysqli_stmt_execute($stmt)){
			$responseobj = array(
				"deleted_share" =>  $share_link,
			);
		} else {
			$errormessage = "Error when deleting Share";
		}
	} else {		
		$errormessage = "Error when deleting Share";
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
		echo '{"code":200, "error":"-", "message":' . json_encode($responseobj) .'}';
	}
				
	
}else{
	http_response_code(403);
	echo '{"code":403, "error":"Forbidden", "message":"You have been logged out. Please use \"Stay logged in\" option or relog before trying again."}';
}

?>