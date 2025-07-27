<?php

if ( strlen(substr($_SERVER['REQUEST_URI'], 1)) >= 0)
{
	header("location: equip" . substr($_SERVER['REQUEST_URI'], 1));
    exit();
}

?>