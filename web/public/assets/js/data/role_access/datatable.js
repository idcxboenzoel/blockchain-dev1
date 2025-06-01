$(function(){
    "use strict"


    let dataRoles = [];
    let dataAccess = [];

    var table_data_role = $('#table_data_role').DataTable({
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
            "url": "/Api/Setting/Role/list",
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
            { "data": "id",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "name","width":"45%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
                },
            },
            // { "data": "","width":"15%",
            //     render: function(data, type, row, meta) { 
            //         var dt2 = `<a href="/Settings/RoleBusinessPilar/${row.id}"  title='Business Pilar' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-eye">  Detail</i></a>`
                    
            //         return dt2
            //     },
            // },
            { "data": "","width":"15%",
                render: function(data, type, row, meta) { 
                    var dt2 = `<a href="/Settings/RoleUser/${row.id}" title="Role User" class="btn btn-info btn-sm">
                        <i class="fa fa-eye"></i> <span class="d-none d-sm-inline">Detail</span>
                    </a>`;
                    return dt2
                },
            },
            { "data": "","width":"15%",
                render: function(data, type, row, meta) { 
                    var dt2 = `<a href="/Settings/RoleAccess/${row.id}" title="Access" class="btn btn-info btn-sm">
                        <i class="fa fa-eye"></i> <span class="d-none d-sm-inline">Detail</span>
                    </a>`;
                    return dt2
                },
            },
            { "data": "","width":"15%",
                render: function(data, type, row) { 
                    
                    
                    var dt1 = '<a href="#" title="Edit Role" data-id="'+row.id+'" data-name="'+row.name+'" class="btn btn-warning shadow sharp btn-edit-role"><i class="fa fa-pencil"></i></a>'

                    
                    if(row.id === 2 || row.name.toLowerCase() === 'super admin' || row.name.toLowerCase() === 'superadmin') {
                        var dt2 = '';
                    } else {
                        var dt2 = '<a href="#" title="delete role" data-id="'+row.id+'" data-name="'+row.name+'" class="btn btn-danger shadow sharp btn-remove-role"><i class="fa fa-trash"></i></a>';
                    }
                    // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    // var dt2 = `<a href="/Settings/RoleAccess/${row.id}" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
                    // return dt2
                    return dt1 +" "+ dt2
                }
            },
        ],
    });

    var table_data_access = $('#table_data_access').DataTable({
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
                role_id: function() { return $('#role_id').val() },
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
            { "data": "label","width":"35%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
                },
            },
            // { "data": "prefix","width":"25%",
            //     render: function(data, type, row, meta) { 
            //         // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
            //         // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
            //         var dt1 = data;
            //         return dt1;
            //     },
            // },
            // { "data": "fa-icon","width":"5%",
            //     render: function(data, type, row, meta) { 
            //         // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
            //         // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
            //         var dt1 = `<i class='${data}' ></i>`;
            //         return dt1;
            //     },
            // },
            // { "data": "children","width":"25%",
            //     render: function(data, type, row, meta) { 
            //         // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
            //         // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
            //         let dt1 = ''
            //         $.each(data, function(k,v) {
            //             dt1 += '> ' + v.name + '<br>'
            //         })
            //         return dt1;
            //     },
            // },
            { "data": "","width":"10%",
                render: function(data, type, row) { 
                    // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

                    // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    // var dt2 = `<a href="#" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
                    // return dt2

                    var dt = `<div class="form-group">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="create_${row.id}" name="crud[${row.id}][create]" value="1" ${row.is_create ? 'checked' : ''} disabled>
                                    <label class="form-check-label" for="create_${row.id}">Create</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="read_${row.id}" name="crud[${row.id}][read]" value="1" ${row.is_read ? 'checked' : ''} disabled>
                                    <label class="form-check-label" for="read_${row.id}">Read</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="update_${row.id}" name="crud[${row.id}][update]" value="1" ${row.is_update ? 'checked' : ''} disabled>
                                    <label class="form-check-label" for="update_${row.id}">Update</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="delete_${row.id}" name="crud[${row.id}][delete]" value="1" ${row.is_delete ? 'checked' : ''} disabled>
                                    <label class="form-check-label" for="delete_${row.id}">Delete</label>
                                </div>
                            </div>`;

                    return dt;
                }
            },
            { "data": "","width":"10%",
                render: function(data, type, row) { 
                    // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

                    // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    // var dt2 = `<a href="#" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
                    // return dt2

                    var edit = `<button type="button" 
                    class="btn btn-sm btn-warning btn-edit-access" 
                    onclick="loadAccessListData(${row.id})">
                                                <i class="fa fa-edit"></i> Edit
                                            </button>`;

                    var remove = `<button type="button"
                    class="btn btn-sm btn-danger btn-remove-access" data-id="${row.role_access_id}">
                                               <i class="fa fa-trash"></i> Remove
                                            </button>`;

                    return edit + ' ' + remove;
                }
            },
            
        ],
    });

    var table_data_bp = $('#table_data_bp').DataTable({
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
            "url": "/Api/Setting/BusinessPilar/list",
            "type": "get",
            "dataType": 'json',
            "data": {
                role_id: function() { return $('#role_id').val() },
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
            { "data": "code","width":"25%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data;
                    return dt1;
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
            
            
            // { "data": "","width":"10%",
            //     render: function(data, type, row) { 
            //         // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
            //         // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

            //         // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
            //         var dt2 = `<a href="#" id="btn-roles" title='Roles' class="btn btn-info shadow btn-xs sharp"><i class="fas fa-sitemap"> </i> </a>`
                    
            //         return dt2
            //     }
            // },
        ],
    });

    var table_data_user = $('#table_data_user').DataTable({
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
            "url": "/Api/Setting/UserRole/findUserByRole",
            "type": "get",
            "dataType": 'json',
            "data": {
                role_id: function() { return $('#role_id').val() },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "id",
                render: function(data, type, row, meta) { 
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
            },
            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/Setting/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = row.user.name;
                    return dt1;
                },
            },
            { "data": "user","width":"35%",
                render: function(data, type, row, meta) { 
                    // var dt1 = '<a style="color:blue;" href="/EmployeeData/EmployeeDetail/'+row.nik+'">'+row.name+'</a><br>';
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';
                    var dt1 = data.email;
                    return dt1;
                },
            },
            { "data": "user.roles","width":"25%",
                render: function(data, type, row, meta) { 
                    let dt1 = ''
                    $.each(data, function(k,v) {
                        if(v.role.id === row.role_id) {
                            dt1 += '<span class="badge badge-primary">'+v.role.name+' (selected)</span><br>'
                        }else {
                            dt1 += '<span class="badge badge-secondary"><a class="text-white" href="/Settings/RoleUser/'+v.role.id+'">'+v.role.name+'</a></span><br>'
                        }
                    })
                    return dt1;
                },
            },
            
            
            { "data": "","width":"10%",
                render: function(data, type, row) { 
                    // var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="EmployeeData/EmployeeEdit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    // var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'

                    // var dt1 = `<a href="#" id="btn-accesses" title='Access' class="btn btn-info shadow btn-xs sharp"><i class="fa fa-user"> </i> </a> `
                    var dt2 = `<span><a href="#" id="btn-remove-user" data-id="${row.id}" title='Unassign User from Role' class="btn btn-danger shadow sharp "><i class="fas fa-user-minus"></i></a></span>`
                    
                    return dt2
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

    //get access by id
    window.getAccessById = function (accessId, roleId = '') {
        if (roleId === '') {
            roleId = $('#role_id').val();
        }else {
            roleId = roleId;
        }
        return fetch(`/Api/Setting/Access/selected?access_id=${accessId}&role_id=${roleId}`)
            .then(response => response.json())
            .catch(error => {
                console.error('Error loading access data:', error);
                throw error;
            });
    };

    // Load User Data into Modal
    window.loadUserDataNoAssignedRole = function (role_id) {
        fetch(`/Api/Setting/UserRole/listUserNoAssignedRole?role_id=${role_id}`)
            .then(res => res.json())
            .then(response => {
                $('#assignUserModal').modal('show');
                $('#assignUserModal .modal-body .user-select').html('');
                $('#assignUserModal .modal-body .user-select').append(`
                    <div class="form-group">
                        <select class="form-control select2" name="user_assigned" id="user_assigned">
                            
                        </select>
                    </div>
                `);

                response.data.forEach(user => {
                    console.log(user);
                    $('#assignUserModal .modal-body .user-select #user_assigned').append(`
                       <option value="${user.id}" selected>${user.name} (${user.email})</option>
                    `);
                    
                });

                // Initialize Select2 for the dynamically added select element
                $(`.user-select .select2`).select2({
                    placeholder: "Select user",
                    allowClear: true,
                    width: '100%'
                });
            })
            .catch(error => console.error('Error loading user data:', error));
    };

    // Load Access Data into Modal
    window.loadAccessListData = function (accessId = '') {
        

        $('#updateAccessModal').modal('show')

        

        let parentId = '';
        getAccessById(accessId).then(vaccess => {
            console.log(vaccess);

            let data = vaccess.data;
            let data_access = vaccess.data.access;

            $('#updateAccessModal .modal-body #accessId').val(data_access.id);
            $('#updateAccessModal .modal-body #accessName').val(data_access.name);
            $('#updateAccessModal .modal-body #accessLabel').val(data_access.label);
            $('#updateAccessModal .modal-body #accessPrefix').val(data_access.prefix);
            $('#updateAccessModal .modal-body #accessIcon').val(data_access["fa-icon"]);
            $('#updateAccessModal .modal-body #accessDescription').val(data_access.description);
            $('#updateAccessModal .modal-body #accessOrder').val(data_access.order);

            // $('#updateAccessModal .modal-body #accessId').attr('', true);
            $('#updateAccessModal .modal-body #accessName').attr('disabled', true);
            $('#updateAccessModal .modal-body #accessLabel').attr('disabled', true);
            $('#updateAccessModal .modal-body #accessPrefix').attr('disabled', true);
            $('#updateAccessModal .modal-body #accessIcon').attr('disabled', true);
            $('#updateAccessModal .modal-body #accessDescription').attr('disabled', true);
            $('#updateAccessModal .modal-body #accessOrder').attr('disabled', true);

            $('#updateAccessModal .modal-body #is_create').prop('checked', data.is_create);
            $('#updateAccessModal .modal-body #is_read').prop('checked', data.is_read);
            $('#updateAccessModal .modal-body #is_update').prop('checked', data.is_update);
            $('#updateAccessModal .modal-body #is_delete').prop('checked', data.is_delete);

            parentId = data_access.parent_id;
        }).catch(error => console.error('Error fetching access data:', error));

        fetch(`/Api/Setting/Access/list?access_id=${accessId}`)
            .then(res => res.json())
            .then(response => {
                $('#updateAccessModal').modal('show');
                $('#updateAccessModal .modal-body #divAccessParent').html('');
                $('#updateAccessModal .modal-body #divAccessParent').append(`
                    <div class="form-group">
                        <select class="form-control select2" name="parent_id" id="accessParent">
                            <option value="">Select Access Parent</option>
                        </select>
                    </div>
                `);

                response.data.forEach(access => {
                    

                    $('#updateAccessModal .modal-body #divAccessParent select').append(`
                       <option value="${access.id}" ${access.id === parentId ? 'selected' : ''}>${access.name}</option>
                    `);
                    
                });

                
                // Initialize Select2 for the dynamically added select element
                $(`#divAccessParent .select2`).select2({
                    placeholder: "Select Access Parent",
                    allowClear: true,
                    tags: true,
                    width: '100%',
                    dropdownParent: $('#updateAccessModal .modal-body #divAccessParent')
                });
                

                $('#updateAccessModal .modal-body #divAccessParent select').attr('disabled', true);
            })
            .catch(error => console.error('Error loading user data:', error));
    };

    // Load Access Data into Modal
    window.loadAccessNotExistByRoleId = function (roleId = '') {
        

        fetch(`/Api/Setting/RoleAccess/notexist?role_id=${roleId}`)
            .then(res => res.json())
            .then(response => {
                $('#assignAccessModal').modal('show');
                $('#assignAccessModal .modal-body #divAccess').html('');
                $('#assignAccessModal .modal-body #divAccess').append(`
                    <div class="form-group">
                        <select class="form-control select2" name="access_id" id="select_access_id">
                            <option value="">Select Access Parent</option>
                        </select>
                    </div>
                `);

                response.data.forEach(access => {
                    

                    $('#assignAccessModal .modal-body #divAccess select').append(`
                       <option value="${access.id}" >${access.name}</option>
                    `);
                    
                });

                
                // Initialize Select2 for the dynamically added select element
                $(`#divAccess .select2`).select2({
                    placeholder: "Select Access Parent",
                    allowClear: true,
                    tags: true,
                    width: '100%',
                    dropdownParent: $('#assignAccessModal .modal-body #divAccess')
                });
                

                $('#assignAccessModal').modal('show')
            })
            .catch(error => console.error('Error loading user data:', error));
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

    $('#table-data').on('click', '#btn-accesses', function() {
        
    });

    $('#table-data').on('click', '#btn-Roles', function() {
        
    })

    $('#table_data_role').on('click', '.btn-edit-access', function() {
        $('#updateAccessModal #accessId').val($(this).data('id'))
        $('#updateAccessModal #accessName').val($(this).data('name'))
        $('#updateAccessModal #accessLabel').val($(this).data('label'))
        $('#updateAccessModal #accessPrefix').val($(this).data('prefix'))
        $('#updateAccessModal #accessIcon').val($(this).data('icon'))
        $('#updateAccessModal .modal-body #accessDescription').val($(this).data('description'))
        $('#updateAccessModal #accessParent').val($(this).data('parent'))

        $('#updateAccessModal').modal('show')
    })

    $('#table_data_role').on('click', '.btn-edit-role', function() {
        $('#updateRoleModal #roleId').val($(this).data('id'))
        $('#updateRoleModal #roleName').val($(this).data('name'))

        $('#updateRoleModal').modal('show')
    })

    $('#assignAccessModal').on('change', '#divAccess select', function() {
        let selectedValue = $(this).val();
        var form = $('#assignAccessModal .modal-body form')[0];
        if (form) {
            form.reset();
        }
        if (selectedValue) {
            getAccessById(selectedValue, '-').then(vaccess => {

                let data_access = vaccess.data;

                $('#assignAccessModal .modal-body #accessId').val(data_access.id);
                $('#assignAccessModal .modal-body #accessName').val(data_access.name);
                $('#assignAccessModal .modal-body #accessLabel').val(data_access.label);
                $('#assignAccessModal .modal-body #accessPrefix').val(data_access.prefix);
                $('#assignAccessModal .modal-body #accessIcon').val(data_access["fa-icon"]);
                $('#assignAccessModal .modal-body #accessDescription').val(data_access.description);
                $('#assignAccessModal .modal-body #accessOrder').val(data_access.order);
                $('#assignAccessModal .modal-body #accessParent').val(data_access.parent.name);

                $('#assignAccessModal .modal-body #accessName').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessLabel').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessPrefix').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessIcon').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessDescription').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessOrder').attr('disabled', true);
                $('#assignAccessModal .modal-body #accessParent').attr('disabled', true);
                

            }).catch(error => console.error('Error fetching access data:', error));
        } else {
            // Handle the case when no value is selected

            
        }
    });

    function initDatatable(id)
    {
        $(id).DataTable();
    }
});