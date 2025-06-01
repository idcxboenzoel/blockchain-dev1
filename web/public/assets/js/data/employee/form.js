$(function(){
    "use strict"
    
    $("#btnSubmit").on('click', function(e) {
        let that = $('#formUpdate')

        if(!checkSuperior()) {
            let email = $('.superior_email.required')
            let name = $('.superior_name.required')
            let pos = $('.superior_pos.required')

            email.each(function(k,v) {
                if($(`.superior_email_${k}.required`).val() === '') {
                    $(`.superior_email_${k}.required`).css('border','1px solid red')
                }
            })

            name.each(function(k,v) {
                if($(`.superior_name_${k}.required`).val() === '') {
                    $(`.superior_name_${k}.required`).css('border','1px solid red')
                }
            })

            pos.each(function(k,v) {
                if($(`.superior_pos_${k}.required`).val() === '') {
                    $(`.superior_pos_${k}.required`).css('border','1px solid red')
                }
            })

            return false;
        }

        if($('.file_evidence_size_total').val() > 15) {
            // alertFailed(`File all maximal 15mb, your total file size is : ${$('.file_evidence_size_total').val()}`)
            alertFailed(`File size limit exceeded.<br><span>Maximum limit is 15 MB</span>`)
        }

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let alertHtml = alertConfirm({}, 'submit');

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
                            
                            html = "<p>Update data is succesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);
                            alertSuccessfully()
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

    function checkSuperior()
    {
        let vreturn = true;
        $('.superior_nik').each(function(k,v) {
            let nik = $('.superior_nik_'+k).val()
            let email = $('.superior_email_'+k).val()
            let name = $('.superior_name_'+k).val()
            let pos = $('.superior_pos_'+k).val()
            if(nik !== "") {
                $('.superior_email_'+k).addClass('required')
                $('.superior_name_'+k).addClass('required')
                $('.superior_pos_'+k).addClass('required')
                if(email === '') {
                    vreturn = false;
                }
                if(pos === '') {
                    vreturn = false;
                }
                if(name === '') {
                    vreturn = false;
                }
            }else {
                $('.superior_email_'+k).removeClass('required')
                $('.superior_name_'+k).removeClass('required')
                $('.superior_pos_'+k).removeClass('required')
            }
        })

        return vreturn;
        
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

        if(type === 'upload') {
            title = 'Upload employee data?'
            title_desc1 = 'Are you sure you want to upload '
            title_desc2 = 'the employee data?'
            show_desc2 = ''
        }else {
            title = 'Save employee data?'
            title_desc1 = 'Are you sure you want to save change for '
            title_desc2 = 'this employee data?'
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