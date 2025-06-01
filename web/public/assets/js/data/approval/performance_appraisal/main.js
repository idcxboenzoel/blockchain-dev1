$(function(){
    "use strict"


    // $('input,select,textarea').not('.modal input, .modal select, .modal textarea').attr('disabled', true);
    // $('input,select,textarea').css('border', 'none');
    // $('input,select,textarea').css('text-align-last', 'center');

    $('input,select,textarea').css('padding-top', '0.75rem');
    $('.weight_percent,.achievement').css('text-align', 'center');
    
    $('input[type=file]').hide()
    // $('#btn2').hide()
    // $('input,select,textarea').css('resize','none')

    $('#caep td.disabled').removeClass('disabled')

    $('.file_evidence_browser').hide()

    // $('.justification').attr('disabled', true)
    // $('.justification').css('resize', 'none')
    $('#btn2').hide()
    $('.btn_delete_kpi').hide()

    let log_approval = $('#log_approval').val();

    if($('#layer_approval').val() == 'layer_1') {
        $('.expected_response').attr('disabled', true)
        $('.comment1').attr('disabled', false)
        $('.comment2').attr('disabled', true)

        $('.expected_response').parent('td').addClass('disabled')
        $('.comment1').parent('td').removeClass('disabled')
        $('.comment2').parent('td').addClass('disabled')
        
    }else if($('#layer_approval').val() == 'layer_2') {
        if(log_approval == 1) {
            $('.expected_response').attr('disabled', true)
            $('.comment1').attr('disabled', true)
            $('.comment2').attr('disabled', false)

            $('.expected_response').parent('td').addClass('disabled')
            $('.comment1').parent('td').addClass('disabled')
            $('.comment2').parent('td').removeClass('disabled')
        }else {
            $('.expected_response').attr('disabled', true)
            $('.comment1').attr('disabled', true)
            $('.comment2').attr('disabled', true)

            $('.expected_response').parent('td').addClass('disabled')
            $('.comment1').parent('td').addClass('disabled')
            $('.comment2').parent('td').addClass('disabled')
        }
        
    }else if($('#layer_approval').val() == 'layer_4') {
        $('.expected_response').attr('disabled', true)
        $('.comment1').attr('disabled', true)
        $('.comment2').attr('disabled', true)

        $('.expected_response').parent('td').addClass('disabled')
        $('.comment1').parent('td').addClass('disabled')
        $('.comment2').parent('td').addClass('disabled')
    }else{
        $('.expected_response').attr('disabled', false)
        $('.comment1').attr('disabled', true)
        $('.comment2').attr('disabled', true)

        $('.expected_response').parent('td').removeClass('disabled')
        $('.comment1').parent('td').addClass('disabled')
        $('.comment2').parent('td').addClass('disabled')
    }
});