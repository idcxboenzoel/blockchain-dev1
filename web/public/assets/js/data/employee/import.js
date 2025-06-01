$(function(){
    "use strict"
    
    $('#exportExcel').on('click', function() {
        $('.buttons-excel').trigger('click')
    })

    $('.btn_choose_file,.file_upload').on('click', function() {
        $('#file_upload').trigger('click')
    })

    function fileUploadEvent(id, target, target_name) 
    {
        // Get a reference to the file input
        const fileInput = document.getElementById(id)

        // Listen for the change event so we can capture the file
        fileInput.addEventListener('change', (e) => {
            // Get a reference to the file
            const file = e.target.files[0];
            // console.log(file)

            document.getElementById(target_name).value = file['name']

            let file_exist = $('.file_evidence_size_total');
            let file_size = 0;
            // get all upload file
            // $('.upload-evidence').each(function() {
                

            //     const vfileInput = document.getElementById($(this).attr('id'));

            //     if (!vfileInput.value ||
            //         typeof vfileInput.files === 'undefined' ||
            //         typeof vfileInput.files[0] === 'undefined' ||
            //         typeof vfileInput.files[0].size !== 'number'
            //     ) {
            //         file_size += 0
            //     }else {
            //         file_size += (file.size / 1024) / 1024
            //     }
            //     // console.log($(this).attr('id'), file_size)
                
            // })

            // if(file_size > 15) {
            //     alertFailed(`File size ${file['type']} MB is over limit. Max limit : 15 MB`)
            // }

            $('#text_fileupload').attr('placeholder', file['name'])

            if(file['type'] != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                alertFailed(`Invalid file format. <br><span>The file <b>${file['name']}</b> could not be uploaded. <br></br>Only files with the following extensions are allowed: <br><b>xlsx</b></span>`)
                $('.file_upload').attr('placeholder','Choose file to upload here')
                $('#filename').val('')
                return false;
            }
            

            // Encode the file using the FileReader API
            const reader = new FileReader();
            reader.onloadend = () => {
                // Use a regex to remove data url part
                const base64String = reader.result
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                console.log(base64String);

                document.getElementById(target).value = base64String
                // Logs wL2dvYWwgbW9yZ...
            };
            reader.readAsDataURL(file);
        });
    }

    fileUploadEvent('file_upload', 'filebase64', 'filename');

    $("#formBulkUploadEmployeeData").submit(function(e) {
        
        let that = $(this)

        if($('#filebase64').val() === '') {
            return false;
        }
        e.preventDefault(); // avoid to execute the actual submit of the form.
        let alertHtml = alertConfirm({}, 'upload');

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: alertHtml,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            customClass: {
                container: 'container-upload'
            },
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
                            // console.log(data)
                            // if(data.status === 404) {
                                
                            //     alertFailed(data.message)
                            //     return false
                            // }
                            
                            // html = "<p>Upload data is succuesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }

                            


                            // alertSuccess("Success", '', html);
                            alertCompleted(data.success, data.failed)
                            
                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertFailed(xhr.message);
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

       
    function Validate(oForm) {
        var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"]; 
        var arrInputs = oForm.getElementsByTagName("input");
        for (var i = 0; i < arrInputs.length; i++) {
            var oInput = arrInputs[i];
            if (oInput.type == "file") {
                var sFileName = oInput.value;
                if (sFileName.length > 0) {
                    var blnValid = false;
                    for (var j = 0; j < _validFileExtensions.length; j++) {
                        var sCurExtension = _validFileExtensions[j];
                        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                            blnValid = true;
                            break;
                        }
                    }
                    
                    if (!blnValid) {
                        alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
                        return false;
                    }
                }
            }
        }
    
        return true;
    }
    

    $('.upload-evidence').each(function() {
        let idx = $(this).attr('data-idx')

        let id = `evidence${idx}`
        let target = `evidence_file${idx}`
        let target_name = `evidence_name${idx}`
        console.log(id)
        fileUploadEvent(id, target, target_name);
    })

    // alertCompleted(10,10)
    function alertCompleted(success, failed) { 
        

        Swal.fire({
            title: "",
            icon: "",
            timerProgressBar: true,
            html: `
                <div class="modal_upload">
                    <header class="header-modal">
                        <div class="icon-and-text">
                        <img class="editorial" src="/assets/images/editorial-1.png" />
                        <div class="text-wrapper">Data upload finished</div>
                        </div>
                        <div class="close"><img class="frame" src="/assets/images/frame-7567.svg" /></div>
                    </header>
                    <div class="ITEMS">
                        <p class="div">Here are the details of your current batch upload:</p>
                        <div class="details">
                            <p class="p">${success} employee records have been imported succesfully</p>
                            <p class="text-wrapper-2">${failed} employee records were not imported due to errors</p>
                        </div>
                        <p class="you-can-check-on">
                            <span class="span">You can check on </span>
                            <span class="text-wrapper-3"><a href='/Employee/HistoryLogs'>History Log</a></span>
                            <span class="text-wrapper-4"> for the details</span>
                        </p>
                    </div>
                    <div class="BUTTONS">
                        <div class="normal"><div class="ok">Ok</div></div>
                    </div>
                </div>
            `,
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
              $('.modal_upload .ok').on('click', function() {
                swal.close()
              })
              
            },
            didClose: () => {
              
            },
            willClose: () => {
              
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