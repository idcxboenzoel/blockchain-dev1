$(function(){
    "use strict"

    // $('#roa_setting').bootstrapToggle({
    //     on: '<span style="color:#fff;">Range Of Achievement <i class="fas fa-eye" style="color:#fff;"><i>  </span>',
    //     off: '<span style="color:#fff;">Range Of Achievement <i class="fas fa-eye-slash"  style="color:#fff;"><i></span>',
    //     onstyle: '#f75a5b',
    //     offstyle: '#f75a5b',
    // });

    $('#roa_setting').change(function() {
        if($('.roa_header').hasClass('hide')) {
            $('.roa_header').removeClass('hide')
        }else {
            $('.roa_header').addClass('hide')
        }
        if($('.roa_subheader').hasClass('hide')) {
            $('.roa_subheader').removeClass('hide')
        }else {
            $('.roa_subheader').addClass('hide')
        }
        if($('.roa_content').hasClass('hide')) {
            $('.roa_content').removeClass('hide')
        }else {
            $('.roa_content').addClass('hide')
        }

        // $('#roa_header').toggle()
        // $('#roa_content').toggle()
    })

    let approval_status = $('#goal_approval_status').val();
    let role_active = $('#role_active').val();
    let form_type = $('#form_type').val()
    // if(approval_status != 3 && (role_active != 1 || role_active != 2)) {
    //     if(form_type != 5) {
    //         alertWarning('Warning!!', 'Setting Goal Approval not completed.')
    //     }
    // }

    let max_total = parseFloat($('#max_total_weight_quantitative').val());
    $('.tooltip-info-max-weight-quantitative').attr('title','Max & Min Total Weight is '+ max_total)
    $('.tooltip-info-max-weight-quantitative').tooltip('enable')

    $(':input[type="number"]').on('keyup click change keydown', function() {
        this.value = this.value
          .replace(/[^\d]/g, '');// numbers and decimals only

        if($(this).val().length > 4) {
            let ret = $(this).val().slice(0, -1);
            $(this).val(ret)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }

        if(parseFloat($(this).val()) < 0) {
            $(this).val(0)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }

        if(parseFloat($(this).val()) > 100) {
            $(this).val(100)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }

        setTotal()
        setKpiScore()
        setTotalKpiScore()
    })

    $(document).on('keyup change click keydown',':input[type="number"]', function() {
        this.value = this.value
          .replace(/[^\d]/g, '');// numbers and decimals only

        if($(this).val().length > 4) {
            let ret = $(this).val().slice(0, -1);
            $(this).val(ret)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }

        if(parseFloat($(this).val()) < 0) {
            $(this).val(0)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }

        if(parseFloat($(this).val()) > 100) {
            $(this).val(100)
            setTotal()
            setKpiScore()
            setTotalKpiScore()
            return false;
        }
        setTotal()
        setKpiScore()
        setTotalKpiScore()
    })

    $(document).on('change','.score', function() {
        setScore($(this), $('#form_type').val())
    })



    setTotal()
    setKpiScore()
    setTotalKpiScore()
    $(document).ready(function() {
        
        setTotalQualitative()
        setTotalFinalScore()
        setTotalFinalScoreQualitative()
        setFinalScore()
        setKpiScore()
        setTotalKpiScore()
    });

    $('.score_qualitative').each(function() {
        setScoreQualitative($(this))
    })
    
    
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

        // set kpi score
        setKpiScore()

        setTotalKpiScore()
        
        
        
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
        
        setTotal()
        setTotalKpiScore()
        setTotalFinalScore()


        return false;
        
    });


    $("#btnSubmit").click(function(e){

        let totalw = parseFloat($('#total_weight').html());
       
        if(totalw !== max_total) {
            alertWarning('Warning', 'Max & Min Total Weight must be '+max_total)
            return false;
        }

        const [message_failed, success, error] = validationFormQuantitative()

        // console.log(message_failed)
        // console.log(success)
        if(error === 1) {
            alertError('Failed', message_failed);
            return false;
        }
        
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

                    // console.log(form)

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

    $("#btnSubmitPa").click(function(e){
        let that = $(this)

        e.preventDefault(); // avoid to execute the actual submit of the form.

        let totalw = parseFloat($('#total_weight').html());
       
        if(totalw !== max_total) {
            alertWarning('Warning', 'Max & Min Total Weight must be '+max_total)
            return false;
        }     
        
        const [message_failed, success, error] = validationFormQuantitative()

        // console.log(message_failed)
        // console.log(success)
        if(error === 1) {
            alertError('Failed', message_failed);
            return false;
        }

        $('.evidence_file').each(function(k) {
            let val = $(this).val()
            let id = $(this).attr('id')
            if(val === '') {
                $('#' + id).animate({ scrollTop: 0 }, "slow");
                alertError('Failed', "Evidence file cannot be empty");
                return false;
            }
        })

        Swal.fire({
        title: 'Are you sure?',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                

                var form = $('#formSubmit');
                var actionUrl = form.attr('action');

                // console.log(form)

                $.ajax({
                    type: "POST",
                    url: actionUrl,
                    data: form.serialize(), // serializes the form's elements.
                    dataType: "json",
                    success: function(data)
                    {
                        // console.log(data)
                        if(data.status !== 201) {
                            alertError('Failed', data.message);
                            return false
                        }
                        
                        html = "<p>Submit goal setting is succuesfully.</p>"
                        // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                        alertSuccess("Success", '', html);

                        setTimeout(function() {
                            window.location = '/Assessment/PerformanceAppraisal'
                        },2000)
                        
                    },
                    failed: function(xhr, textStatus, errorThrown){
                        alertError('Failed', xhr.message);
                    }
                });

            }else {
                return false;
            }
        })
        
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
        
        
        let text = 'save data to draft'
        // if($('.expected_response').val() === "" || $('.expected_response').val() === null) {
        //     text = "Tab Mid Year Monitoring has empty value."
            
        // }

        let that = $(this);

        e.preventDefault(); // avoid to execute the actual submit of the form.

        // let success = 0;
        // let message_failed = 'call'

        // const [message_failed, success, error] = validationFormQuantitative()

        // console.log(message_failed)
        // console.log(success)
        // if(error === 1) {
        //     alertError('Failed', message_failed);
        //     return false;
        // }

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
        
                    // console.log(form)
        
                    $.ajax({
                        type: "POST",
                        url: actionUrl + '',
                        data: form.serialize(), // serializes the form's elements.
                        dataType: "json",
                        success: function(data)
                        {
                            // console.log(data)
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
            
        
    })

    const validationFormQuantitative = () => {
        let message1 = ''
        let message2 = ''
        let message3 = ''
        let message4 = ''
        let message5 = ''
        let message6 = ''
        let message7 = ''
        let message8 = ''
        let success = 0
        let error = 0
        

        // kpi
        $('.key_performance_indicator').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message1 = "KPI cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }

        })

        //weight percent
        $('.weight_percent').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message2 = "Weight Percent cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }

            
        })

        // target
        $('.target').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message3 = "Target cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }

            
        })

        // formula
        $('.formula').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message4 = "Measurement/Formula cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }
        })

        // achievement
        $('.achievement').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message5 = "Achievement cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }
        })

        $('.score_qualitative').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message6 = "Score Qualitative cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }
        })

        $('.justification').each(function(k) {
            let val = $(this).val()

            if(val === '' || val === null) {
                error = 1;
                message7 = "Justification cannot be empty"
                $(this).css('border', '#EE3232 solid 1px')
            }else{
                success = 1;
                $(this).css('border', '#DBDBDB solid 1px')
            }
        })
        

        $('.evidence_name').each(function(k) {
            let val = $(this).val()
            let id = $(this).attr('id')

            if(val === '' || val === null) {
                error = 1;
                // $('#' + id).animate({ scrollTop: 0 }, "slow");
                // alertError('Failed', "Evidence file cannot be empty");
                message8 = "Evidence file cannot be empty"
                // var ele = document.getElementById(id);   
                // window.scrollTo(ele.offsetLeft,ele.offsetTop);
            }else{
                success = 1;
            }
        })

        let message = ''
        
        message += message1 == '' ? '' : "- " + message1
        message += message1 == '' ? '' : '<br>'

        message += message2 == '' ? '' : "- " + message2
        message += message2 == '' ? '' : '<br>'

        message += message3 == '' ? '' : "- " + message3
        message += message3 == '' ? '' : '<br>'

        message += message4 == '' ? '' : "- " + message4
        message += message4 == '' ? '' : '<br>'

        message += message5 == '' ? '' : "- " + message5
        message += message5 == '' ? '' : '<br>'

        message += message6 == '' ? '' : "- " + message6
        message += message6 == '' ? '' : '<br>'

        message += message7 == '' ? '' : "- " + message7
        message += message7 == '' ? '' : '<br>'

        message += message8 == '' ? '' : "- " + message8
        message += message8 == '' ? '' : '<br>'
       
        return [message, success, error]
    }

    $(document).on('keydown keyup change','.weight_percent', function() {
        setTotal()
        setKpiScore()
        setTotalKpiScore()
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
        
            
    
        // // console.log(a.indexOf(k))
    
            
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
        
        $("#total_weight").html(total);

        let totalw = parseFloat($('#total_weight').html());
        let max_total = parseFloat($('#max_total_weight_quantitative').val());

        // console.log('max ' + totalw, max_total)
        if (totalw !== max_total) {
            $("#total_weight").parent().find('span').addClass('text-weight-over')
        } else {
            $("#total_weight").parent().find('span').removeClass('text-weight-over')
        }

        $('.tooltip-info-max-weight-quantitative').tooltip('enable')
        
    }
    
    function setTotalKpiScore()
    {
        let total = 0;
        $("input.kpi_score").each(function () {
            let kpi_score = $(this).val() === null || $(this).val() === "" ? 0 : $(this).val()
            total += parseFloat(kpi_score);
        });
        
        $("#total_kpi_score input").val(total);
        $("#total_kpi_score span").html(total);
    }

    function setKpiScore()
    {
        $('input.kpi_score').each(function(k, v) {

            let weight = 0;
            let achievement = 0;

            $('.weight_percent').each(function(kk, vv) {
                // // console.log(vv[k])
                // weight = parseFloat(vv[k])
                if(kk === k) {
                    weight = $(this).val() === null || $(this).val() === "" ? parseFloat('0') : parseFloat($(this).val())
                }
                
            })

            $('.achievement').each(function(kk, vv) {
                // // console.log(vv[k])
                if(kk === k) {
                    achievement = $(this).val() === null || $(this).val() === "" ? parseFloat('0') : parseFloat($(this).val())
                }
            })

            // // console.log('weight '+ weight)
            // // console.log('achievement '+ achievement)

            let total = parseFloat(achievement * (weight/100))
            // // console.log('total '+ total)
            $(this).parent().find('input').val(total.toFixed(2))
            $(this).parent().find('span').html(total.toFixed(2))

            
        })
        
        setTotalratingScore()
    }

    function setTotalratingScore()
    {
        let total_final_score_qualitative = parseFloat($('input.total_final_score_qualitative').val()) || 0.00;
        let total_kpi_score = parseFloat($('#total_kpi_score span').html()) || 0.00;
    
        console.log('total_final_score_qualitative', total_final_score_qualitative);
        console.log('total_kpi_score', total_kpi_score);
    
        let value_qualitative = parseFloat($('#weight_value_qualitative').html() * (1/100));
        let value_quantitative = parseFloat($('#weight_value_quantitative').html() * (1/100));

        let total = (total_final_score_qualitative * value_qualitative) + (total_kpi_score * value_quantitative);
    
        total = total.toFixed(2)

        $('.total_rating_score').html(total);
        $('.total_rating_score').val(total);
        // console.log('total_rating', total);

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
        
        $.ajax({
            type: "POST",
            url: '/Api/PerformanceAppraisal/generate_rating_name',
            data: {
                'rating_score':total,
                'achievement_range':$('#range_of_achievement').html()
            }, // serializes the form's elements.
            success: function(data)
            {
                let vdata = JSON.parse(data)
                

                $('.rating_name').html(vdata.rating);
                $('.rating_name').val(vdata.rating);
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });
    
       
    }
    

    $(document).on('keyup','.achievement_score', function() {
        setScore($(this))
    })

    $(document).on('change','.achievement_score', function() {
        setScore($(this))
    })

    $(document).on('keydown','.achievement_score', function() {
        setScore($(this))
    })

    function setScore(that, form_type = '-')
    {
        let total = (that.val());

        if(form_type == 5) {
            total = that.val();
        }

        let parent = that.attr('data-idx_score')
        let parent_final_score = that.attr('data-idx_final_score')
        let idx_final_score = that.attr('data-idx_final_score')

        let weight_percent = $('.weight_percent.' + idx_final_score + '').val();
        // // console.log(idx_final_score)

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
        // // console.log(achievement_range)

        $.ajax({
            type: "POST",
            url: '/Api/PerformanceAppraisal/calculate_score_quantitative',
            data: {
                'weight_percent':weight_percent,
                'achievement_score':total,
                'achievement_range':achievement_range,
                'form_type': form_type,
            }, // serializes the form's elements.
            success: function(data)
            {
                let vdata = JSON.parse(data)
                // // console.log(vdata)
                
                if(form_type !== 5) {
                    $('.' + parent + ' .score').html(vdata.data);
                    $('.' + parent + ' input.score').val(vdata.data);
                }

                $('.' + idx_final_score + ' .final_score').html(vdata.final_score);
                $('.' + idx_final_score + ' input.final_score').val(vdata.final_score);

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
            // // console.log('final_score '+$(this).val())
            total += parseFloat($(this).val() ? $(this).val() : '0.00');
            // console.log('total '+total)
        })

        $('.total_score').html(Number(total).toFixed(2));
        $('input.total_score').val(Number(total).toFixed(2));
    }

    function setFinalScore()
    {
       
        $('select.quantitative.score').each( function(k,v) {
            let val = $(this).find(':selected');
            // console.log('score '+val.val())
            let score = 0;
            let score_text = val.val();
            let weight = $('.weight_percent .final_score_'+k).val();
            // console.log('weight '+weight)
            if(score_text == 'A') { score = 4.00};
            if(score_text == 'B') { score = 3.00};
            if(score_text == 'C') { score = 2.00};
            if(score_text == 'D') { score = 1.00};
            let value_score = (score / 4) * (weight / 100)
            let total = parseFloat(value_score);
            // console.log('total '+total)

            $('.final_score').html(Number(total).toFixed(2));
            $('input.final_score').val(Number(total).toFixed(2));
        })

        
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
            // // console.log('final_score '+$(this).val())
            total += parseFloat($(this).val() ? $(this).val() : '0.00');
            // console.log('total '+total)
        })

        $('.total_final_score_qualitative').html(total.toFixed(2));
        $('input.total_final_score_qualitative').val(total.toFixed(2));

        setTotalratingScore()
    }

    $(document).on('change','.score_qualitative', function() {
        setScoreQualitative($(this))
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
        // // console.log(total)

        
        let parent_final_score = that.attr('data-idx_final_score')
        let idx_final_score = that.attr('data-idx_final_score')

        let weight_percent = $('.weight_percent_qualitative.' + parent).val();
        // console.log('.weight_percent_qualitative.' + parent, weight_percent)

        let value_range = [];
        let achievement_range = [];
        $('.value_qualitative').each( function(k,v) {
            
            achievement_range.push({
                'value' : $(this).val(),
                'start_value' : $(this).parent().find('.start_value_qualitative').val(),
                'end_value' : $(this).parent().find('.end_value_qualitative').val(),
            })
        })
        // // console.log(achievement_range)

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
                // console.log('')
            
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

    function fileUploadEvent(id, target, target_name, target_url, btn_upload) 
    {
        // Get a reference to the file input
        const fileInput = document.getElementById(id)

        // Listen for the change event so we can capture the file
        fileInput.addEventListener('change', (e) => {
            // Get a reference to the file
            const file = e.target.files[0];
            // // console.log(file)

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
                
            //     // console.log('file_size' + file_size.toFixed(2))
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
                // // console.log(target_url);
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