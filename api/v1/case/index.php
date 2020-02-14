<?php
ini_set("allow_url_fopen", true);
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
include('../../../config/return_function.php');
include('../../../config/conn.php');
include('../../../model/MEDICINE_CASE.php');
include('../../../middleware/user_middleware.php');

$medicine_case = new MEDICINE_CASE($conn);
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
	case 'POST':
        $request_data = $_POST;
        //print_r($request_data);
        $ops_type = (string) isset($request_data['ops_type']) ? $request_data['ops_type'] :  null;
        //echo $ops_type;
        switch ($ops_type){
            case 'gopd_military_personnel':
                $medicine_case->gopd_military_personnel($request_data);
                break;
            case 'sopd_military_personnel':
                $medicine_case->sopd_military_personnel($request_data);
                break;
            case 'admission_military_personnel':
                $medicine_case->admission_military_personnel($request_data);
                break;
            case 'dismiss_military_personnel':
                $medicine_case->dismiss_military_personnel($request_data);
                break;
            case 'gopd_relation_personnel':
                $medicine_case->gopd_relation_personnel($request_data);
                break;
            case 'sopd_relation_personnel':
                $medicine_case->sopd_relation_personnel($request_data);
                break;
            default :
                return_fail('unknow_ops_type',$ops_type);
                break;
        }
        break;
	default:
		# code...
		//echo "undefined method =>".$method;
		return_fail("unknow_method",$method);
		break;
}
?>