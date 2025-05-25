<?php
	session_start();
	require_once "../config/config_db.php";
	require_once "../php/account/token_auth.php";

	if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
		header("location: login");
		exit();
	}

	$new_password = $confirm_password = "";
	$displayname = $_SESSION["displayname"];
	$new_password_err = $confirm_password_err = $displayname_err = "";

	if($_SERVER["REQUEST_METHOD"] == "POST"){
		if($_POST['owner_info']) {
			if(!empty(trim($_POST["displayname"]))){
				$displayname = trim($_POST["displayname"]); 
				$sql = "UPDATE users SET displayname = ? WHERE id = ?";
				if($stmt = mysqli_prepare($link, $sql)){
					mysqli_stmt_bind_param($stmt, "si", $param_displayname, $param_id);
					$param_displayname = htmlspecialchars($displayname);
					$param_id = $_SESSION["id"];
						if(mysqli_stmt_execute($stmt)){
							$_SESSION["displayname"] = $displayname;
						} else{
							echo "Oops! Something went wrong. Please try again later.";
						}
					mysqli_stmt_close($stmt);
				}
			}

			if(!empty(trim($_POST["new_password"]))){
				if(strlen(trim($_POST["new_password"])) < 6){
					$new_password_err = "Password must have atleast 6 characters.";
				} else{
					$new_password = trim($_POST["new_password"]);
				}
				if(empty(trim($_POST["confirm_password"]))){
					$confirm_password_err = "Please confirm the password.";
				} else{
					$confirm_password = trim($_POST["confirm_password"]);
					if(empty($new_password_err) && ($new_password != $confirm_password)){
						$confirm_password_err = "Passwords do not match.";
					}
				}

				if(empty($new_password_err) && empty($confirm_password_err)){
					$sql = "UPDATE users SET password = ? WHERE id = ?";        
					if($stmt = mysqli_prepare($link, $sql)){
						mysqli_stmt_bind_param($stmt, "si", $param_password, $param_id);
            
						$param_password = password_hash($new_password, PASSWORD_DEFAULT);
						$param_id = $_SESSION["id"];
						if(mysqli_stmt_execute($stmt)){

						} else{
							echo "Oops! Something went wrong. Please try again later.";
						}
						mysqli_stmt_close($stmt);
					}					
				}   
			}		
		}
	}
?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>	
    <title>Ashal - Genshin</title>

	<?php
		require_once "../php/header.php";
		require_once "../php/dependencies/account.php";
	?>

</head>

<body class="dark_theme" onload="utils_loading_hide()">

	<?php
		require_once "../php/nav.php";
	?>

	<div class="main_window account_window" id="main_window">
		<form action="<?php echo basename($_SERVER['PHP_SELF'],'.php'); ?>" method="post" class="account_form frame_window">
			<div class="frame_window_header">
				<div class="frame_window_header_text">
					My Account
				</div>
				<div class="img_button">
					<a class="img_icon svg svg-logout-variant" href="logout"></a>
					<div class="img_button_hover">Logout</div>
				</div>
			</div>
			<div class="form_entry">
				<p>Username</p>
				<p class="form_text"><?php echo $_SESSION["username"]; ?></p>
			</div>
			<div class="form_entry">
				<p>Usercode</p>
				<p class="form_text"><?php echo $_SESSION["usercode"]; ?></p>
			</div>
			<div class="form_entry">
				<p>Role</p>
				<p class="form_text"><?php echo $_SESSION["role_name"]; ?></p>
			</div>
			<div class="form_entry">
				<label>Displayed name</label>
				<input type="text" name="displayname" value="<?php echo $displayname; ?>">
			</div>
			<div class="form_entry form_error">
				<?php echo $displayname_err; ?>
			</div>  
			<div class="form_entry">
				<label>New Password</label>
				<input type="password" name="new_password"  class="form_input">
			</div>
			<div class="form_entry form_error">
				<?php echo $new_password_err; ?>
			</div>
			<div class="form_entry">
				<label>Confirm Password</label>
				<input type="password" name="confirm_password"  class="form_input">
			</div>
			<div class="form_entry form_error">
				<?php echo $confirm_password_err; ?>
			</div>
			<div class="form_entry">
				<input type="submit" name="owner_info" class="form_button" value="Update">
			</div>
		</form>
	</div>

</body>