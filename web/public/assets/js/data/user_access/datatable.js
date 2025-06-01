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
        "ajax":{
            "url": "/Api/Setting/UserAccess/list",
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
            { "data": "fullname","width":"35%",
                render: function(data, type, row, meta) { 
                    var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1;
                },
            },
            { "data": "email","width":"35%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "roles","width":"35%",
                render: function(data, type, row, meta) { 
                    let dt1 = ''
                    $.each(data, function(k,v) {
                        dt1 += '> ' + v.role.name + '<br>'
                    })
                    return dt1;
                },
            },
            { "data": "","width":"15%",
                render: function(data, type, row) { 
                    // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

                    var dt1 = ``;//`<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    var dt2 = ``;//`<a href="#" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
                    return dt1 + dt2
                }
            },
        ],
    });


    $('#table-data').on('click', '#btn-accesses', function() {

        Swal.fire({
            title: "<strong>Access Data</strong>",
            icon: "info",
            html: `
                <div class="table-responsive">
                    <table id="table_data" class="" style="min-width: 845px">
                        <thead>
                            <tr>
                                <th>Access ID</th>
                                <th>Access Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                            <tr>
                        </tbody>
                    </table>
                </div>
            `,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,
            
          });
    })

    $('#table-data').on('click', '#btn-Roles', function() {
        
    })

    function initDatatable(id)
    {
        $(id).DataTable();
    }
});