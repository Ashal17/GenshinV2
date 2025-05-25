<?php

require_once "../config/config_db.php";

header('Content-Type: application/json; charset=utf-8');

$user_id = $_SESSION["id"];
$errormessage = false;
$errorcode = 500;
$sql = "SELECT share_object FROM genshin_shares WHERE BINARY share_link = ?";
$url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$share_link = parse_url($url, PHP_URL_QUERY);
	
if($stmt = mysqli_prepare($link, $sql)){
	mysqli_stmt_bind_param($stmt, "s", $param_link);				
	$param_link = $share_link;
	if (mysqli_stmt_execute($stmt)){
		mysqli_stmt_store_result($stmt);
			if(mysqli_stmt_num_rows($stmt) == 1){
				mysqli_stmt_bind_result($stmt, $share_object);
					if(mysqli_stmt_fetch($stmt)){
						$responseobj=array(
							"share_object" => json_decode($share_object)
						);
					} else {		
						$errormessage = "Error when reading query result";
					}				
			}else {
				$responseobj=array(
					"share_object" => null
				);
			} 			
	} else {		
		$errormessage = "Error when querying database";
	}
} else {		
	$errormessage = "Error when querying database";
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

?>