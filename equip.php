<?php
session_start();
?>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>	
    <title>Ashal - Genshin</title>

<?php
	require_once "header.php";
	require_once "dependencies/equip.php";
?>
</head>

<body class="dark_theme" onload="equip_setup_all()">

<?php
	require_once "nav.php";
?>

<div class="main_window" id="main_window" >

</div>

</body>