<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../php/account/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$user_id = $_SESSION["id"];
	$errormessage = false;
	$sql = "SELECT share_link, share_object FROM genshin_shares WHERE user_id = ? AND active = 1";
	
	if($stmt = mysqli_prepare($link, $sql)){
		mysqli_stmt_bind_param($stmt, "i", $param_userid);				
		$param_userid = $user_id;
		if (mysqli_stmt_execute($stmt)){
			$result = mysqli_stmt_get_result($stmt);
			$responseobj = array(
				"saved_shares" =>  array(),
			);
			if(mysqli_num_rows($result) > 0){
				$index = 0;
                while($row = mysqli_fetch_array($result)){
					$responseobj["saved_shares"][$index] = array(
						"share_link" =>  $row['share_link'],
						"share_object" =>  json_decode($row['share_object']),
					);
					$index = $index + 1;
                }
				mysqli_free_result($result);
			} 			
		} else {		
			$errormessage = "Error when querying database";
		}
	} else {		
		$errormessage = "Error when querying database";
	}
	
	
	mysqli_close($link);				
	if ($errormessage) {
		http_response_code(500);
		echo '{"code":500, "error":"Internal Server Error", "message":"' . $errormessage . '"}';
	} else {
		http_response_code(200);
		echo '{"code":200, "error":"-", "message":' . json_encode($responseobj) .'}';
	}
				
	
}else{
	http_response_code(403);
	echo '{"code":403, "error":"Forbidden", "message":"You have been logged out. Please use \"Stay logged in\" option or relog before trying again."}';
}
?>