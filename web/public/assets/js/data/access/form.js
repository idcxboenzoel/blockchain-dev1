$(function () {
    "use strict";

    // Handle toggle status button click
    $('#table_data').on('click', '.btn-toggle-status', function () {
        const accessId = $(this).data('id');
        const currentStatus = $(this).data('status');
        const newStatus = currentStatus == 1 ? 0 : 1; // Toggle status

        // Confirm the action
        let alertHtml = alertConfirm({}, 'change-status-access');

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
                    var actionUrl = "/Api/Setting/Access/changeStatus";

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: {
                            "id": accessId,
                            "status": newStatus
                        }, // serializes the form's elements.
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
                            
                            html = "<p>Change Status Access data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#ChangeStatusAccessModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

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

    // accesss
    $("#addAccessForm").on('submit', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'create-access');

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
                            
                            html = "<p>Create Access data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data').DataTable().ajax.reload(null, false); // false to keep the current page

                            // Dispose of the modal after success
                            $('#addAccessModal').modal('hide'); // Replace 'assignUserModal' with your modal's ID

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

    // access
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
                            
                            html = "<p>Update Access data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data').DataTable().ajax.reload(null, false); // false to keep the current page

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

    $('#table_data').on('click', '.btn-delete-access', function(e) {
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'delete-access');

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
                    var actionUrl = "/Api/Setting/Access/remove";

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
                            
                            html = "<p>Remove Access is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            // Reload the DataTable after success
                            $('#table_data').DataTable().ajax.reload(null, false); // false to keep the current page

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

    // alert confirm 
    function alertConfirm(data, type) { 
        let title = ''
        let title_desc1 = ''
        let title_desc2 = ''
        let show_desc1 = ''
        let show_desc2 = ''
        let show_name = ''
        let show_nik = ''

        if(type === 'create-access') {
            title = 'Create access?'
            title_desc1 = 'Are you sure you want to create '
            title_desc2 = 'the access?'
            show_desc2 = ''
        }else if(type === 'update-access') {
            title = 'Update access?'
            title_desc1 = 'Are you sure you want to update '
            title_desc2 = 'the access?'
            show_desc2 = ''
        }else if(type === 'delete-access') {
            title = 'Delete access?'
            title_desc1 = 'Are you sure you want to delete '
            title_desc2 = 'the access?'
            show_desc2 = ''
        }else if(type === 'change-status-access') {
            title = 'Change status?'
            title_desc1 = 'Are you sure you want to change '
            title_desc2 = 'the status?'
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