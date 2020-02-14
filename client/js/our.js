$(document).ready(function(){
        console.log("our js is initialized");
        var Case = Backbone.Model.extend({
                defaults: {
                        serial_no:null,
                        person_id:null, // patient or person id
                        nrc_no:null, // myanmar nrc no. unique
                        name:null, // name 
                        gender:null, // 1 male/ 2 female
                        gender_name:null, // male/ female
                        date_of_birth:null, // date input
                        blood_group : null, // 1 A, 2 B, 3 AB, 4 O
                        blood_group_name: null, // text for blood group
                        address:null,// text for address ( text input - not classfied by division, quater etc..)
                        
                        type:null, // 1 soldier, 2 relationship, 3 civilian
                        type_name:null, // readable text for patient type

                        mc_type:null, // infantary, navy, airforce or kp (have to be int)
                        mc_type_name:null, // readable text for mc_type
                        mc:null, // unique number
                        rank:null, // 1 for Rifleman , 2 ...
                        rank_name:null, // Rifleman, Second Copra
                        unit:null, // db unit code (unique)
                        unit_name:null, // readable text for unit such as LIR - 73

                        relation_type:null,// 1. for mother, 2 father, 3 son, 4 doughter
                        relation_type_name:null, // readable text for relation type
                        relation_with: null, // person id (may be patient id )

                        
                        case_id : null, // case id for hospital record
                        hospital:null, // 
                        hospital_name:null,
                        department:null, // unique department 
                        department_name:null,// readable department name
                        case_status:null, // may be opd, hospital, dismiss or expire
                        case_status_name:null, // readable text
                        start_date:null, // all case status have start_date 
                        end_date:null, // dismiss, expire only have end date 
                        disease:null, // db code name
                        disease_name:null, // readable disease name
                        note:null, // extra note
                        render_type:null // case list, case history, later may be case edit 
                },
                changeStatus: function(value) {
                        console.log("issuse in changeStatus");
                        //this.save({status: value});
                },
                update_serial_no: function(value) {
                        console.log("update serical number for case "+value);
                        this.set({serial_no: value});
                        //this.save({serial_no: value});
                },
                update_render_type: function(value) {
                        console.log("update update_render_type  => "+value);
                        this.set({render_type: value});
                        //this.save({serial_no: value});
                }
        });

        var CaseView = Backbone.View.extend({
                tagName: 'tr',
                events: {
                    'change .change-status': 'changeStatus',
                    'click .del': 'delSelf',
                    'click .view_history': 'view_history'
                },
                template: _.template( $('#case_row_template').html() ),
                initialize: function() {
                    this.listenTo(this.model, 'change', this.render),
                    this.listenTo(this.model, 'destroy', this.remove)
                },
                render: function() {
                    var modelData = this.model.toJSON();
                    this.$el.html( this.template(modelData) );
                    //console.log("what is this issue => "+JSON.stringify(this));
                    //console.log("what is this.el =>  "+JSON.stringify(this.el));
                    //console.log("issuse is rendered");
                    return this;
                },
                changeStatus: function() {
                    var newStatus = this.$('.change-status').val();
                    console.log("issue is chinging status "+newStatus);
                    this.model.changeStatus(newStatus);
                    //this.model.set({status: newStatus});
                },
                delSelf: function() {
                    console.log("case is deleted");
                    this.model.destroy();
                },
                view_history:function(){
                        console.log("view_history is clicked on "+this.model.get("name"));
                        // retrieve patient list
                        // render to model view list\
                        var patient_id = this.model.get("id");
                        // request and get data
                        var data = server_response_data; 
                        // we need to validate the length of data ( there is at least one record)
                        // initialize new colleciton
                        var case_history_collection = new CaseList(data);
                        // loop through case_history_colleciton
                        // first , clean previous tbody content
                        $("#case_history_tbody").html("");
                        // add title to modal 
                        $("#case_history_modal_title").html(this.model.get("name"));
                        for(var i = 0 ; i<case_history_collection.length; i++){
                                var serial_no = i+1;
                                case_history_collection.at(i).update_render_type("case_history");
                                case_history_collection.at(i).update_serial_no(serial_no);
                                var view = new CaseHistoryView({ model:  case_history_collection.at(i) });
                                $('#case_history_tbody').append( view.render().el );
                        }
                }
        });
        
        var CaseHistoryView = Backbone.View.extend({
                tagName: 'tr',
                events: {
                    'change .change-status': 'changeStatus',
                },
                template: _.template( $('#case_history_template').html() ),
                initialize: function() {
                    this.listenTo(this.model, 'change', this.render),
                    this.listenTo(this.model, 'destroy', this.remove)
                },
                render: function() {
                    var modelData = this.model.toJSON();
                    this.$el.html( this.template(modelData) );
                    return this;
                },
                changeStatus: function() {
                    var newStatus = this.$('.change-status').val();
                    console.log("issue is chinging status "+newStatus);
                    this.model.changeStatus(newStatus);
                }
        });
            
        var CaseList = Backbone.Collection.extend({
                url: '#',
                model: Case
        });

        // configuration data
        var soldier_config = {
                mc_type: ['--ကိုယ်ပိုင်နံပါတ်--','ကြည်း', 'ကပ', 'တ'],
                rank: ['--အဆင့်--','ဒုမှူးကြီး','ဒုမှူးကြီး / မှူး',' မှူး',' မှူး/ဗက','ဗက','ဗ','ဒုဗိုလ်','အရာခံဗိုလ်','တပ်ကြပ်ကြီး','တပ်ကြပ်','ဒုတပ်ကြပ်','တပ်သား','Second Cop','RM'],
                position: ['--ရာထူး--','ရင်းမှူး','ဒုရင်းမှူး','ဌာနချူပ် တပ်ခွဲမှူး','တပ်ရး ဗိုလ်ကြီး','တပ်ထောက် ဗိုလ်ကြီး','စရဖ အရာရှိ','တပ်ခွဲမှူး','တပ်စုမှါ်ူး','တပ်ခွဲ အရာခံဗိုလ်','တပ်ခွဲ တပ်ြက်ပကြီး','လစာကြပ်','တပ်သား'],
                company: ['--တပ်ခွဲ--','ဌာနချူပ် တပ်ခွဲမှူး', 'တပ်ခွဲ ၁', 'တပ်ခွဲ ၂', 'တပ်ခွဲ ၃', 'တပ်ခွဲ ၄'],
                current_location: ['--လက်ရှိနေရာ--','တပ်တွင်း', 'စစ်ဆင်ရေး', 'တပ်ပြင်'],
                inner_location: ['--တပ်တွင်း--','ဌာနချူပ်', 'တပ်ခွဲ ၁', 'တပ်ခွဲ ၂', 'တပ်ခွဲ ၃', 'တပ်ခွဲ ၄','ဗဟိုက်ငး','အထွေထွေ'],
                inner_duty: ['--တာဝန်--','ရင်းမှူး','ဒုရင်းမှူး','ဌာနချုပ် င်္ဃဲမှူး','ရေးဗက','ထောက်ဗက','စရဖ အရရှိ','တပ်ခွဲမှူး','တပ်စုမှါ်ူး','အရာခံဗိုလ်','တပ်ခွဲ တပ်ကြပ်ကြီး','တပ်ကြပ်ကြီး','လစာကြပ်','တပ်သား'],
                ops_location: ['--စခန်း/လှုပ်ရှား--','ဘောကထာ စခန်း', 'ဘောကထာ လှုပ်ရှား', 'တုံးတံတား စခန်း', 'တုံးတံတား လှုပ်ရှား','မင်းလမ်းသံဆိပ် စခန်း','မင်းလမ်းသံဆိပ် လှုပ်ရှား'],
                ops_duty: ['--တာဝန်--','စခန်းမှူး', 'တပ်ခွဲမှူး', 'PC','TC','RM'],
                outside_location: ['--တပ်ပြင် တာဝန်--','သင်တန်း', 'ခွင့်', 'ဆေးရုံတက်','ခွင့်မဲ့','ယာယီတာဝန်']
            };
        // server response data
        var server_response_data = [
                {
                        person_id:1, // patient or person id
                        nrc_no:"nrc no", // myanmar nrc no. unique
                        name:"name", // name 
                        gender:1, // 1 male/ 2 female
                        gender_name:"gender 1", // male/ female
                        date_of_birth:"04-02-1991", // date input
                        blood_group : 1, // 1 A, 2 B, 3 AB, 4 O
                        blood_group_name: "Blood Group A 1", // text for blood group
                        address:"Address mdy",// text for address ( text input - not classfied by division, quater etc..)
                        
                        type:1, // 1 soldier, 2 relationship, 3 civilian
                        type_name:"type name : soldier 1", // readable text for patient type

                        mc_type:1, // infantary, navy, airforce or kp (have to be int)
                        mc_type_name:"mc_type 1", // readable text for mc_type
                        mc:1234, // unique number
                        rank:1, // 1 for Rifleman , 2 ...
                        rank_name:"rank name 1", // Rifleman, Second Copra
                        unit:"a063", // db unit code (unique)
                        unit_name:"lir 73", // readable text for unit such as LIR - 73

                        relation_type:null,// 1. for mother, 2 father, 3 son, 4 doughter
                        relation_type_name:null, // readable text for relation type
                        relation_with: null, // person id (may be patient id )

                        
                        case_id : 234, // case id for hospital record
                        hospital:"a342", // 
                        hospital_name:"MSY 3, Taungoo",
                        department:34, // unique department 
                        department_name:"Department 34",// readable department name
                        case_status:1, // may be opd, hospital, dismiss or expire
                        case_status_name:"OPD case status 1", // readable text
                        start_date:"04-02-2020", // all case status have start_date 
                        end_date:null, // dismiss, expire only have end date 
                        disease:"a8769", // db code name
                        disease_name:"Abdomenal", // readable disease name
                        note:null, // extra note
                },
                {
                        person_id:2, // patient or person id
                        nrc_no:"nrc no 2", // myanmar nrc no. unique
                        name:"name 2", // name 
                        gender:1, // 1 male/ 2 female
                        gender_name:"gender 1 2", // male/ female
                        date_of_birth:"04-02-1993", // date input
                        blood_group : 2, // 1 A, 2 B, 3 AB, 4 O
                        blood_group_name: "Blood Group B 2", // text for blood group
                        address:"Address YGN",// text for address ( text input - not classfied by division, quater etc..)
                        
                        type:2, // 1 soldier, 2 relationship, 3 civilian
                        type_name:"type name : relationship 2", // readable text for patient type

                        mc_type:null, // infantary, navy, airforce or kp (have to be int)
                        mc_type_name:null, // readable text for mc_type
                        mc:null, // unique number
                        rank:null, // 1 for Rifleman , 2 ...
                        rank_name:null, // Rifleman, Second Copra
                        unit:null, // db unit code (unique)
                        unit_name:null, // readable text for unit such as LIR - 73

                        relation_type:3,// 1. for mother, 2 father, 3 son, 4 doughter
                        relation_type_name:"relation type 3 : son", // readable text for relation type
                        relation_with: 3452, // person id (may be patient id )

                        
                        case_id : 342, // case id for hospital record
                        hospital:"a348", // 
                        hospital_name:"MSY 8, Taungyi",
                        department:64, // unique department 
                        department_name:"Department 64",// readable department name
                        case_status:2, // may be opd, hospital, dismiss or expire
                        case_status_name:"Hospital case status 2", // readable text
                        start_date:"03-02-2020", // all case status have start_date 
                        end_date:null, // dismiss, expire only have end date 
                        disease:"a876d9", // db code name
                        disease_name:"Headache", // readable disease name
                        note:null, // extra note
                },
                {
                        person_id:3, // patient or person id
                        nrc_no:"nrc no 3", // myanmar nrc no. unique
                        name:"name 3", // name 
                        gender:2, // 1 male/ 2 female
                        gender_name:"gender 2 3", // male/ female
                        date_of_birth:"04-02-1983", // date input
                        blood_group : 4, // 1 A, 2 B, 3 AB, 4 O
                        blood_group_name: "Blood Group O 4", // text for blood group
                        address:"Address TGN",// text for address ( text input - not classfied by division, quater etc..)
                        
                        type:3, // 1 soldier, 2 relationship, 3 civilian
                        type_name:"type name : relationship 3", // readable text for patient type

                        mc_type:null, // infantary, navy, airforce or kp (have to be int)
                        mc_type_name:null, // readable text for mc_type
                        mc:null, // unique number
                        rank:null, // 1 for Rifleman , 2 ...
                        rank_name:null, // Rifleman, Second Copra
                        unit:null, // db unit code (unique)
                        unit_name:null, // readable text for unit such as LIR - 73

                        relation_type:null,// 1. for mother, 2 father, 3 son, 4 doughter
                        relation_type_name:null, // readable text for relation type
                        relation_with: null, // person id (may be patient id )

                        
                        case_id : 3443, // case id for hospital record
                        hospital:"a6348", // 
                        hospital_name:"MSY 12, Kalaw",
                        department:15, // unique department 
                        department_name:"Department 15",// readable department name
                        case_status:3, // may be opd, hospital, dismiss or expire
                        case_status_name:"Hospital case status 3", // readable text
                        start_date:"05-02-2020", // all case status have start_date 
                        end_date:"08-02-2020", // dismiss, expire only have end date 
                        disease:"f343d4", // db code name
                        disease_name:"Kidney", // readable disease name
                        note:"extra note", // extra note
                }
        ];
        // UI Initialization
        // 1 . Get GOPD list button for military personnel
        $("#get_gopd_military_personnel_list_button").on("click",function(){
                console.log("get_gopd_military_personnel_list_button is clicked");
                var start_date = $("#gopd_start_date_military_personnel_input").val();
                var end_date = $("#gopd_end_date_military_personnel_input").val();
                var hospital = $("#gopd_hospital_military_personnel_input").val();
                var ops_type = "gopd_military_personnel"; // list of military personnel for sopd between start date and end date
                //var ops_list = "opd_list";
                
                console.log(" gopd_military_personnel start and end date are "+start_date+","+end_date+" hospital is "+hospital);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#gopd_start_date_military_personnel_input").val() == "") $("#gopd_start_date_military_personnel_input").focus();
                        else $("#gopd_end_date_military_personnel_input").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#gopd_hospital_military_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_gopd_military_personnel_list_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#gopd_military_personnel_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
                                console.log(JSON.stringify(response));
                                console.log("default data");
                                console.log(server_response_data);
				if (response.status == true) {
                                        var data = response.data; 
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's military personnel
                                                data[i]['type'] = 1; // 1 mean military personnel
                                        }
                                        // colloection of military personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#gopd_military_personnel_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_gopd_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_gopd_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#gopd_military_personnel_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ အရာရှိ/စစ်သည် ဆေးခန်းလိုက် GOPD  မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });
        // 2. Get SOPD List button for military personnel
        $("#get_opd_list_button").on("click",function(){
                console.log("get_opd_list_button is clicked");
                var start_date = $("#opd_start_date_input").val();
                var end_date = $("#opd_end_date_input").val();
                var hospital = $("#sopd_hospital_military_personnel_input").val();
                var ops_type = "sopd_military_personnel"; // list of military personnel for sopd between start date and end date
                //var ops_list = "opd_list";
                
                console.log("start and end date are "+start_date+","+end_date);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#opd_start_date_input").val() == "") $("#opd_start_date_input").focus();
                        else $("#opd_end_date_input").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#sopd_hospital_military_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_opd_list_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#opd_military_case_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
                                console.log(JSON.stringify(response));
                                console.log("default data");
                                console.log(server_response_data);
				if (response.status == true) {
                                        var data = response.data; // :P such a fake data set
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's military personnel
                                                data[i]['type'] = 1; // 1 mean military personnel
                                        }
                                        // colloection of military personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#opd_military_case_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#opd_military_case_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ အရာရှိ/စစ်သည် ဆေးခန်းလိုက် မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });
        // 3. Get Admission List button for military personnel
        $("#get_admission_military_personnel_list_button").on("click",function(){
                console.log("get_opd_list_button is clicked");
                var start_date = $("#admission_start_date_military_personnel_input").val();
                var end_date = $("#admission_end_date_military_personnel_input").val();
                var hospital = $("#admission_hospital_military_personnel_input").val();
                var ops_type = "admission_military_personnel"; // list of military personnel for admission  between start date and end date
                console.log("start and end date are "+start_date+","+end_date);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#admission_start_date_military_personnel_input").val() == "") $("#admission_start_date_military_personnel_input").focus();
                        else $("#admission_end_date_military_personnel_input").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#admission_hospital_military_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_admission_military_personnel_list_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#admission_military_case_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
                                console.log(JSON.stringify(response));
                                console.log("default data");
                                console.log(server_response_data);
				if (response.status == true) {
                                        var data = response.data; // 
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's military personnel
                                                data[i]['type'] = 1; // 1 mean military personnel
                                        }
                                        // colloection of military personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#admission_military_case_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_admission_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_admission_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#admission_military_case_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ အရာရှိ/စစ်သည် ဆေးရုံတက် မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });
        // 4. Get dismiss List button for military personnel
        $("#get_dismiss_military_personnel_list_button").on("click",function(){
                console.log("get_opd_list_button is clicked");
                var start_date = $("#dismiss_start_date_military_personnel_input").val();
                var end_date = $("#dismiss_end_date_military_personnel_input").val();
                var hospital = $("#dismiss_hospital_military_personnel_input").val();
                var ops_type = "dismiss_military_personnel"; // list of military personnel for admission  between start date and end date
                console.log("start and end date are "+start_date+","+end_date);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#dismiss_start_date_military_personnel_input").val() == "") $("#dismiss_start_date_military_personnel_input").focus();
                        else $("#dismiss_end_date_military_personnel_input").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#dismiss_hospital_military_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_dismiss_military_personnel_list_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#dismiss_military_case_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
                                console.log(JSON.stringify(response));
                                console.log("default data");
                                console.log(server_response_data);
				if (response.status == true) {
                                        var data = response.data; // 
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's military personnel
                                                data[i]['type'] = 1; // 1 mean military 
                                                data[i]['case_status'] = 3; // 3 mean dismiss 
                                        }
                                        // colloection of military personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#dismiss_military_case_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_dismiss_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_dismiss_military_personnel_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#dismiss_military_case_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ အရာရှိ/စစ်သည် ဆေးရုံဆင်း မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });
        // 5 . Get GOPD list button for relation personnel
        $("#get_opd_list_relation_personnel_button").on("click",function(){
                console.log("get_gopd_relation_personnel_list_button is clicked");
                var start_date = $("#opd_relation_personnel_start_date").val();
                var end_date = $("#opd_relation_personnel_end_date").val();
                var hospital = $("#opd_hospital_relation_personnel_input").val();
                var ops_type = "gopd_relation_personnel"; // list of military personnel for sopd between start date and end date
                //var ops_list = "opd_list";
                
                console.log(" opd_relation_personnel start and end date are "+start_date+","+end_date+" hospital is "+hospital);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#opd_relation_personnel_start_date").val() == "") $("#opd_relation_personnel_start_date").focus();
                        else $("#opd_relation_personnel_end_date").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#opd_hospital_relation_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_opd_list_relation_personnel_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#opd_relation_personnel_case_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
				if (response.status == true) {
                                        var data = response.data; 
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's military personnel
                                                data[i]['type'] = 2 ; // 2 mean relation personnel
                                        }
                                        // colloection of relation personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#opd_relation_personnel_case_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_opd_list_relation_personnel_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_opd_list_relation_personnel_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#opd_relation_personnel_case_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ မှီခိုသူ/ ရဲမေ  ဆေးခန်းလိုက် GOPD  မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });
        // 6. Get SOPD List button for relation personnel
        $("#get_sopd_list_relation_personnel_button").on("click",function(){
                console.log("get_sopd_list_relation_personnel_button is clicked");
                var start_date = $("#sopd_relation_personnel_start_date_input").val();
                var end_date = $("#sopd_relation_personnel_end_date_input").val();
                var hospital = $("#sopd_hospital_relation_personnel_input").val();
                var ops_type = "sopd_relation_personnel"; // list of relation personnel for sopd between start date and end date
                
                console.log("start and end date are "+start_date+","+end_date);
                // we have to validate 
                // 1 . null / blank date
                // 2. Start date is greater than end date
                // but pass for now.
                if(start_date == "" || end_date == ""){
                        // stop here and alert to choose both date
                        console.log("start date or end date is blank");
                        toastr.error('ကြည့်ရှု့လိုသည့် စရက် နှင့် ဆုံးရက် ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        if($("#sopd_relation_personnel_start_date_input").val() == "") $("#sopd_relation_personnel_start_date_input").focus();
                        else $("#sopd_relation_personnel_end_date_input").focus();
                        return;
                }
                if(hospital == ""){
                        toastr.error('ကြည့်ရှု့လိုသည့် ဆေးရုံ ရွေးချယ်ပေးရန် လိုအပ်ပါသည်');
                        $("#sopd_hospital_relation_personnel_input").focus();
                        return;
                }
                var s_d = new Date(start_date);
                var e_d = new Date(end_date);
                var ans = dates.compare(s_d,e_d);
                console.log("ans is "+ans);
                if(ans == 1){
                        // start date is smaller than end date
                        // logic error
                        toastr.error('Choose valid date range');
                        return;
                }
                //$("#get_opd_list_button").attr("disabled", true);
                $('#get_sopd_list_relation_personnel_button').html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>ဆာဗာသို့ ချိတ်ဆက်နေပါသည်...').addClass('disabled');
                $('#sopd_relation_case_list_tbody').empty();
                console.log("ajax is starting...");
                var formdata = new FormData();
		formdata.append("ops_type", ops_type);
		formdata.append("start_date", start_date);
		formdata.append("end_date", end_date);
		formdata.append("hospital", hospital);
                var webservice_url = "../api/v1/";
                var case_endpoint = "case/index.php";
		var endpoint = webservice_url + case_endpoint;
		$.ajax({
			url: endpoint,
			type: "post",
			data: formdata,
			cache: false,
			processData: false,
			contentType: false,
			success: function(response) {
                                console.log("request success");
                                console.log(response);
                                console.log(JSON.stringify(response));
                                console.log("default data");
                                console.log(server_response_data);
				if (response.status == true) {
                                        var data = response.data; 
                                        // modified data
                                        for(var i = 0 ; i < data.length; i++){
                                                // assign render type , in this case it's relation personnel
                                                data[i]['type'] = 2; // 2 mean relation personnel
                                        }
                                        // colloection of military personnel case list
                                        var case_list  = new CaseList(data);
                                        setTimeout(()=>{
                                                for(var j=0;j<case_list.length;j++){
                                                        /* it's all about DATA */
                                                        var serial_no = j+1;
                                                        case_list.at(j).update_serial_no(serial_no);
                                                        case_list.at(j).update_render_type("case_list");
                                                        var view = new CaseView({ model:  case_list.at(j) });
                                                        $('#sopd_relation_case_list_tbody').append( view.render().el );
                                                       
                                                }
                                                $('#get_sopd_list_relation_personnel_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                        },2000);
				} else {
                                        console.log("no data found for this date period");
                                        setTimeout(()=>{
                                                $('#get_sopd_list_relation_personnel_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                                                $('#sopd_relation_case_list_tbody').append( "<td class='text-danger' colspan='5'>  <span class='text-info'>"+start_date+"</span> မှ <span class='text-info'>"+end_date+"</span>  ထိ အရာရှိ/စစ်သည် ဆေးခန်းလိုက် မရှိပါ</td>");
                                        },2000);
                                        
				}
			},
			error: function(response) {
                                console.log("network error");
				console.log(response.responseText);
			}
                });
                console.log("ajax is complete");
                // setTimeout(() => { 
                //         $('#get_opd_list_button').html('ကြည့်ရှုမည်').removeClass('disabled');
                //         var data = server_response_data; // :P such a fake data set
                //         // initialize model collection
                //         // render each model  opd view
                //         // append to table 
                //         // initialize data table ( or alert )
                //         var case_list  = new CaseList(data);
                //         for(var j=0;j<case_list.length;j++){
                //                 /* it's all about DATA */
                //                 var serial_no = j+1;
                //                 case_list.at(j).update_serial_no(serial_no);
                //                 case_list.at(j).update_render_type("case_list");
                //                 var view = new CaseView({ model:  case_list.at(j) });
                //                 $('#opd_military_case_list_tbody').append( view.render().el );
                //         }
                // }, 3000);
                
        });

        // Source: http://stackoverflow.com/questions/497790
        var dates = {
                convert:function(d) {
                // Converts the date in d to a date-object. The input can be:
                //   a date object: returned without modification
                //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
                //   a number     : Interpreted as number of milliseconds
                //                  since 1 Jan 1970 (a timestamp) 
                //   a string     : Any format supported by the javascript engine, like
                //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
                //  an object     : Interpreted as an object with year, month and date
                //                  attributes.  **NOTE** month is 0-11.
                return (
                        d.constructor === Date ? d :
                        d.constructor === Array ? new Date(d[0],d[1],d[2]) :
                        d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                        typeof d === "object" ? new Date(d.year,d.month,d.date) :
                        NaN
                );
                },
                compare:function(a,b) {
                // Compare two dates (could be of any type supported by the convert
                // function above) and returns:
                //  -1 : if a < b
                //   0 : if a = b
                //   1 : if a > b
                // NaN : if a or b is an illegal date
                // NOTE: The code inside isFinite does an assignment (=).
                return (
                        isFinite(a=this.convert(a).valueOf()) &&
                        isFinite(b=this.convert(b).valueOf()) ?
                        (a>b)-(a<b) :
                        NaN
                );
                },
                inRange:function(d,start,end) {
                // Checks if date in d is between dates in start and end.
                // Returns a boolean or NaN:
                //    true  : if d is between start and end (inclusive)
                //    false : if d is before start or after end
                //    NaN   : if one or more of the dates is illegal.
                // NOTE: The code inside isFinite does an assignment (=).
                return (
                        isFinite(d=this.convert(d).valueOf()) &&
                        isFinite(start=this.convert(start).valueOf()) &&
                        isFinite(end=this.convert(end).valueOf()) ?
                        start <= d && d <= end :
                        NaN
                );
                }
        };

        // ref ; 
        function sleep(milliseconds) {
                const date = Date.now();
                let currentDate = null;
                do {
                        currentDate = Date.now();
                } while (currentDate - date < milliseconds);
        }
        // console.log("Hello");
        // sleep(2000);
        // console.log("World!");

        // hospital initialization into select box
        var formData = new FormData();
        formData.append("ops_type","selectAll");
        var webservice_url = "../api/v1/";
        var case_endpoint = "hospital/index.php";
        var endpoint = webservice_url + case_endpoint;
        $.ajax({
                url: endpoint,
                type: "post",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                success: function(response) {
                        console.log("request success");
                        console.log(response);
                        console.log(JSON.stringify(response));
                        console.log("default data");
                        console.log(server_response_data);
                        if (response.status == true) {
                                var data = response.data; 
                                setTimeout(()=>{
                                        for(var i=0;i<data.length;i++){
                                                var html = '<option value="'+data[i]['Code']+'">'+data[i]['Name']+data[i]['City']+'</option>';
                                                $('.hospital_select').append( html );
                                        }
                                        
		                        $('.mdb-select').material_select();
                                },0);
                        } else {
                                console.log("no hospital data");
                        }
                },
                error: function(response) {
                        console.log("network error");
                        console.log(response.responseText);
                }
        });
        console.log("ajax is complete");
});