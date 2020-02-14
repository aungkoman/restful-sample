<?php
// this is middleware for user authentication and authorization
// 

use \Firebase\JWT\JWT; // declaring class
$jwt_password = $_SERVER['HTTP_JWT_PASSWORD']; // from enviroment variable

function middleware_super_user($request_data){
	global $jwt_password;
	$jwt = $request_data['jwt']; // the only data contained in SOLDIER object
	try{
		$decoded = JWT::decode($jwt, $jwt_password, array('HS256'));
		$decoded_array = (array) $decoded; // cast array 
		// admin role is 1 
		//echo "decoded array is ".$decoded_array['role'];
		if($decoded_array['role'] <= 3 ){
			// pass
		}
		else{
			return_fail("insufficient_role","At least super user role is needed");
		}
	}catch(\Exception $e){
		$str = 'Caught exception in JWT::decode : '.  $e->getMessage(). "\n";
		return_fail("invalid_jwt",$str);
	}
}
function middleware_normal_user($request_data){
	global $jwt_password;
	$jwt = $request_data['jwt']; // the only data contained in SOLDIER object
	try{
		$decoded = JWT::decode($jwt, $jwt_password, array('HS256'));
		$decoded_array = (array) $decoded; // cast array 
		// admin role is 1 
		if($decoded_array['role'] <= 2){
			// pass
		}else{
			return_fail("insufficient_role","At least normal role is needed");
		}
	}catch(\Exception $e){
		$str = 'Caught exception in JWT::decode : '.  $e->getMessage(). "\n";
		return_fail("invalid_jwt",$str);
	}
}
function middleware_system_user($request_data){
	global $jwt_password;
	$jwt = $request_data['jwt']; // the only data contained in SOLDIER object
	try{
		$decoded = JWT::decode($jwt, $jwt_password, array('HS256'));
		$decoded_array = (array) $decoded; // cast array 
		// admin role is 1 
		if($decoded_array['role'] != 1){
			return_fail("insufficient_role","Only System Admin can operate.");
		}
	}catch(\Exception $e){
		$str = 'Caught exception in JWT::decode : '.  $e->getMessage(). "\n";
		return_fail("invalid_jwt",$str);
	}
}
?>