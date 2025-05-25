<?php

session_start();

require_once "../../config/config_db.php";
require_once "../../php/account/token_auth.php";

header('Content-Type: application/json; charset=utf-8');

if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){

	$user_id = $_SESSION["id"];
	$input = json_decode(file_get_contents("php://input"));
	$share_object = $input ->share_object;
	$character_id = $input ->character_id;
	$character_name = $input ->character_name;
	$vision = $input ->vision;
	$errormessage = false;
	$errorcode = 500;

	if (strlen($input) > 1048576){
		$errorcode = 400;
		$errormessage = "Input data is too large: " . strlen($input) . "B";
	} else {
		$sql_count = "SELECT COUNT(id) FROM genshin_shares WHERE user_id = ? AND active = 1";

		if($stmt = mysqli_prepare($link, $sql_count)){
			mysqli_stmt_bind_param($stmt, "i", $param_userid);				
			$param_userid = $user_id;
			if (mysqli_stmt_execute($stmt)){
				mysqli_stmt_store_result($stmt);
				mysqli_stmt_bind_result($stmt, $count);
					if(mysqli_stmt_fetch($stmt)){
						if ($count < 100) {
							$characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
							do{
								$random_string = '';  
								for ($i = 0; $i < 10; $i++) { 
									$index = rand(0, strlen($characters) - 1); 
									$random_string .= $characters[$index]; 
								}

								$sql = "SELECT id FROM genshin_shares WHERE BINARY share_link = ?";
        
								if($stmt = mysqli_prepare($link, $sql)){
									mysqli_stmt_bind_param($stmt, "s", $param_link);
									$param_link = $random_string;           
									if(mysqli_stmt_execute($stmt)){
										mysqli_stmt_store_result($stmt);               
										if(mysqli_stmt_num_rows($stmt) == 1){
											$unique = false;
										} else{
											$unique = true;
										}
									} else{
										echo "Error when creating Share Link";
									}
								}
								mysqli_stmt_close($stmt);
							} while ($unique == false);

							$sql_insert = "INSERT INTO genshin_shares(user_id, share_link, share_object, character_id, character_name, vision, active) VALUES (?, ?, ?, ?, ?, ?, 1)";
							if($stmt = mysqli_prepare($link, $sql_insert)){
								mysqli_stmt_bind_param($stmt, "isssss", $param_userid, $param_link, $param_object, $param_characterid, $param_charactername, $param_vision);
								$param_userid = $user_id;
								$param_link = $random_string;
								$param_object = json_encode($share_object);
								$param_characterid = $character_id;
								$param_charactername = $character_name;
								$param_vision = $vision;
								if (mysqli_stmt_execute($stmt)){
									$responseobj=array(
										"share_link" => $random_string
									);
								} else {
									$errormessage = "Error when creating Share";
								}
							} else {		
								$errormessage = "Error when creating Share";
							}
						} else {
							$errormessage = "Reached Share limit. Delete some Shares before creating new one.";
						}
					} else {		
						$errormessage = "Error when reading query result";
					}							
			} else {		
				$errormessage = "Error when querying database";
			}
		} else {		
			$errormessage = "Error when querying database";
		}

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
		echo '{"code":200, "error":"-", "message":' . json_encode($responseobj) . '}';
	}
				
	
}else{
	http_response_code(403);
	echo '{"code":403, "error":"Forbidden", "message":"You have been logged out. Please use \"Stay logged in\" option or relog before trying again."}';
}

?>