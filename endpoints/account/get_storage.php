<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../account/auth/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$user_id = $_SESSION["id"];
	$errormessage = false;
	$sql = "SELECT storage_objects, artifact_storage_objects, character_storage_objects FROM genshin_users WHERE id = ?";
	
	if($stmt = mysqli_prepare($link, $sql)){
		mysqli_stmt_bind_param($stmt, "i", $param_userid);				
		$param_userid = $user_id;
		if (mysqli_stmt_execute($stmt)){
			mysqli_stmt_store_result($stmt);
			if(mysqli_stmt_num_rows($stmt) == 1){
				mysqli_stmt_bind_result($stmt, $storage_objects, $artifact_storage_objects, $character_storage_objects);
					if(mysqli_stmt_fetch($stmt)){
						$responseobj=array(
							"storage_objects" => json_decode($storage_objects),
							"artifact_storage_objects" => json_decode($artifact_storage_objects),
							"character_storage_objects" => json_decode($character_storage_objects)
						);
					} else {		
						$errormessage = "Error when reading query result";
					}				
			 }else {
				$responseobj=array(
					"storage_objects" => null,
					"artifact_storage_objects" => null,
					"character_storage_objects" => null
				);

				$sqlinsert = "INSERT INTO genshin_users(id) VALUES (?)";
				if($stmt = mysqli_prepare($link, $sqlinsert)){
					mysqli_stmt_bind_param($stmt, "i", $param_userid);
					if (mysqli_stmt_execute($stmt)){
						//success
					} else {
						$errormessage = "Error when initializing data";
					}
				} else {		
					$errormessage = "Error when initializing data";
				}
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