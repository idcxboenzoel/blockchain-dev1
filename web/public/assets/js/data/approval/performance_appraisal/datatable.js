$(function(){
    "use strict"

    var table_data = $('#table_data').DataTable({
        // Gw tambahain style ini mam start
        createdRow: function ( row, data, index ) {
            $(row).addClass('selected')
         } ,
         language: {
             paginate: {
                next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
               previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>' 
             }
           },
        // Gw tambahain style ini mam end
        
        // "scrollY": false,
        // "scrollX": false,
        // "processing": false,
        // "serverSide": false,
        // "searching": false,
        // "paging": false,
        // "bInfo" : false,
        // "ordering": false,
        "ajax":{
            "url": "/Api/Employee/list",
            "type": "get",
            "dataType": 'json',
            "data": {
                login_as:'approval',
                target:'pa',
                REQUEST_CODE: function() { return '' },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "",
                render: function(data, type, row, meta) { 
                    return meta.row + 1
                },
            },

            { "data": "fullname","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = '<a style="color:blue;" href="/Approval/PerformanceAppraisal/Detail/'+row.nik+'">'+row.fullname+'</a><br>';
                    var dt2 = `<span "sub">${row.position_name}</span>`
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1 + dt2;
                },
            },

            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            
            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.department_name != null ? row.department_name : '-'
                },
            },

            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.division_name != null ? row.division_name : '-'
                },
            },

            { "data": "company_name","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },
            // report to
            { "data": "supervisors","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data.length > 0 ? data[0].spv_fullname : ''
                    return dt1;
                },
            },
            // approval 2
            { "data": "supervisors","width":"25%",
                render: function(data, type, row, meta) { 
                    console.log(data.length)
                    var dt1 = data.length > 1 ? data[1].spv_fullname : ''
                    return dt1;
                },
            },
            { "data": "goal","width":"25%",
                render: function(data, type, row, meta) { 
                    let status = data != null ? data.status_approval : 6
                    let type_status = ['Draft','Submitted','Waitting Approval','Approved','Send Back','Rejected','-'];

                    let label_status = ''
                    if(status === 0) {
                        label_status = 'draft'
                    }else if(status === 2) {
                        label_status = 'pending'
                    }else if(status === 3) {
                        label_status = 'approved'
                    }

                    return `<span class='label-status label-status-${label_status}'>${type_status[status]}</span>`
                },
            },
        ],
    });
});