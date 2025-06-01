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
        dom: '<"top">rt<"bottom"lp><"clear">',
        // "scrollY": false,
        // "scrollX": false,
        // "processing": false,
        // "serverSide": false,
        // "searching": false,
        "paging": true,
        "lengthChange" : true,
        "pageLength": 5,
        "lengthMenu": [5, 10, 25, 50, 75, 100],
        // "bInfo" : false,
        // "ordering": false,
        "ajax":{
            "url": "/Api/Report/goal?login_as=approval",
            "type": "get",
            "dataType": 'json',
            "data": {
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

            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },

            { "data": "fullname","width":"35%",
                render: function(data, type, row, meta) { 
                    var dt1 = '<a style="color:blue;" href="/Report/Goal/Detail/'+row.nik+'">'+row.fullname+'</a><br>';
                    var dt2 = ``
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1 + dt2;
                },
            },

            { "data": "","width":"35%",
                render: function(data, type, row, meta) { 
                    return row.company_name != null ? row.company_name : '-'
                },
            },

            { "data": "","width":"35%",
                render: function(data, type, row, meta) { 
                    return row.position_name != null ? row.position_name : '-'
                },
            },

            { "data": "business_pilar","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "company_group","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "email","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "join_date","width":"25%",
                render: function(data, type, row, meta) { 
                    var d = new Date(data);

                    var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear()
                    var dt1 = datestring

                    return dt1;
                },
            },

            { "data": "form_type","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    var dt1 = data != null ? data.form_alias : '-'
                    return dt1;
                },
            },

            // superior nik
            { "data": "supervisors","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    var dt1 = data.length > 0 ? data[0].spv_nik : ''
                    let logs = row.goal !== null ? row.goal.log_approvals : [];
                    if(logs.length > 0) {
                        dt1 = logs[0].nik_approval
                    }
                    return dt1;
                },
            },
            // superior email
            { "data": "supervisors","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    
                    var dt1 = data.length > 0 ? (data[0].user != null ? data[0].user.email : '-') : ''
                    let logs = row.goal !== null ? row.goal.log_approvals : [];
                    console.log(data.length)
                    if(logs.length > 0) {
                        dt1 = logs[0].employee !== null ? logs[0].employee.email : dt1
                    }
                    return dt1;
                },
            },
            { "data": "goal","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    let status = data !== null ? data.status_approval : 0;
                    let type_status = ['Draft','Pending Approval','Pending Approval','Approved','Send Back','Rejected'];

                    let logs = data !== null ? data.log_approvals : [];

                    let label_status = ''
                    let name = ''
                    if(status == 0) {
                        label_status = 'draft'
                        name = row.fullname
                    }else if(status === 1) {
                        label_status = 'pending'
                        name = row.supervisors.length > 0 ? row.supervisors[0].spv_fullname : ''
                    }else if(status === 2) {
                        label_status = 'pending'
                        if(logs.length > 0) {
                            name = row.supervisors[logs.length].spv_fullname;
                        }
                    }else if(status === 3) {
                        label_status = 'approved'
                        console.log(data.log_approvals)
                        $.each(data.log_approvals, function(k, v) {
                            name = v.employee.fullname
                        })
                    }else if(status == 4) {
                        label_status = 'draft'
                        name = row.fullname
                    }
                    
                    

                    return `<span class='label-status label-status-${label_status}'>${type_status[status]}</span><br><span class='name_on_status'>${name}</span>`
                },
            },
        ],
        initComplete: function (settings, json) {
            $('.footer-table').html('')
            $('.table-responsive .bottom').appendTo('.footer-table');
        }
    });

    var table_data_admin = $('#table_data_admin').DataTable({
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
        dom: '<"top">rt<"bottom"lp><"clear">',
        // "scrollY": false,
        // "scrollX": false,
        // "processing": false,
        // "serverSide": false,
        // "searching": false,
        "paging": true,
        "lengthChange" : true,
        "pageLength": 5,
        "lengthMenu": [5, 10, 25, 50, 75, 100],
        // "bInfo" : false,
        // "ordering": false,
        "ajax":{
            "url": "/Api/Report/goal?login_as=admin",
            "type": "get",
            "dataType": 'json',
            "data": {
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

            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },

            { "data": "fullname","width":"35%",
                render: function(data, type, row, meta) { 
                    var dt1 = '<a style="color:blue;" href="/Report/Goal/Detail/'+row.nik+'">'+row.fullname+'</a><br>';
                    var dt2 = ``
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1 + dt2;
                },
            },

            { "data": "","width":"35%",
                render: function(data, type, row, meta) { 
                    return row.company_name != null ? row.company_name : '-'
                },
            },

            { "data": "","width":"35%",
                render: function(data, type, row, meta) { 
                    return row.position_name != null ? row.position_name : '-'
                },
            },

            { "data": "business_pilar","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "company_group","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "email","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "join_date","width":"25%",
                render: function(data, type, row, meta) { 
                    var d = new Date(data);

                    var month = (d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0'+(d.getMonth()+1)
                    var date = (d.getDate()) > 9 ? (d.getDate()) : '0'+(d.getDate())
                    var hours = (d.getHours()) > 9 ? (d.getHours()) : '0'+(d.getHours())
                    var minutes = (d.getMinutes()) > 9 ? (d.getMinutes()) : '0'+(d.getMinutes())
                    

                    var datestring = date  + "-" + month + "-" + d.getFullYear()

                    return datestring;
                },
            },

            { "data": "form_type","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    var dt1 = data != null ? data.form_alias : '-'
                    return dt1;
                },
            },

            // superior nik
            { "data": "supervisors","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    var dt1 = data.length > 0 ? data[0].spv_nik : ''
                    let logs = row.goal !== null ? row.goal.log_approvals : [];
                    if(logs.length > 0) {
                        dt1 = logs[0].nik_approval
                    }
                    return dt1;
                },
            },
            // superior email
            { "data": "supervisors","width":"25%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    console.log(data.length)
                    var dt1 = data.length > 0 ? (data[0].user != null ? data[0].user.email : '-') : ''
                    let logs = row.goal !== null ? row.goal.log_approvals : [];
                    if(logs.length > 0) {
                        dt1 = logs[0].employee !== null ? logs[0].employee.email : dt1
                    }
                    return dt1;
                },
            },
            { "data": "goal","width":"35%",'className':'text-center',
                render: function(data, type, row, meta) { 
                    let status = data !== null ? data.status_approval : 0;
                    let type_status = ['Draft','Pending Approval','Pending Approval','Approved','Send Back','Rejected'];

                    let logs = data !== null ? data.log_approvals : [];

                    let label_status = ''
                    let name = ''
                    if(status == 0) {
                        label_status = 'draft'
                        name = row.fullname
                    }else if(status === 1) {
                        label_status = 'pending'
                        name = row.supervisors.length > 0 ? row.supervisors[0].spv_fullname : ''
                    }else if(status === 2) {
                        label_status = 'pending'
                        if(logs.length > 0) {
                            name = row.supervisors[logs.length].spv_fullname;
                        }
                    }else if(status === 3) {
                        label_status = 'approved'
                        $.each(data.log_approvals, function(k, v) {
                            name = v.employee.fullname
                        })
                    }

                    
                    

                    return `<span class='label-status label-status-${label_status}'>${type_status[status]}</span><br><span class='name_on_status'>${name}</span>`
                },
            },
        ],
        initComplete: function (settings, json) {
            $('.footer-table').html('')
            $('.table-responsive .bottom').appendTo('.footer-table');
        }
    });

    setTotal()

    function setTotal()
    {
        let total = 0;
        $(".weight_percent").each(function () {
            let weight = $(this).val() === null || $(this).val() === "" ? 0 : $(this).val()
            total += parseFloat(weight);
        });

        let totalw = parseFloat($('#total_weight').html());
        let max_total = parseFloat($('#total_weight_quantitative').val());
        $("#total_weight").html(total);

        $("#total_weight").html(total);
        // console.log('max ' + $("#total_weight").html(), max_total)
        if (parseFloat(total) != max_total) {
            // $("#total_weight").parent().css("color", "red");
        } else {
            // $("#total_weight").parent().css("color", "white");
        }
        
    }

    $('.btn-search').on('click', function() {

        let search = $('.searchbox').val()
        // let searchby = $('.searchby').val()
        // if(searchby === "" || search === "") {
        //     return false;
        // }
        table_data.search(search).draw();
    })

    $('.btn-search').on('click', function() {

        let search = $('.searchbox').val()
        let searchby = $('.searchby').val()
        // if(searchby === "" || search === "") {
        //     return false;
        // }
        table_data_admin.search(search).draw();
    })

});