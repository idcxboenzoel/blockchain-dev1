$(function(){
    "use strict"
    
    $("#btnSubmit").on('click', function(e) {
        let that = $('#formUpdate')

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'migration');

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
                            
                            html = "<p>Migration is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()

                            loadApproval()
                            loadTargetApproval('')
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

    loadApproval()
    

    $('#approval_list').on('change', function() {
        let approval = $(this).val();

        loadTargetApproval(approval)
    })
    

    function loadApproval()
    {
        $.ajax({
            type: "POST",
            url: '/Api/Employee/approval',
            data: {}, // serializes the form's elements.
            dataType: "json",
            success: function(data)
            {

                if(data.status === 500 || data.status === 504 || data.status === 503) {
                    // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                    let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                    alertFailed(message)
                    return false
                }

                if(data.status !== 200) {
                    let message = data.message
                    alertFailed(message)
                    return false
                }

                let list = '<option value="">Select Approval</option>'
                $.each(data.data, function(k, v) {
                    var delegate = v.delegate_to ? ` || delegate: ${v.delegate_to + " - " + v.employee_delegated.fullname}` : ''
                    list += `<option value="${v.spv_nik}">${v.spv_nik + " - " + v.spv_fullname + delegate}</option>`
                })

                $('#approval_list').html(list)

                
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });
    }

    function loadTargetApproval(except)
    {
        $.ajax({
            type: "POST",
            url: '/Api/Employee/target_approval',
            data: {'except' : except}, // serializes the form's elements.
            dataType: "json",
            success: function(data)
            {

                if(data.status === 500 || data.status === 504 || data.status === 503) {
                    // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                    let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                    alertFailed(message)
                    return false
                }

                if(data.status !== 200) {
                    let message = data.message
                    alertFailed(message)
                    return false
                }
                
                let list = '<option value="">Select Target Approval</option>'
                $.each(data.data, function(k, v) {
                    list += `<option value="${v.nik}">${v.nik + " - " + v.fullname}</option>`
                })

                $('#target_approval_list').html(list)
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });
    }


    // alert confirm 
    function alertConfirm(data, type) { 
        let title = ''
        let title_desc1 = ''
        let title_desc2 = ''
        let show_desc1 = ''
        let show_desc2 = ''
        let show_name = ''
        let show_nik = ''

        if(type === 'migration') {
            title = 'Migration Approval?'
            title_desc1 = 'Are you sure you want to migration '
            title_desc2 = ''
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