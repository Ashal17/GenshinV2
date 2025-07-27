<?php
do{
	$token = bin2hex(random_bytes(64));

	$sql = "SELECT id FROM users_tokens WHERE token = ?";
        
	if($stmt = mysqli_prepare($link, $sql)){
		mysqli_stmt_bind_param($stmt, "s", $param_token);           
		$param_token = $token;

		if(mysqli_stmt_execute($stmt)){
			mysqli_stmt_store_result($stmt);
                
			if(mysqli_stmt_num_rows($stmt) == 1){
				$unique = false;
			} else{
				$unique = true;
			}
		} else{
			echo "Oops! Something went wrong. Please try again later. Rnd";
		}
	}
         
	mysqli_stmt_close($stmt);

} while ($unique == false);

$sql = "INSERT INTO users_tokens (user_id, token, created_at, expire_at) VALUES (?, ?, NOW(), NOW() + INTERVAL 30 DAY)";

if($stmt = mysqli_prepare($link, $sql)){

	mysqli_stmt_bind_param($stmt, "is", $param_id, $param_token);
	$param_token = $token;
	$param_id = $id;
	if (mysqli_stmt_execute($stmt)){
		$cookie_name = "authentication_token";
		$cookie_value = $token;
		setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/", "ashal.eu", true);
	}
}
?>