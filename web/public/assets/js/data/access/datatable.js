$(function(){
    "use strict"


    let dataRoles = [];
    let dataAccess = [];

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
            "url": "/Api/Setting/Access/list",
            "type": "get",
            "dataType": 'json',
            "data": {
                role_id: function() { return null },
                target_data: function() { return "ALL" },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "id",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "name","width":"35%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
                },
            },
            { "data": "label","width":"25%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
                },
            },
            { "data": "prefix","width":"35%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
                },
            },
            { "data": "fa-icon","width":"5%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = `<i class='${data}' ></i>`;
                    return dt1;
                },
            },
            { "data": "children","width":"25%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    let dt1 = ''
                    $.each(data, function(k,v) {
                        dt1 += '> ' + v.name + '<br>'
                    })
                    return dt1;
                },
            },
            { "data": "status","width":"10%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    let active = '<span class="badge badge-success">Active</span><br>';
                    let inactive = '<span class="badge badge-danger">Inactive</span><br>';

                    let toggleButton = `<button class="btn btn-sm btn-toggle-status ${data == 1 ? 'btn-success' : 'btn-danger'}" data-id="${row.id}" data-status="${data}">
                        ${data == 1 ? 'Active' : 'Inactive'}
                    </button>`;

                    // if (data == 1) {
                    //     return active + toggleButton;
                    // } else {
                    //     return inactive + toggleButton;
                    // }

                    return toggleButton
                },
            },
            { "data": "","width":"10%",
                render: function(data, type, row) { 
                    // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

                    // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    // var dt2 = `<a href="#" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
                    // return dt2

                    var dt1 = `<button type="button" 
                    class="btn btn-sm btn-danger btn-delete-access" >
                                                <i class="fa fa-trash"></i> Delete
                                            </button>`;

                    var dt2 = `<button type="button" 
                    class="btn btn-sm btn-warning btn-edit-access" 
                    onclick="loadUpdateModal(${row.id})">
                                                <i class="fa fa-edit"></i> Edit
                                            </button>`;

                    return dt1 +" "+ dt2;
                }
            },
            
        ],
    });

    // Load selected  Access Data into Modal
    window.loadAccessData = function (accessId) {
        fetch(`/Api/Setting/Access/get/${accessId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                $('#access_id').val(data.id);
                $('#modal_create').prop('checked', data.create);
                $('#modal_read').prop('checked', data.read);
                $('#modal_update').prop('checked', data.update);
                $('#modal_delete').prop('checked', data.delete);
            })
            .catch(error => console.error('Error loading access data:', error));
    };

    window.loadCreateModal = function () {
        
        $('#addAccessForm')[0].reset();

        fetch(`/Api/Setting/Access/list?access_id=${accessId}`)
            .then(res => res.json())
            .then(response => {
                $('#addAccessModal').modal('show');
                $('#addAccessModal .modal-body #divAccessParent').html('');
                $('#addAccessModal .modal-body #divAccessParent').append(`
                    <div class="form-group">
                        <select class="form-control select2" name="parent_id" id="accessParentCreate">
                            <option value="">Select Menu Parent</option>
                        </select>
                    </div>
                `);

                $('#addAccessModal .modal-body #divAccessParent select').append(`
                     <option value="0">Root</option>
                `);
                response.data.forEach(access => {
                    
                    $('#addAccessModal .modal-body #divAccessParent select').append(`
                       <option value="${access.id}" >${access.name}</option>
                    `);
                    
                });

                
                // Initialize Select2 for the dynamically added select element
                $(`#divAccessParent .select2`).select2({
                    placeholder: "Select Menu Parent",
                    allowClear: true,
                    tags: true,
                    width: '100%',
                    dropdownParent: $('#addAccessModal .modal-body #divAccessParent')
                });
                $('#addAccessModal').modal('show')
            })
            .catch(error => console.error('Error loading user data:', error));
    }

    //get access by id
    window.getAccessById = function (accessId) {
        return fetch(`/Api/Setting/Access/selected?access_id=${accessId}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Error loading access data:', error);
                throw error;
            });
    };

     // Load Access Data into Modal
    window.loadUpdateModal = function (accessId = '') {
        

        
        $('#updateAccessForm')[0].reset();
        

        let parentId = '';
        getAccessById(accessId).then(vaccess => {
            console.log(vaccess);

            let data = vaccess.data;
            let data_access = vaccess.data;

            $('#updateAccessModal .modal-body #accessId').val(data_access.id);
            $('#updateAccessModal .modal-body #accessName').val(data_access.name);
            $('#updateAccessModal .modal-body #accessLabel').val(data_access.label);
            $('#updateAccessModal .modal-body #accessPrefix').val(data_access.prefix);
            $('#updateAccessModal .modal-body #accessDescription').val(data_access.description);
            $('#updateAccessModal .modal-body #accessIcon').val(data_access["fa-icon"]);
            $('#updateAccessModal .modal-body #accessOrder').val(data_access.order);

            parentId = data_access.parent_id;
            

            // fetch access list
            fetch(`/Api/Setting/Access/list?access_id=${accessId}`)
            .then(res => res.json())
            .then(response => {
                $('#updateAccessModal').modal('show');
                $('#updateAccessModal .modal-body #divAccessParent').html('');
                $('#updateAccessModal .modal-body #divAccessParent').append(`
                    <div class="form-group">
                        <select class="form-control select2" name="parent_id" id="accessParent">
                            <option value="">Select Menu Parent</option>
                        </select>
                    </div>
                `);


                $('#updateAccessModal .modal-body #divAccessParent select').append(`
                     <option value="0">Root</option>
                `);
                response.data.forEach(access => {
                    

                    $('#updateAccessModal .modal-body #divAccessParent select').append(`
                       <option value="${access.id}" ${access.id === parentId ? 'selected' : ''}>${access.name}</option>
                    `);
                    
                });

                
                // Initialize Select2 for the dynamically added select element
                $(`#divAccessParent .select2`).select2({
                    placeholder: "Select Menu Parent",
                    allowClear: true,
                    tags: true,
                    width: '100%',
                    dropdownParent: $('#updateAccessModal .modal-body #divAccessParent')
                });
                

                $('#updateAccessModal').modal('show')
            })
            .catch(error => console.error('Error loading user data:', error));

        }).catch(error => console.error('Error fetching access data:', error));

        
    };


    $('#table-data').on('click', '#btn-accesses', function() {
        alert(dataRoles);return false;
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