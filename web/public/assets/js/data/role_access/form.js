$(function(){
    "use strict"
    
    // user role
    $("#assignUserForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'assign-user');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = form.attr('action');

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Assign data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_user').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#assignUserModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
            
    });

    // role access
    $("#assignAccessForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'assign-access');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = form.attr('action');

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Assign Access to role is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_access').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#assignAccessModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
            
    });

    $("#updateAccessForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'update-access');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = form.attr('action');

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Update Role Access is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_access').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#updateAccessModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
            
    });

    // updateAccessForm

    $('#table_data_user').on('click', '#btn-remove-user', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'remove-assign-user');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = "/Api/Setting/UserRole/removeUser";

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: { "id": that.attr('data-id') }, //"}, // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Remove User from Role is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_user').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#assignUserModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
    });


    // role
    $("#createRoleForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'create-role');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = form.attr('action');

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Create Role data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_role').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#addRoleModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
            
    });

    // role
    $("#updateRoleForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'update-role');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = form.attr('action');

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Update Role data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_role').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#updateRoleModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
            
    });

    // remove role
    $('#table_data_role').on('click', '.btn-remove-role', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'remove-role');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = "/Api/Setting/Role/remove";

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: { "role_id": that.attr('data-id') }, //"}, // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Remove Role is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_role').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#removeRoleModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                })

                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                })
                
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
    });

    // remove access
    $('#table_data_access').on('click', '.btn-remove-access', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'remove-assign-access');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: 'swal-wide',
            // timer:`${countdown_time_ms + 2000}`,
            background: "rgba(0,0,0,0)",
            backdrop: `
                rgba(0,0,0,0.9)
            `,
            didOpen: () => {
                
                $('.modal_alert .yes').on('click', function() {
                    swal.close()
                    var form = that;
                    var actionUrl = "/Api/Setting/RoleAccess/remove";

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: { "id": that.attr('data-id') }, //"}, // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Remove Access from Role is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data_access').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#removeAccessModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID
                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })
                $('.modal_alert .cancel').on('click', function() {
                    swal.close()
                    return false;
                }
                )
                $('.modal_alert .close').on('click', function() {
                    swal.close()
                    return false;
                }
                )
            },
            didClose: () => {
                
            },
            willClose: () => {
                
            }
        });
    });



    // alert confirm 
    function alertConfirm(data, type) { 
        let title = ''
        let title_desc1 = ''
        let title_desc2 = ''
        let show_desc1 = ''
        let show_desc2 = ''
        let show_name = ''
        let show_nik = ''

        if(type === 'assign-user') {
            title = 'Assign user to role?'
            title_desc1 = 'Are you sure you want to assign '
            title_desc2 = 'the user to role?'
            show_desc2 = ''
        }else if(type === 'remove-assign-user') {
            title = 'Remove user from role?'
            title_desc1 = 'Are you sure you want to remove selected user '
            title_desc2 = 'from role?'
            show_desc2 = ''
        }
        else if(type === 'assign-access') {
            title = 'Assign access to role?'
            title_desc1 = 'Are you sure you want to assign '
            title_desc2 = 'the access to role?'
            show_desc2 = ''
        }
        else if(type === 'update-access') {
            title = 'Update access to role?'
            title_desc1 = 'Are you sure you want to update '
            title_desc2 = 'the access to role?'
            show_desc2 = ''
        }
        else if(type === 'remove-assign-access') {
            title = 'Remove access from role?'
            title_desc1 = 'Are you sure you want to remove selected access '
            title_desc2 = 'from role?'
            show_desc2 = ''
        }
        else if(type === 'create-role') {
            title = 'Create Role?'
            title_desc1 = 'Are you sure you want to create '
            title_desc2 = 'the role?'
            show_desc2 = ''
        }
        else if(type === 'update-role') {
            title = 'Update Role?'
            title_desc1 = 'Are you sure you want to update '
            title_desc2 = 'the role?'
            show_desc2 = ''
        }
        else if(type === 'remove-role') {
            title = 'Remove role?'
            title_desc1 = 'Are you sure you want to remove selected role '
            title_desc2 = 'from system?'
            show_desc2 = ''
        }

        return `
                <div class="modal_alert">
                    <header class="header-modal">
                        <div class="icon-and-text">
                        <img class="editorial" src="/assets/images/editorial-1.png" />
                        <div class="text-wrapper">${title}</div>
                        </div>
                        <div class="close"><img class="frame" src="/assets/images/frame-7567.svg" /></div>
                    </header>
                    <div class="ITEMS">
                        <p class="div title_desc1 ${show_desc1}" >${title_desc1}</p>
                        <p class="div title_desc2 ${show_desc2}" >${title_desc2}</p>
                        <p class=""></p>
                    </div>
                    <div class="BUTTONS">
                        <div class="normal">
                            <button class="cancel">Cancel</button>
                        </div>
                        <div class="normal">
                            <button class="yes">Yes</button>
                        </div>
                    </div>
                </div>
            `

        
    }


});