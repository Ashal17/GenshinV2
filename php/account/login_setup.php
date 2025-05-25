<?php

    $sql = "SELECT users.username, users.server_id, users.color_id, CT_user_colors.color, users.post_paging, users.role_id, CT_roles.role, users.displayname, users.contact, users.contact_discord, users.admin_note, users.usercode, CT_roles.post_limit, users.post_count, CT_roles.post_limit_tears, users.post_count_tears, CT_roles.highlight_limit, users.highlight_count_sell, users.highlight_count_buy, users.highlight_count_tears_sell, users.highlight_count_tears_buy FROM users INNER JOIN CT_roles ON users.role_id = CT_roles.id INNER JOIN CT_user_colors ON users.color_id = CT_user_colors.id WHERE users.id = ?";

	if($stmt = mysqli_prepare($link, $sql)){
		mysqli_stmt_bind_param($stmt, "i", $param_id);

		if(mysqli_stmt_execute($stmt)){
			mysqli_stmt_store_result($stmt);
                
			if(mysqli_stmt_num_rows($stmt) == 1){                    
				mysqli_stmt_bind_result($stmt, $username, $server_id, $color_id, $color, $post_paging, $role_id, $role_name, $displayname, $contact, $contact_discord, $admin_note, $usercode, $post_limit, $post_count, $post_limit_tears, $post_count_tears, $highlight_limit, $highlight_count_sell, $highlight_count_buy, $highlight_count_tears_sell, $highlight_count_tears_buy);
				if(mysqli_stmt_fetch($stmt)){

					session_start();
					$_SESSION["loggedin"] = true;
					$_SESSION["id"] = $id;
					$_SESSION["username"] = htmlspecialchars($username);
					$_SESSION["role_id"] = $role_id;
					$_SESSION["role_name"] = $role_name;
					$_SESSION["displayname"] = $displayname;
					$_SESSION["contact"] = $contact;
					$_SESSION["contact_discord"] = $contact_discord;
					$_SESSION["server_id"] = $server_id;
					$_SESSION["color_id"] = $color_id;
					$_SESSION["color"] = $color;
					$_SESSION["post_paging"] = $post_paging;
					$_SESSION["admin_note"] = $admin_note;
					$_SESSION["usercode"] = $usercode;
					$_SESSION["post_limit"] = $post_limit;
					$_SESSION["post_count"] = $post_count;
					$_SESSION["post_limit_tears"] = $post_limit_tears;
					$_SESSION["post_count_tears"] = $post_count_tears;
					$_SESSION["highlight_limit"] = $highlight_limit;
					$_SESSION["highlight_sell"] = $highlight_count_sell;
					$_SESSION["highlight_buy"] = $highlight_count_buy;
					$_SESSION["highlight_tears_sell"] = $highlight_count_tears_sell;
					$_SESSION["highlight_tears_buy"] = $highlight_count_tears_buy;

				}
			}
		}
	}
?>