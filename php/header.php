<?php
$favicon_ver = 20241106;
$imports_ver = 20241106;
$styles_ver = 20241106;
$javascript_utils_ver = 20241106;
$javascript_logic_ver = 20241106;
$javascript_resources_ver = 20241106;

echo '
	<meta charset="UTF-8" />
	<link rel="icon" href="/favicon.ico?' . $favicon_ver .'" type="image/x-icon" sizes="16x16" />

	<link rel="stylesheet" type="text/css" href="/styles/main.css?' . $styles_ver .'" media="screen" />	
	<link rel="stylesheet" type="text/css" href="/styles/svg.css?' . $styles_ver .'" media="screen" />	

	<script src="/javascript/utils/controls.js?' . $javascript_utils_ver .'"></script>
	<script src="/javascript/utils/calls.js?' . $javascript_utils_ver .'"></script>
	<script src="/javascript/utils/generic.js?' . $javascript_utils_ver .'"></script>

	<script src="/javascript/utils/analytics.js?' . $javascript_utils_ver .'"></script>
	<script>utils_analytics_send()</script>
';
?>