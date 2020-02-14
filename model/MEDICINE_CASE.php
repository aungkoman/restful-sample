<?php
class MEDICINE_CASE
{
public function __construct($conn){
  $this->conn = $conn;
}

// 1. GOPD for Military Personnel
public function gopd_military_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;


  $tblpatientrecord = array();
  $tblrefer = array();
  /* Working sql query

    SELECT tblpatientrecord.PatientID, Date(tblpatientrecord.RgDate) AS start_date, tblhospital.Name AS hospital, military_personnel.* FROM tblpatientrecord, tblhospital, military_personnel WHERE Date(tblpatientrecord.RgDate) >= '2020-01-01' AND Date(tblpatientrecord.RgDate) <= '2020-02-28' AND tblpatientrecord.hospitalCode = tblhospital.Code AND tblpatientrecord.PatientID = military_personnel.patient_id

    SELECT tblpatientrecord.PatientID,
      Date(tblpatientrecord.RgDate) AS start_date,
      tblhospital.Name AS hospital,
      military_personnel.*
    FROM 
      tblpatientrecord,
      tblhospital,
      military_personnel
    WHERE 
      Date(tblpatientrecord.RgDate) >= '2020-01-01' AND
      Date(tblpatientrecord.RgDate) <= '2020-02-28' AND
      tblpatientrecord.hospitalCode = tblhospital.Code AND
      tblpatientrecord.PatientID = military_personnel.patient_id;

  */
  //$sql = "SELECT * FROM tblpatientrecord WHERE DATE(RgDate) >= ?  AND DATE(RgDate) <= ?";

