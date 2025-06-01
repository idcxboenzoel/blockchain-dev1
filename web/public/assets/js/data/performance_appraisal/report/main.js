$(function(){
    "use strict"

    

    $('input,select,textarea').not('.modal input, .modal select, .modal textarea').attr('disabled', true);
    $('input,select,textarea').css('border', 'none');
    // $('input,select,textarea').css('text-align-last', 'center');
    $('input,select,textarea').css('padding-top', '0.75rem');
    $('.weight_percent,.achievement').css('text-align', 'center');
    $('input[type=file]').hide()
    $('#btn2').hide()
    $('input,select,textarea').css('resize','none')

    $('#caep td.disabled').removeClass('disabled')

    $('.file_evidence_browser').hide()

    $('.btn_delete_kpi').html('')

});