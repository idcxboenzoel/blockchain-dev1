$(function(){
    var table_data = $('#table_data').DataTable({
        "scrollY": false,
        "scrollX": false,
        "processing": false,
        "serverSide": false,
        "searching": false,
        "paging": false,
        "bInfo" : false,
        "ordering": false,
        "ajax":{
            "url": "/Api/Employee/list",
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
            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "fullname","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.fullname+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1;
                },
            },
            { "data": "company_name","width":"25%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "position_name","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },
            { "data": "organization_name","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },
            { "data": "grade","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },
            { "data": "supervisors","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = '';
                    var dt2 = '';
                    $.each(data, function(k,v) {
                        spv_fullname = !v.employee ? '-' : v.employee.fullname;
                        // spv_department_name = !v.employee ? '-' : v.employee.department_name;
                        dt1 = spv_fullname+'<br>'
                        // dt2 = '<small style="color:gray;">'+spv_department_name+'</small>';
                    })
                    
                    return dt1 + dt2;
                },
            },
            { "data": "form_type","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data ? data.form_name : '-'
                    return dt1;
                },
            },
            { "data": "nik","width":"10%",
                render: function(data, type, row) { 
                    var dt1 = '<a href="/Employee/Edit" class="btn btn-dark shadow btn-xs sharp me-1"><i class="fas fa-pencil-alt"></i></a>'
                    var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'
                    return dt1 + dt2;
                }
            },
        ],
    });
});