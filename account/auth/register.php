<?php

$username = $displayname = $password = $confirm_password = "";
$username_err = $displayname_err = $password_err = $confirm_password_err = $recaptcha_err = "";

if($_SERVER["REQUEST_METHOD"] == "POST"){
    if ($_POST["register"]){
        if(empty(trim($_POST["username"]))){
            $username_err = "Please enter a username.";
        } else{
            $sql = "SELECT id FROM users WHERE username = ?";        
            if($stmt = mysqli_prepare($link, $sql)){
                mysqli_stmt_bind_param($stmt, "s", $param_username);
                $param_username = trim($_POST["username"]);
            
                if(mysqli_stmt_execute($stmt)){
                    mysqli_stmt_store_result($stmt);
                
                    if(mysqli_stmt_num_rows($stmt) == 1){
                        $username_err = "This username is already taken.";
                    } else{
                        $username = trim($_POST["username"]);
                    }
                } else{
                    echo "Oops! Something went wrong. Please try again later.";
                }
            }
            mysqli_stmt_close($stmt);
        }

	    if(empty(trim($_POST["displayname"]))){
            $displayname_err = "Please enter a name.";
        } else {
	        $displayname = trim($_POST["displayname"]);
	    }
    
        if(empty(trim($_POST["password"]))){
            $password_err = "Please enter a password.";     
        } elseif (strlen(trim($_POST["password"])) < 6){
            $password_err = "Password must have atleast 6 characters.";
        } else{
            $password = trim($_POST["password"]);
        }
    
        if(empty(trim($_POST["confirm_password"]))){
            $confirm_password_err = "Please confirm password.";     
        } else {
            $confirm_password = trim($_POST["confirm_password"]);
            if(empty($password_err) && ($password != $confirm_password)){
                $confirm_password_err = "Passwords do not match.";
            }
        }


        if(empty($_POST['g-recaptcha-response'])){
            $recaptcha_err = 'Captcha is required';
        } else {
            $response = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$secret_key.'&response='.$_POST['g-recaptcha-response']);
            $response_data = json_decode($response);
            if(!$response_data->success) {
                $recaptcha_err = 'Captcha verification failed';
            }
        }
    
        if(empty($username_err) && empty($displayname_err) && empty($password_err) && empty($confirm_password_err) && empty($recaptcha_err)){
            $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 

		    do {
		        $random_string = ''; 
  
		        for ($i = 0; $i < 5; $i++) { 
			        $index = rand(0, strlen($characters) - 1); 
			        $random_string .= $characters[$index]; 
		        }

		        $sql = "SELECT id FROM users WHERE usercode = ?";
        
                if($stmt = mysqli_prepare($link, $sql)){
                    mysqli_stmt_bind_param($stmt, "s", $param_usercode);
                    $param_usercode = $random_string;
                    if(mysqli_stmt_execute($stmt)){
                        mysqli_stmt_store_result($stmt);
                        if(mysqli_stmt_num_rows($stmt) == 1){
                            $unique = false;
                        } else{
                            $unique = true;
                        }
                    } else {
                        echo "Oops! Something went wrong. Please try again later. Rnd";
                    }
                }
                mysqli_stmt_close($stmt);
		    } while ($unique == false);

		    $color_id = rand(1,12);
		    $color = "";
		    $sql = "SELECT color FROM CT_user_colors WHERE id = ?";        
            if($stmt = mysqli_prepare($link, $sql)){
                mysqli_stmt_bind_param($stmt, "i", $param_colorid);
                $param_colorid = $color_id;
                if(mysqli_stmt_execute($stmt)){
                    mysqli_stmt_store_result($stmt);
				    mysqli_stmt_bind_result($stmt, $color);
                        mysqli_stmt_fetch($stmt);
				}
            }
        
            $sql = "INSERT INTO users (username, password, displayname, server_id, usercode) VALUES (?, ?, ?, 1, ?)";         
            if($stmt = mysqli_prepare($link, $sql)){
                mysqli_stmt_bind_param($stmt, "ssss", $param_username, $param_password, $param_displayname, $param_usercode);
                $param_username = $username;
			    $param_displayname = htmlspecialchars($displayname);
                $param_password = password_hash($password, PASSWORD_DEFAULT);
			    $param_usercode = $random_string;
                if(mysqli_stmt_execute($stmt)){
                    $sql = "SELECT id FROM users WHERE username = ?";
        
                    if($stmt = mysqli_prepare($link, $sql)){
                        mysqli_stmt_bind_param($stmt, "s", $param_username);
                        $param_username = $username;

                        if(mysqli_stmt_execute($stmt)){
                            mysqli_stmt_store_result($stmt);
                            if(mysqli_stmt_num_rows($stmt) == 1){                    
                                 mysqli_stmt_bind_result($stmt, $id);
                                if(mysqli_stmt_fetch($stmt)){
							        $sql = "INSERT INTO action_log_logins (user_id, result) VALUES (?, 1)";
    
							        $param_id = $id;
							        if($stmt = mysqli_prepare($link, $sql)){
							            mysqli_stmt_bind_param($stmt, "i", $param_id);
							            mysqli_stmt_execute($stmt);
							        }
                                    
                                    require_once "login_setup.php";                            
                                    require_once "token_setup.php";

                                    header("location: /account/");
							        exit();
                                } 
                            } else {
                                echo "Oops! Something went wrong. Please try again later.";
                            }
                        } else {
                            echo "Oops! Something went wrong. Please try again later.";
                        }
                    } else {
                        echo "Oops! Something went wrong. Please try again later.";
                    }
                } else {
                    echo "Oops! Something went wrong. Please try again later.";
                }
            }         
            mysqli_stmt_close($stmt);
        }    
    }
}
?>