<?php
	session_start();
	$_SESSION = array();
	session_destroy();

	$cookie_name = "authentication_token";

	if (isset($_COOKIE[$cookie_name])){
		require_once "../config/config_db.php";

		setcookie($cookie_name, "", time() - 3600, "/", "ashal.eu", true);
		$sql = "UPDATE users_tokens SET expire_at = NOW() WHERE token = ?";
		if($stmt = mysqli_prepare($link, $sql)){
			mysqli_stmt_bind_param($stmt, "s", $param_token);
			$param_token = $_COOKIE[$cookie_name];
			mysqli_stmt_execute($stmt);
		}
	}

	header("location: login");
	exit();
?>