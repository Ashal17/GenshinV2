<?php
	session_start();
	require_once "../config/config_db.php";
	require_once "../config/config_recaptcha.php";
	require_once "../php/account/token_auth.php";
	require_once "../php/account/register.php";
	require_once "../php/account/login_auth.php";

	if(isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] === true){
		header("location: /account/");
		exit();
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
	<script type="text/javascript">
		var onloadCallback = function() {
			grecaptcha.render('html_element', {
				'sitekey': '6Ldest8UAAAAAIuvkPsKQY474-rnNlZ3tq1Au7kp',
				'theme' : 'dark'
			});
		}; 
    </script>
</head>

<body class="dark_theme" onload="utils_loading_hide()">

	<?php
		require_once "../php/nav.php";
	?>

	<div class="main_window account_window" id="main_window">
		<form action="<?php echo basename($_SERVER['PHP_SELF'],'.php'); ?>" method="post" class="account_form frame_window">
			<div class="frame_window_header">
				<div class="frame_window_header_text">
					Login
				</div>
			</div>
			<div class="form_entry">
				<label>Username</label>
				<input type="text" name="username" value="<?php echo $login_username; ?>">
			</div>
			<div class="form_entry form_error">
				<?php echo $login_username_err; ?>
			</div>  
			<div class="form_entry">
				<label>Password</label>
				<input type="password" name="password">
			</div>
			<div class="form_entry form_error">
				<?php echo $login_password_err; ?>
			</div>
			<div class="form_entry">
				<input type="submit" name="login" class="form_button" value="Login">
			</div>
		</form>

		<form action="<?php echo basename($_SERVER['PHP_SELF'],'.php'); ?>" method="post" class="account_form frame_window">
			<div class="frame_window_header">
				<div class="frame_window_header_text">
					Register
				</div>
			</div>
			<div class="form_entry">
				<label>Username</label>
				<input type="text" name="username" class="form_input" value="<?php echo $username; ?>">
			</div>
			<div class="form_entry form_error">
				<?php echo $username_err; ?>
			</div>
			<div class="form_entry">
				<label>Displayed name</label>
				<input type="text" name="displayname" class="form_input" value="<?php echo $displayname; ?>">
			</div>
			<div class="form_entry form_error">
				<?php echo $displayname_err; ?>
			</div>
			<div class="form_entry">
				<label>Password</label>
				<input type="password" name="password"  class="form_input">
			</div>
			<div class="form_entry form_error">
				<?php echo $password_err; ?>
			</div>
			<div class="form_entry">
				<label>Confirm Password</label>
				<input type="password" name="confirm_password"  class="form_input">
			</div>
			<div class="form_entry form_error">
				<?php echo $confirm_password_err; ?>
			</div>
			<div class="form_entry">
				<div class="form_recaptcha" id="html_element"></div>
			</div>
			<div class="form_entry form_error">
				<?php echo $recaptcha_err; ?>
			</div>
			<div class="form_entry">
				<input type="submit" name="register" class="form_button" value="Register">
			</div>
		</form>

		<script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
			async defer>
		</script>

		<div class="account_form frame_window">
			<div class="frame_window_header">
				<div class="frame_window_header_text">
					Rules
				</div>
			</div>
			<div class="form_entry">
				Username is used only for login into your account and is not shown anywhere
			</div>
			<div class="form_entry">
				Displayed name can be shown to other users and can be changed at any time
			</div>
			<div class="form_entry">
				Passwords must be at least 6 characters long
			</div>
			<div class="form_entry">
				This website is not affiliated with Mihoyo/Genshin Impact Official and uses its own account for some features.
			</div>
			<div class="form_entry">
				For your own safety, do not use username/password that you use for Mihoyo/Genshin Impact/other accounts
			</div>
			<div class="form_entry">
				By registering you agree that any information you enter will be stored and linked to you account.
			</div>
		</div>
	</div>

</body>