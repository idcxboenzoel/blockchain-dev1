$(function(){
    "use strict"

    $('.tooltip-info-evidence').tooltip('enable')

    let max_total = parseFloat($('#total_weight_quantitative').val());
    $('.tooltip-info-max-weight-qualitative').attr('title','Maximum Total Weight is '+ max_total)
    $('.tooltip-info-max-weight-qualitative').tooltip('enable')

    $(':input[type="number"]').on('keyup click change keydown', function() {
        if(parseFloat($(this).val()) < 0) {
            $(this).val(0)
            return false;
        }

        if(parseFloat($(this).val()) > 100) {
            $(this).val(100)
            return false;
        }
    })

    $(document).on('keyup change click keydown',':input[type="number"]', function() {
        if(parseFloat($(this).val()) < 0) {
            $(this).val(0)
            return false;
        }

        if(parseFloat($(this).val()) > 100) {
            $(this).val(100)
            return false;
        }
    })

    $(document).on('keyup change click keydown','.achievement_score', function() {
        setScore($(this))
    })

    setTotal()
    $(document).ready(function() {
        setTotalQualitative()
        setTotalFinalScore()
        setTotalFinalScoreQualitative()
    });

    function fileUploadEvent(id, target, target_name, target_url, btn_upload) 
    {
        // Get a reference to the file input
        const fileInput = document.getElementById(id)

        // Listen for the change event so we can capture the file
        fileInput.addEventListener('change', (e) => {
            // Get a reference to the file
            const file = e.target.files[0];
            // console.log(file)

            let file_exist = $('.file_evidence_size_total');
            let file_size = 0;
            if (!fileInput.value ||
                typeof fileInput.files === 'undefined' ||
                typeof fileInput.files[0] === 'undefined' ||
                typeof fileInput.files[0].size !== 'number'
            ) {
                file_size += 0
            }else {
                file_size += (file.size / 1024) / 1024
            }

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
                
            //     console.log('file_size' + file_size.toFixed(2))
            // })
            
            if(file_size > 15) {
                alertFailed(`File size limit exceeded.<br><span>Maximum limit is 15 MB</span>`)
                $("#"+target_name).val('')
                return false;
            }

            if(file['type'] === 'image/jpeg' || file['type'] === 'image/jpg'
                || file['type'] === 'image/png' 
                || file['type'] === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                || file['type'] === 'application/pdf'
                // || file['type'] === 'application/vnd.ms-powerpoint'
                || file['type'] === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                // || file['type'] === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )
                {
                    
            }else {
                alertFailed(`Invalid file format. <br><span>The file <b>${file['name']}</b> could not be uploaded. <br></br>Only files with the following extensions are allowed: <br><b>jpeg, png, pdf and xlsx</b></span>`)
                $("#"+target_name).val('')
                
                return false;
            }

            document.getElementById(target_name).value = file['name']

            // Encode the file using the FileReader API
            const reader = new FileReader();
            reader.onloadend = () => {
                // Use a regex to remove data url part
                const base64String = reader.result
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                

                document.getElementById(target).value = base64String

                const blob = b64toBlob(base64String, file.type);
                const blobUrl = URL.createObjectURL(blob);
                // console.log(target_url);
                document.getElementById(target_url).innerHTML = ''
                document.getElementById(target_url).innerHTML  = `<a target="_blank" style="color:#0277BD;white-space:wrap;width:70px;" href="${blobUrl}">${file['name']}</a>`

                document.getElementById(btn_upload).innerHTML = 'Replace'
                // Logs wL2dvYWwgbW9yZ...
            };
            reader.readAsDataURL(file);
        });
    }

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
        
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
            }
        
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
            
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
    
    $("#btn2").click(function(){
        let html = $('.quantitative-tab .tr_content:nth-child(1)').clone();
        let idx = 0;
        
        $('.quantitative-tab .tr_content').each(function() {
            idx += 1;
        })
    
        let newindex = idx;
        

        html.find('.key_performance_indicator').val('')
        html.find('.target').val('')
        html.find('.formula').val('')
        html.find('.achievement').val('')
        html.find('.weight_percent').val('')
        html.find('.index_content').html(newindex+1)
        
        html.find('.evidence_url').html('')
        html.find('.evidence_url').attr('id', 'evidence_url'+newindex)
        html.find('.evidence_file').val('')
        html.find('.evidence_file').attr('id', 'evidence_file'+newindex)
        html.find('.evidence_name').val('')
        html.find('.evidence_name').attr('id', 'evidence_name'+newindex)
        html.find('.evidence_path_file').val('')
        html.find('.evidence_path_file').attr('id', 'evidence_path_file'+newindex)
        html.find('.evidence_file_public_url').val('')
        html.find('.evidence_file_public_url').attr('id', 'evidence_file_public_url'+newindex)

        html.find('.upload-evidence').attr('id','evidence'+newindex)
        html.find('.upload-evidence').attr('data-idx',newindex)

        html.find('.file_evidence_browser').val('')
        html.find('.file_evidence_browser').html('Upload')
        html.find('.file_evidence_browser').attr('data-id','evidence'+newindex)
        
        html.find('.file_evidence_browser').addClass('file_evidence_browser_'+newindex)
        html.find('.file_evidence_browser').attr('id', 'btn_evidence'+newindex)

        html.find('.btn_delete_kpi').show();
        html.find('.btn_delete_kpi').attr('data-index', newindex)

        html.removeClass('index-0');
        html.addClass('index-'+newindex);

        

        $(".quantitative-tab tbody").append(html);

        let id = `evidence${newindex}`
        let target = `evidence_file${newindex}`
        let target_name = `evidence_name${newindex}`
        let target_url = `evidence_url${newindex}`
        let btn_upload = `btn_evidence${newindex}`
        
        fileUploadEvent(id, target, target_name, target_url, btn_upload);

        // set total
        setTotal()
    
        
        
    });

    $('.quantitative-tab .tr_content:nth-child(1) .btn_delete_kpi').hide();
    $(document).on('click', '.btn_delete_kpi', function(){
        
        let index = $(this).attr('data-index')

        let idx = 0;
        $('.quantitative-tab .tr_content .index_content').each(function(k,v) {
            idx = k
            
        })
    

        if(idx < 1) {
            return false;
        }
        // alert(index)
        $(".quantitative-tab tbody .tr_content.index-"+index).remove()

        $('.quantitative-tab .tr_content .index_content').each(function(k,v) {
            $(this).html(k+1)
        })
        

        return false;
        
    });

    $("#btnSubmit").click(function(e){
        
        // let totalw = parseFloat($('#total_weight').html());
       
        // if(totalw != max_total) {
        //     alertWarning('Warning', 'Maximum Total Weight must be '+max_total)
        //     return false;
        // }

        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.
        

        let nik = $('#nik_employee').val();
        let name = $('#name_employee').val();

        let alertHtml = alertConfirm({'nik':nik, 'name' : name}, 'submit');

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
                    var form = $('#formSubmit');
                    var actionUrl = that.attr('action');

                    console.log(form)

                    $.ajax({
                        type: "POST",
                        url: actionUrl,
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {
                            swal.close()
                            if(data.status === 500 || data.status === 504 || data.status === 503) {
                                // An unknown error has occurred.<br><span>Please contact IT through @ask.IT for further assistance.</span>
                                let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
                                alertFailed(message)
                                return false
                            }
                            // Failed to submit data.<br><span>Make sure you fill all the form with the right data.</span>

                            if(data.status !== 201) {
                                let message = data.message
                                alertFailed(message)
                                return false
                            }
                            
                            html = "<p>Submit goal setting is succuesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                            // alertSuccess("Success", '', html);

                            alertSuccessSubmit()

                            setTimeout(function() {
                                location.reload();
                            },2000)
                            
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

    $('#btnNext').click(function(e) {
        e.preventDefault();
        let href = '#caep'
        $('.nav-link.active').removeClass('active')
        $('.nav-link.tab2_button').addClass('active')

        $('.tab-pane.active').removeClass('active')
        $('#caep').addClass('active')
        $('#caep').addClass('show')

        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    })

    $(".btn-save-draft").click(function(e){
        
        // let totalw = parseFloat($('#total_weight').html());
       
        // if(totalw != max_total) {
        //     alertWarning('Warning', 'Maximum Total Weight must be '+max_total)
        //     return false;
        // }
        let text = 'save data to draft'
        // if($('.expected_response').val() === "" || $('.expected_response').val() === null) {
        //     text = "Tab Mid Year Monitoring has empty value."
            
        // }

        let that = $(this);

        e.preventDefault(); // avoid to execute the actual submit of the form.



        let nik = $('#nik_employee').val();
        let name = $('#name_employee').val();

        let alertHtml = alertConfirm({'nik':nik, 'name' : name}, 'draft');
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
                    var form = $('#formSubmit');
                    var actionUrl = that.attr('action');
        
                    console.log(form)
        
                    $.ajax({
                        type: "POST",
                        url: actionUrl + '',
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {
                            console.log(data)
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
                            
                            html = "<p>Save draft goal setting is succuesfully.</p>"
                            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"
        
                            // alertSuccess("Success", '', html);
                            alertSuccessfully()
                            setTimeout(function() {
                                window.location.reload
                            },2000)
                            
                        },
                        failed: function(xhr, textStatus, errorThrown){
                            alertError('Failed', xhr.message);
                        }
                    });
                })

                $('.modal_alert .cancel').on('click', function() {
                    let href = '#caep'
                    // $('.nav-link.active').removeClass('active')
                    // $('.nav-link.tab2_button').addClass('active')

                    // $('.tab-pane.active').removeClass('active')
                    // $('#caep').addClass('active')
                    // $('#caep').addClass('show')

                    // $('#btnNext').click()
                    swal.close()
                    
                    return false;
                })

                $$('.modal_alert .close').on('click', function() {
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

    $(document).on('keyup','.weight_percent', function() {
        setTotal()
    })

    $(document).on('change','.weight_percent', function() {
        setTotal()
    })

    $(document).on('keydown','.weight_percent', function() {
        setTotal()
    })

    $(document).on('keydown keyup change','.weight_percent', function(e) {
        var a = [];
        var k = e.which || e.KeyCode;
    
        if(k == 8 || k == 46) {

        }else {
            if  ( k >=48 && k <= 57) {
    
            }else {
                e.preventDefault();
            }
        }
            
  
        // console.log(k)
  
            
    })
  
    $(document).on('keydown keyup change','.achievement', function(e) {
      var a = [];
      var k = e.which || e.KeyCode;
  
      if(k == 8 || k == 46) {

      }else {
          if  ( k >=48 && k <= 57) {
  
          }else {
              e.preventDefault();
          }
      }
      
          
  
      // console.log(a.indexOf(k))
  
          
    })

    

    $(document).on('click','.file_evidence_browser', function(e) {
        e.preventDefault();
        let id = $(this).attr('data-id')
        // alert(id)

        $('#' + id).click()

        return false;
    })

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

    $('.weight_percent').on('change keyup keydown', function(event) {
        
    });

    
    
    

    function setScore(that)
    {
        let total = parseInt(that.val());

        let parent = that.attr('data-idx_score')
        let parent_final_score = that.attr('data-idx_final_score')
        let idx_final_score = that.attr('data-idx_final_score')

        let weight_percent = $('.weight_percent.' + idx_final_score + '').val();
        // console.log(weight_percent)

        let value_range = [];
        let achievement_range = [];
        let score_max = $('.value_quantitative').length;
        $('.value_quantitative').each( function(k,v) {
            achievement_range.push({
                'value' : $(this).val(),
                'start_value' : $(this).parent().find('.start_value_quantitative:eq("'+k+'")').val(),
                'end_value' : $(this).parent().find('.end_value_quantitative:eq("'+k+'")').val(),
                'value_score': score_max,
            })
            score_max--;
        })
        // console.log(achievement_range)

        $.ajax({
            type: "POST",
            url: '/Api/PerformanceAppraisal/calculate_score_quantitative',
            data: {
                'weight_percent':weight_percent,
                'achievement_score':total,
                'achievement_range':achievement_range
            }, // serializes the form's elements.
            success: function(data)
            {
                let vdata = JSON.parse(data)
                
                
                $('.' + parent + ' .score').html(vdata.data);
                $('.' + parent + ' input.score').val(vdata.data);

                $('.' + parent_final_score + ' .final_score').html(vdata.final_score);
                $('.' + parent_final_score + ' input.final_score').val(vdata.final_score);

                setTotalFinalScore()
                
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });

    
    }

    function setTotalFinalScore()
    {
        let total = 0;
       
        $('.final_score').each( function() {
            // console.log('final_score '+$(this).val())
            total += parseFloat($(this).val() ? $(this).val() : '0.00');
            console.log('total '+total)
        })

        $('.total_score').html(Number(total).toFixed(2));
        $('input.total_score').val(Number(total).toFixed(2));
    }

    // qualitative

    function setTotalQualitative()
    {
        let total = 0;
       
        $('.weight_percent_qualitative').each( function() {
            
            total += parseFloat($(this).val());
        })

        $('#total_weight_qualitative').html(total);
    }

    function setTotalFinalScoreQualitative()
    {
        let total = 0;
       
        $('.final_score_qualitative').each( function() {
            // console.log('final_score '+$(this).val())
            total += parseFloat($(this).val() ? $(this).val() : '0.00');
            console.log('total '+total)
        })

        $('.total_final_score_qualitative').html(total);
        $('input.total_final_score_qualitative').val(total);
    }

    $(document).on('change','.score_qualitative', function() {
        // setScoreQualitative($(this))
    })

    function setScoreQualitative(that)
    {
        let parent = that.attr('data-idx_score')
        let total = [];
        $('select.' + parent).each( function(k,v) {
            total.push({
                'value':$(this).val()
            });
        })
        // console.log(total)

        
        let parent_final_score = that.attr('data-idx_final_score')
        let idx_final_score = that.attr('data-idx_final_score')

        let weight_percent = $('.weight_percent_qualitative.' + parent).val();
        console.log('.weight_percent_qualitative.' + parent, weight_percent)

        let value_range = [];
        let achievement_range = [];
        $('.value_qualitative').each( function(k,v) {
            achievement_range.push({
                'value' : $(this).val(),
                'start_value' : $(this).parent().find('.start_value_qualitative').val(),
                'end_value' : $(this).parent().find('.end_value_qualitative').val()
            })
        })
        // console.log(achievement_range)

        $.ajax({
            type: "POST",
            url: '/Api/PerformanceAppraisal/calculate_score_qualitative',
            data: {
                'weight_percent':weight_percent,
                'achievement_score':total,
                'achievement_range':achievement_range
            }, // serializes the form's elements.
            success: function(data)
            {
                let vdata = JSON.parse(data)
                console.log('')
            
                // $('.' + parent_final_score + ' .final_score_qualitative').html(vdata.final_score);
                // $('.' + parent_final_score + ' input.final_score_qualitative').val(vdata.final_score);

                $('.final_score_qualitative.' + parent).html(vdata.final_score);
                $('input.final_score_qualitative.' + parent).val(vdata.final_score);

                setTotalFinalScoreQualitative()
                
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });

    
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
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

        if(type === 'submit') {
            title = 'Submit Document?'
            title_desc1 = 'Are you sure you want submit this document?'
            title_desc2 = 'The submitted document can’t be changed.'
        }else {
            title = 'Save as Draft?'
            title_desc1 = 'Are you sure you want to save this document?'
            title_desc2 = ''
            show_desc2 = 'hide'
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
                        <p class="name ${show_name}">${data['name']}</p>
                        <p class="nik ${show_nik}">${data['nik']}</p>
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
                        <div class="text-wrapper">Submit Assessment ?</div>
                        </div>
                        <div class="close"><img class="frame" src="/assets/images/frame-7567.svg" /></div>
                    </header>
                    <div class="ITEMS">
                        <p class="div">Are you sure you want submit your assessment?</p>
                        <button class="btn-cancel">Cancel</button>
                        <button class="btn-yes">Yes</button>
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
});