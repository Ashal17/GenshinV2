<?php
	$cookie_name = "authentication_token";
	if((!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) && isset($_COOKIE[$cookie_name])) {
		$sql = "SELECT users.id, users.username, users.wrong_password, users.role_id, users.admin_note, users_tokens.id, DATEDIFF(users_tokens.expire_at, CURDATE()) as expired FROM users INNER JOIN users_tokens ON users_tokens.user_id = users.id WHERE users_tokens.token = ?";
        
		if($stmt = mysqli_prepare($link, $sql)){
			mysqli_stmt_bind_param($stmt, "s", $param_token);
			$param_token = $_COOKIE[$cookie_name];

			if(mysqli_stmt_execute($stmt)){
				mysqli_stmt_store_result($stmt);
                
				if(mysqli_stmt_num_rows($stmt) == 1){                    
					mysqli_stmt_bind_result($stmt, $id, $username, $wrong_password, $role_id, $admin_note, $token_id ,$token_expire);
					if(mysqli_stmt_fetch($stmt)){
						
						$param_id = $id;
						$param_username = $username;

						if ($wrong_password < 5){
							if($token_expire > 0){

								$sql = "UPDATE users_tokens SET expire_at = (NOW() + INTERVAL 30 DAY) WHERE id = ?";

								if($stmt = mysqli_prepare($link, $sql)){
									mysqli_stmt_bind_param($stmt, "i", $param_token_id);
									$param_token_id = $token_id;
									mysqli_stmt_execute($stmt);
								}

								if($wrong_password > 0){
									$sql = "UPDATE users SET wrong_password = 0 WHERE id = ?";
    
									if($stmt = mysqli_prepare($link, $sql)){
										mysqli_stmt_bind_param($stmt, "i", $param_id);
										mysqli_stmt_execute($stmt);
									}
								}

								if($role_id > 0){
									$sql = "INSERT INTO action_log_logins (user_id, username, result, token) VALUES (?, ?, 5, ?)";

									if($stmt = mysqli_prepare($link, $sql)){
										mysqli_stmt_bind_param($stmt, "iss", $param_id, $param_username, $param_token);
										mysqli_stmt_execute($stmt);
									}

									setcookie($cookie_name, $param_token, time() + (86400 * 30), "/", "ashal.eu", true);

									require_once "login_setup.php";

								} else {
									$sql = "INSERT INTO action_log_logins (user_id, username, result, token) VALUES (?, ?, 3, ?)";

									if($stmt = mysqli_prepare($link, $sql)){
										mysqli_stmt_bind_param($stmt, "iss", $param_id, $param_username, $param_token);
										mysqli_stmt_execute($stmt);
									}
									setcookie($cookie_name, "", time() - 3600, "/", "ashal.eu", true);
									header("location: login");
									exit();
								}     
							} else {
								$sql = "INSERT INTO action_log_logins (user_id, username, result, token) VALUES (?, ?, 6, ?)";

								if($stmt = mysqli_prepare($link, $sql)){
									mysqli_stmt_bind_param($stmt, "iss", $param_id, $param_username, $param_token);
									mysqli_stmt_execute($stmt);
								}
								setcookie($cookie_name, "", time() - 3600, "/", "ashal.eu", true);
								header("location: login");
								exit();
							}
						} else {
							$sql = "INSERT INTO action_log_logins (user_id, username, result, token) VALUES (?, ?, 2, ?)";

							if($stmt = mysqli_prepare($link, $sql)){
								mysqli_stmt_bind_param($stmt, "iss", $param_id, $param_username, $param_token);
								mysqli_stmt_execute($stmt);
							}
							setcookie($cookie_name, "", time() - 3600, "/", "ashal.eu", true);
							header("location: login");
							exit();
						}  
					}
				} else {
					$sql = "INSERT INTO action_log_logins (user_id, username, result, token) VALUES (0, ?, 4, ?)";

					if($stmt = mysqli_prepare($link, $sql)){
						mysqli_stmt_bind_param($stmt, "ss", $param_username, $param_token);
						mysqli_stmt_execute($stmt);
					}
					setcookie($cookie_name, "", time() - 3600, "/", "ashal.eu", true);
					header("location: login");
					exit();
				}
			} else {
				echo "Oops! Something went wrong. Please try again later.";
			}
		} else {
			$password_err = "Oops! Something went wrong. Please try again later.";					
			mysqli_stmt_close($stmt);
		}
	}
?>