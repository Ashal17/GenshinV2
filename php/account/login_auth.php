<?php

$login_username = $password = "";
$login_username_err = $login_password_err = "";
 
if($_SERVER["REQUEST_METHOD"] == "POST"){
	if ($_POST["login"]) {
		if(empty(trim($_POST["username"]))){
			$login_username_err = "Please enter username.";
		} else{
			$login_username = trim($_POST["username"]);
		}
    
		if(empty(trim($_POST["password"]))){
			$login_password_err = "Please enter your password.";
		} else{
			$password = trim($_POST["password"]);
		}

		if(empty($login_username_err) && empty($login_password_err)){

			$sql = "SELECT users.id, users.username, users.password, users.wrong_password, users.role_id, users.admin_note FROM users WHERE username = ?";
        
			if($stmt = mysqli_prepare($link, $sql)){
				mysqli_stmt_bind_param($stmt, "s", $param_username);
				$param_username = $login_username;

				if(mysqli_stmt_execute($stmt)){
					mysqli_stmt_store_result($stmt);

					if(mysqli_stmt_num_rows($stmt) == 1){                    
						mysqli_stmt_bind_result($stmt, $id, $login_username, $hashed_password, $wrong_password, $role_id, $admin_note);
						if(mysqli_stmt_fetch($stmt)){
						
							$param_id = $id;
							$param_username = $login_username;

							if ($wrong_password < 5){
								if(password_verify($password, $hashed_password)){

									if($wrong_password > 0){
										$sql = "UPDATE users SET wrong_password = 0 WHERE id = ?";
    
										if($stmt = mysqli_prepare($link, $sql)){
											mysqli_stmt_bind_param($stmt, "i", $param_id);
											mysqli_stmt_execute($stmt);
										}
									}

									if($role_id > 0){

										$sql = "INSERT INTO action_log_logins (user_id, username, result) VALUES (?, ?, 1)";

										if($stmt = mysqli_prepare($link, $sql)){
											mysqli_stmt_bind_param($stmt, "is", $param_id, $param_username);
											mysqli_stmt_execute($stmt);
										}

										require_once "login_setup.php";
										require_once "token_setup.php";
																				
									} else {
										$login_password_err = "The account has been Banned<br>Reason: " . $admin_note;

										$sql = "INSERT INTO action_log_logins (user_id, username, result) VALUES (?, ?, 3)";

										if($stmt = mysqli_prepare($link, $sql)){
											mysqli_stmt_bind_param($stmt, "is", $param_id, $param_username);
											mysqli_stmt_execute($stmt);
										}
									}

								} else {
									$login_password_err = "The account/password is not valid. If you forgot your password, contact an  <a href='https://ashal.eu/market/contacts'  class='shop_link'>administrator</a>.";
									$sql = "UPDATE users SET wrong_password = wrong_password + 1 WHERE id = ?";
    
									if($stmt = mysqli_prepare($link, $sql)){
										mysqli_stmt_bind_param($stmt, "i", $param_id);
										mysqli_stmt_execute($stmt);
									}

									$sql = "INSERT INTO action_log_logins (user_id, username, result) VALUES (?, ?, 0)";

									if($stmt = mysqli_prepare($link, $sql)){
										mysqli_stmt_bind_param($stmt, "is", $param_id, $param_username);
										mysqli_stmt_execute($stmt);
									}
								}
							} else {
								$login_password_err = "Account has been blocked due to too many unsucessful login attemtps. Please contact an  <a href='https://ashal.eu/market/contacts'  class='shop_link'>administrator</a>.";
								$sql = "UPDATE users SET wrong_password = wrong_password + 1 WHERE id = ?";
    
								if($stmt = mysqli_prepare($link, $sql)){
									mysqli_stmt_bind_param($stmt, "i", $param_id);
									mysqli_stmt_execute($stmt);
								}

								$sql = "INSERT INTO action_log_logins (user_id, username, result) VALUES (?, ?, 2)";

								if($stmt = mysqli_prepare($link, $sql)){
									mysqli_stmt_bind_param($stmt, "is", $param_id, $param_username);
									mysqli_stmt_execute($stmt);
								}
							}
						}
					} else {
						$login_password_err = "The account/password is not valid. If you forgot your password, contact an  <a href='https://ashal.eu/market/contacts'  class='shop_link'>administrator</a>.";	

						$sql = "INSERT INTO action_log_logins (user_id, username, result) VALUES (0, ?, 7)";
						$param_username = $login_username;
						if($stmt = mysqli_prepare($link, $sql)){
							mysqli_stmt_bind_param($stmt, "s", $param_username);
							mysqli_stmt_execute($stmt);
						}
					}
				} else {
					echo "Oops! Something went wrong. Please try again later.";
				}
			} else {
				$login_password_err = "Oops! Something went wrong. Please try again later.";					
			}
			mysqli_stmt_close($stmt);
		}
	}  
}
?>