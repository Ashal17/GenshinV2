<?php

$url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$share_link = parse_url($url, PHP_URL_QUERY);

if ($share_link){
	$sql = "SELECT genshin_shares.character_name, genshin_shares.character_id, users.displayname, genshin_visions.color FROM genshin_shares INNER JOIN genshin_visions ON genshin_shares.vision = genshin_visions.name INNER JOIN users ON genshin_shares.user_id = users.id WHERE BINARY share_link = ? AND active = 1";

	if($stmt = mysqli_prepare($link, $sql)){

		mysqli_stmt_bind_param($stmt, "s", $param_link);
		$param_link = $share_link;
		if(mysqli_stmt_execute($stmt)){
			mysqli_stmt_store_result($stmt);
            if(mysqli_stmt_num_rows($stmt) == 1){
				mysqli_stmt_bind_result($stmt, $character_name, $character_id, $displayname, $color);
				if(mysqli_stmt_fetch($stmt)){
				echo'
	<meta property="og:site_name" content="Ashal.eu">
	<meta property="og:url" content="https://genshin.ashal.eu">
	<meta property="og:title" content="Genshin Calculator">
	<meta property="og:description" content="'. $character_name .' of '. $displayname .'">
	<meta property="og:type" content="website">
	<meta name="theme-color" content="#'.$color.'">
	<meta name="twitter:image" content="https://gtest.ashal.eu/images/icons/character/' . $character_id .'/char.png">
	<meta name="twitter:card" content="summary_large_image">
';
				}
				
			}
		}	
		
		mysqli_stmt_close($stmt);	
	}
	
}

?>