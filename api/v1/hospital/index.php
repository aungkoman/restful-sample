<?php
ini_set("allow_url_fopen", true);
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

require '../../../vendor/autoload.php'; // initialize composer library
use \Firebase\JWT\JWT; // declaring class
$jwt_password = $_SERVER['HTTP_JWT_PASSWORD']; // from enviroment variable

include('../../../config/return_function.php');
include('../../../config/conn.php');
include('../../../model/HOSPITAL.php');
include('../../../middleware/user_middleware.php');

$hospital = new HOSPITAL($conn);
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'POST':
        $request_data = $_POST;
        $ops_type = (string) isset($request_data['ops_type']) ? $request_data['ops_type'] :  null;
        switch ($ops_type){
            case 'selectAll':
                $hospital->selectAll();
                break;
            default :
                return_fail('unknow_ops_type',$ops_type);
                break;
        }
        break;
	default:
		return_fail("unknow_method",$method);
		break;
}
?>