<?php
class HOSPITAL{
        public function __construct($conn){
                $this->conn = $conn;
        }

        public function selectAll(){
                $sql = "SELECT tblhospital.Code,tblhospital.Name,tblhospital.City FROM tblhospital";
                $stmt = $this->conn->prepare($sql);
                if ( false===$stmt ) {
                        return_fail('prepare_failed hospital selectAll',htmlspecialchars($this->conn->error));
                }
                $rc = $stmt->execute();
                if ( false===$rc ) {
                        return_fail('execute_failed  hospital selectAll',htmlspecialchars($this->conn->errno) .":". htmlspecialchars($stmt->error));
                }
                $result = $stmt->get_result();
                $affected_rows = $result->num_rows;
                $stmt->close();
                if($affected_rows > 0 ){
                        $data = $result->fetch_all(MYSQLI_ASSOC);
                        $return_data = array(true,$data);
                        return_success("hospital selectAll",$data);
                }else{
                        $return_data = array(false);
                        return_fail('no_data  hospital selectAll',"there is no data for that query");
                }
        }
}// end for class
?>