  $sql = "SELECT tblpatientrecord.PatientID, Date(tblpatientrecord.RgDate) AS start_date, tblhospital.Name AS hospital_name, military_personnel.* FROM tblpatientrecord, tblhospital, military_personnel WHERE Date(tblpatientrecord.RgDate) >= ? AND Date(tblpatientrecord.RgDate) <= ? AND tblpatientrecord.hospitalCode = tblhospital.Code AND tblpatientrecord.PatientID = military_personnel.patient_id AND tblhospital.Code = ? AND tblpatientrecord.IsSelfOrNot = 'self'";

  
  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT tblpatientrecord.PatientID, Date(tblpatientrecord.RgDate) AS start_date, tblhospital.Name AS hospital_name, military_personnel.* FROM tblpatientrecord, tblhospital, military_personnel WHERE Date(tblpatientrecord.RgDate) >= ? AND Date(tblpatientrecord.RgDate) <= ? AND tblpatientrecord.hospitalCode = tblhospital.Code AND tblpatientrecord.PatientID = military_personnel.patient_id AND tblhospital.Code != ? AND tblpatientrecord.IsSelfOrNot = 'self'";
  }

  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed gopd_military_personnel',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed gopd_military_personnel', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed gopd_military_personnel',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $tblpatientrecord = $result->fetch_all(MYSQLI_ASSOC);
    //return_success("gopd_military_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data gopd_military_personnel',"there is no data for that query");
  }


  // 2. select * from tblrefer
  /* working sql for tblrefer patient id 
    SELECT tblrefer.PatientID FROM tblrefer WHERE Date(tblrefer.admission_date) >= '2020-01-01' AND Date(tblrefer.admission_date) <= '2020-02-28'

    SELECT tblrefer.PatientID FROM tblrefer WHERE Date(tblrefer.admission_date) >= '2020-01-01' AND Date(tblrefer.admission_date) <= '2020-02-28'

  */
  $sql = "SELECT tblrefer.PatientID FROM tblrefer WHERE Date(tblrefer.admission_date) >= ? AND Date(tblrefer.admission_date) <= ?";
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed gopd_military_personnel tblrefer',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("ss",$start_date,$end_date);
  if ( false===$rc ) {
    return_fail('bind_param_failed gopd_military_personnel tblrefer', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed gopd_military_personnel tblrefer',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $tblrefer = $result->fetch_all(MYSQLI_ASSOC);
    //return_success("gopd_military_personnel",$data);
  }else{
    # we should not return , because may be today is no sopd or admission, but can have gopd
  }
  // 3 loop here
  
  $final_result = $tblpatientrecord;
  for($i = 0 ; $i < count($tblrefer); $i++){
    $patient_record = $tblrefer[$i]['PatientID'];
    $found = "0";
    for($j = 0 ; $j < count($tblpatientrecord); $j++){
      //echo "\n ".$patient_record.  " : ".$tblpatientrecord[$j]['PatientID'];
      if($patient_record == $tblpatientrecord[$j]['PatientID']){
          $found = "1";
          unset($final_result[$j]);
      }
    }
  }
  // final result to array
  $return_num_array = array();
  foreach($final_result AS $key=>$val){
    $return_num_array[] = $final_result[$key];
  }
  //$return_data = array($tblpatientrecord,$tblrefer,$final_result,$return_num_array);
  return_success("gopd_military_personnel success",$return_num_array);
}
// 2. SOPD for Military Personnel
public function sopd_military_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;

  $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, military_personnel.* FROM tblhospital, tblrefer, military_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'SOPD' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = military_personnel.patient_id AND tblhospital.Code = ?";
  
  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, military_personnel.* FROM tblhospital, tblrefer, military_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'SOPD' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = military_personnel.patient_id AND tblhospital.Code != ?";
  }
  
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $return_data = array(true,$data);
    return_success("sopd_military_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data',"there is no data for that query");
  }
}
// 3. Admission for Military Personnel
public function admission_military_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;

  $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, military_personnel.* FROM tblhospital, tblrefer, military_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'Admission' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = military_personnel.patient_id AND tblhospital.Code = ?";
  
  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, military_personnel.* FROM tblhospital, tblrefer, military_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'Admission' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = military_personnel.patient_id AND tblhospital.Code != ?";
  }
  
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed admission_military_personnel',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed admission_military_personnel', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed admission_military_personnel',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $return_data = array(true,$data);
    return_success("admission_military_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data admission_military_personnel',"there is no data for that query");
  }
}
// 4. Dismiss for Military Personnel
public function dismiss_military_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;

  $sql = "SELECT tbl_casesummary.AdmissionDiagnosis AS disease_name, tbl_casesummary.Doa AS start_date, tbl_casesummary.DC AS end_date, tblhospital.Name AS hospital_name, military_personnel.* FROM tbl_casesummary, tblhospital, military_personnel WHERE Date(tbl_casesummary.Doa) >= ? AND Date(tbl_casesummary.Doa) <= ? AND tbl_casesummary.hospitalCode = tblhospital.Code AND tbl_casesummary.case_PatientID = military_personnel.patient_id AND tblhospital.Code = ?";
  
  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT tbl_casesummary.AdmissionDiagnosis AS disease_name, tbl_casesummary.Doa AS start_date, tbl_casesummary.DC AS end_date, tblhospital.Name AS hospital_name, military_personnel.* FROM tbl_casesummary, tblhospital, military_personnel WHERE Date(tbl_casesummary.Doa) >= ? AND Date(tbl_casesummary.Doa) <= ? AND tbl_casesummary.hospitalCode = tblhospital.Code AND tbl_casesummary.case_PatientID = military_personnel.patient_id AND tblhospital.Code != ?";
  }
  
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed dismiss_military_personnel',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed dismiss_military_personnel', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed dismiss_military_personnel',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $return_data = array(true,$data);
    return_success("dismiss_military_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data dismiss_military_personnel',"there is no data for that query");
  }
}

