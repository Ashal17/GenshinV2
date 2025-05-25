<?php
	session_start();
	require_once "config/config_db.php";
	require_once "php/account/token_auth.php";
?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>	
    <title>Ashal - Genshin</title>

	<?php
		require_once "php/header.php";
		require_once "php/dependencies/equip.php";
		require_once "php/meta.php";
	?>
</head>

<body class="dark_theme" onload="equip_setup_all();">

	<?php
		require_once "php/nav.php";
	?>

	<div class="main_window" id="main_window">
	</div>

</body>