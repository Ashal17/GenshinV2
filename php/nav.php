<?php

if(isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] === true){
	$account_str = $_SESSION["displayname"];
} else {
    $account_str = "Account";
}

echo'
    <div class="nav">
	    <a href="/" class="logo nav_btn"><span class="svg svg-ashal-fox"></span></a>
	    <a href="/equip" class="nav_btn"><span class="svg svg-sword-cross"></span>Equipment</a>
	    <div class="spacer"></div>
	    <a href="/account/" class="nav_btn"><span class="svg svg-account-circle"></span>' . $account_str . '</a>
        <a href="https://discord.gg/YC6KRvm" target="_blank" class="nav_btn nav_btn_thin"><span class="svg svg-discord"></span></a>
    </div>

    <div class="automatic" id="automatic">	
    </div>

    <div class="loader" id="loader">
        <div class="loader_circle"></div>
        <div class="loader_desc" id="loader_desc"></div>
        <div class="loader_error" id="loader_error">
            <div class="loader_error_text" id="loader_error_text">Error</div>
            <div class="loader_btn" onclick="utils_loading_hide()">Continue</div>
        </div>
    </div>
    <div class="overlay" id="loader_overlay"></div>
'
?>