// 5. GOPD for Relation Personnel
public function gopd_relation_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;
  $tblpatientrecord = array();
  $tblrefer = array();
  $sql = "SELECT DATE(t1.RgDate) as start_date, t2.Name as hospital_name, t3.* FROM tblpatientrecord AS t1, tblhospital AS t2, relation_personnel AS t3 WHERE DATE(t1.RgDate) >= ? AND DATE(t1.RgDate) <= ? AND t2.Code = ? AND t1.hospitalCode = t2.Code AND t3.patient_id = t1.PatientID";

  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT DATE(t1.RgDate) as start_date, t2.Name as hospital_name, t3.* FROM tblpatientrecord AS t1, tblhospital AS t2, relation_personnel AS t3 WHERE DATE(t1.RgDate) >= ? AND DATE(t1.RgDate) <= ? AND t2.Code != ? AND t1.hospitalCode = t2.Code AND t3.patient_id = t1.PatientID";
  }

  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed gopd_relation_personnel',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed gopd_relation_personnel', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed gopd_relation_personnel',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $tblpatientrecord = $result->fetch_all(MYSQLI_ASSOC);
    //return_success("gopd_military_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data gopd_relation_personnel',"there is no data for that query");
  }


  // 2. select * from tblrefer
  /* working sql for tblrefer patient id 
    SELECT tblrefer.PatientID FROM tblrefer WHERE Date(tblrefer.admission_date) >= '2020-01-01' AND Date(tblrefer.admission_date) <= '2020-02-28'

    SELECT tblrefer.PatientID FROM tblrefer WHERE Date(tblrefer.admission_date) >= '2020-01-01' AND Date(tblrefer.admission_date) <= '2020-02-28'

  */
  $sql = "SELECT t1.PatientID as patient_id FROM tblrefer AS t1 WHERE DATE(t1.admission_date) >= ? AND DATE(t1.admission_date) <= ?";
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed gopd_relation_personnel tblrefer',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("ss",$start_date,$end_date);
  if ( false===$rc ) {
    return_fail('bind_param_failed gopd_relation_personnel tblrefer', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed gopd_relation_personnel tblrefer',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $tblrefer = $result->fetch_all(MYSQLI_ASSOC);
    //return_success("gopd_military_personnel",$data);
  }else{
    # we should not return , because may be today is no sopd or admission, but can have gopd
  }
  // 3 loop here
  
  $final_result = $tblpatientrecord;
  for($i = 0 ; $i < count($tblrefer); $i++){
    $patient_record = $tblrefer[$i]['patient_id'];
    for($j = 0 ; $j < count($tblpatientrecord); $j++){
      //echo "\n ".$patient_record.  " : ".$tblpatientrecord[$j]['PatientID'];
      if($patient_record == $tblpatientrecord[$j]['patient_id']){
          unset($final_result[$j]);
      }
    }
  }
  // final result to array
  $return_num_array = array();
  foreach($final_result AS $key=>$val){
    $return_num_array[] = $final_result[$key];
  }
  //$return_data = array($tblpatientrecord,$tblrefer,$final_result,$return_num_array);
  return_success("gopd_relation_personnel success",$return_num_array);
}
// 6. SOPD for Relation Personnel
public function sopd_relation_personnel($medicine_case){
  // restrict user input data
  $start_date = (string) isset($medicine_case['start_date']) ? $medicine_case['start_date'] : null ;
  $end_date = (string) isset($medicine_case['end_date']) ? $medicine_case['end_date'] : null ;
  $hospital = (string) isset($medicine_case['hospital']) ? $medicine_case['hospital'] : null ;

  $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, relation_personnel.* FROM tblhospital, tblrefer, relation_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'SOPD' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = relation_personnel.patient_id AND tblhospital.Code = ?";
  
  if($hospital == "all_hospital") {
    // change the query
    $sql = "SELECT tblhospital.Name AS hospital_name, tblrefer.admission_date AS start_date, tblrefer.refer_diagnosis AS disease_name, relation_personnel.* FROM tblhospital, tblrefer, relation_personnel WHERE DATE(tblrefer.admission_date) >= ? AND DATE(tblrefer.admission_date) <= ? AND tblrefer.statusRefer = 'SOPD' AND tblrefer.HospitalCode = tblhospital.Code AND tblrefer.PatientID = relation_personnel.patient_id AND tblhospital.Code != ?";
  }
  
  $stmt = $this->conn->prepare($sql);
  if ( false===$stmt ) {
    return_fail('prepare_failed sopd_relation_personnel',htmlspecialchars($this->conn->error));
  }
  $rc = $stmt->bind_param("sss",$start_date,$end_date,$hospital);
  if ( false===$rc ) {
    return_fail('bind_param_failed sopd_relation_personnel', htmlspecialchars($stmt->error));
  }
  $rc = $stmt->execute();
  if ( false===$rc ) {
    return_fail('execute_failed sopd_relation_personnel',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
  }
  $result = $stmt->get_result();
  $affected_rows = $result->num_rows;
  $stmt->close();
  if($affected_rows > 0 ){
    $data = $result->fetch_all(MYSQLI_ASSOC);
    $return_data = array(true,$data);
    return_success("success : sopd_relation_personnel",$data);
  }else{
    $return_data = array(false);
    return_fail('no_data sopd_relation_personnel',"there is no data for that query");
  }
}

} /// end for class

?>