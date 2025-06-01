$(function () {
  "use strict";

  $('input,select,textarea').css('padding-top', '0.75rem');
  $('input,select,textarea').css('padding-bottom', '0.75rem');
    $('.weight_percent,.achievement').css('text-align', 'center');

  let max_total = parseFloat($("#total_weight_quantitative").val());
  $(".tooltip-info-max-weight-quantitative").attr(
    "title",
    "Maximum Total Weight is " + max_total
  );
  $(".tooltip-info-max-weight-quantitative").tooltip("enable");

  $(':input[type="number"]').on("keyup click change keydown", function () {
    if (parseFloat($(this).val()) < 0) {
      $(this).val(0);
      return false;
    }

    if (parseFloat($(this).val()) > 100) {
      $(this).val(100);
      return false;
    }
  });

  $(document).on(
    "keyup change click keydown",
    ':input[type="number"]',
    function () {
      if (parseFloat($(this).val()) < 0) {
        $(this).val(0);
        return false;
      }

      if (parseFloat($(this).val()) > 100) {
        $(this).val(100);
        return false;
      }
    }
  );

  $(document).on(
    "keyup change click keydown",
    ".achievement_score",
    function () {
      setScore($(this));
    }
  );

  $(document).on("keyup change click keydown", ".weight_percent", function () {
    setTotal();
  });

  setTotal();
  $(document).ready(function () {
    setTotalQualitative();
    setTotalFinalScore();
    setTotalFinalScoreQualitative();
  });

  $("#btn2").click(function(){
    let html = $('.quantitative-tab .tr_content:nth-child(1)').clone();
    let idx = $('.quantitative-tab .tr_content').length();
    $('.quantitative-tab .tr_content .index_content').each(function() {
        idx += 1;
    })

    html.find('.key_performance_indicator').val('')
    html.find('.target').val('')
    html.find('.formula').val('')
    html.find('.achievement').val('')
    html.find('.weight_percent').val('')
    html.find('.index_content').html(idx + 1)
    html.find('.evidence_url').html('')
    html.find('.evidence_file').val('')
    html.find('.evidence_name').val('')
    html.find('.evidence_path_file').val('')
    html.find('.evidence_file_public_url').val('')
    
    
    
    
    html.find('.file_evidence_browser').val('')

    $(".quantitative-tab tbody").append(html);

    // set total
    setTotal()
    
    
});

  $(document).on('click', '.btn_delete_kpi', function(){
        
      let index = $(this).attr('data-index')
      // alert(index)
      $(".quantitative-tab tbody .tr_content.index-"+index).remove()

      return false;
      
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

  $("#btnApprove").click(function (e) {
    // let totalw = parseFloat($("#total_weight").html());

    // if (totalw != max_total) {
    //   alertWarning("Warning", "Maximum Total Weight must be " + max_total);
    //   return false;
    // }

    let that = $(this);

    e.preventDefault(); // avoid to execute the actual submit of the form.

    let nik = $('#nik_employee').val();
    let name = $('#name_employee').val();
    let goal_id = $('#goal_id').val();
    let alertHtml = alertConfirm({'nik':nik, 'name' : name, 'goal_id' : goal_id}, 'approve');

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
              
              $('.valnotes').val($('.datanotes').val())

              var form = $("#formApprove");
              var actionUrl = that.attr("action");
      
              console.log(form);
      
              $.ajax({
                type: "POST",
                url: actionUrl,
                data: form.serialize(), // serializes the form's elements.
                dataType: "json",
                success: function (data) {
                  console.log(data);
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
      
                  html = "<p>Approve Goal Setting is succuesfully.</p>";
                  // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"
      
                  // alertSuccess("Success", "", html);
                  alertSuccessApproved()

                  setTimeout(function () {
                    window.location.href  = '/Approval/Goal'
                  }, 2000);
                },
                failed: function (xhr, textStatus, errorThrown) {
                  alertError("Failed", xhr.message);
                },
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

  $("#btnRevise").click(function (e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.

    let that = $(this);

    let nik = $('#nik_employee').val();
    let name = $('#name_employee').val();
    let goal_id = $('#goal_id').val();

    let alertHtml = alertConfirm({'nik':nik, 'name' : name, 'goal_id' : goal_id}, 'sendback');

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

          $('.valnotes').val($('.datanotes').val())

          var form = $("#formRevise");
          var actionUrl = form.attr("action");
  
          console.log(form);
  
          $.ajax({
            type: "POST",
            url: actionUrl,
            data: form.serialize(), // serializes the form's elements.
            dataType: "json",
            success: function (data) {
              console.log(data);
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
  
              html = "<p>Send Back Goal Setting is succuesfully.</p>";
              // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"
  
              // alertSuccess("Success", "", html);
              alertSuccessApproved()
  
              setTimeout(function () {
                window.location.href  = '/Approval/Goal'
              }, 2000);
            },
            failed: function (xhr, textStatus, errorThrown) {
              alertError("Failed", xhr.message);
            },
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

  // var modalRevise = document.getElementById("modalRevise");
  // modalRevise.addEventListener("show.bs.modal", function (event) {
  //   // Button that triggered the modal
  //   var button = event.relatedTarget;
  //   // Extract info from data-bs-* attributes
  //   var goal_id = button.getAttribute("data-goal_id");
  //   // If necessary, you could initiate an AJAX request here
  //   // and then do the updating in a callback.
  //   //
  //   // Update the modal's content.
  //   // var modalTitle = modalRevise.querySelector('.modal-title')
  //   var modalBodyInput = modalRevise.querySelector(".modal-body #goal_id");

  //   // modalTitle.textContent = 'New message to ' + recipient
  //   modalBodyInput.value = goal_id;
  // });

  $("#btnSubmit").click(function (e) {
    let totalw = parseFloat($("#total_weight").html());

    if (totalw != max_total) {
      alertWarning("Warning", "Maximum Total Weight must be " + max_total);
      return false;
    }

    let that = $(this);

    e.preventDefault(); // avoid to execute the actual submit of the form.

    Swal.fire({
      title: "Are you sure?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        var form = $("#formSubmit");
        var actionUrl = form.attr("action");

        console.log(form);

        $.ajax({
          type: "POST",
          url: actionUrl,
          data: form.serialize(), // serializes the form's elements.
          dataType: "json",
          success: function (data) {
            console.log(data);
            if (data.status !== 201) {
              alertFailed(data.message)
              return false;
            }

            html = "<p>Submit goal setting is succuesfully.</p>";
            // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

            // alertSuccess("Success", "", html);
            alertSuccessfully()
            setTimeout(function () {
              window.location.reload
            }, 2000);
          },
          failed: function (xhr, textStatus, errorThrown) {
            alertError("Failed", xhr.message);
          },
        });
      } else {
        return false;
      }
    });
  });

  function setTotal() {
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

  function setScore(that) {
    let total = parseInt(that.val());

    let parent = that.attr("data-idx_score");
    let parent_final_score = that.attr("data-idx_final_score");
    let idx_final_score = that.attr("data-idx_final_score");

    let weight_percent = $(".weight_percent." + idx_final_score + "").val();
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
      url: "/Api/PerformanceAppraisal/calculate_score_quantitative",
      data: {
        weight_percent: weight_percent,
        achievement_score: total,
        achievement_range: achievement_range,
      }, // serializes the form's elements.
      success: function (data) {
        let vdata = JSON.parse(data);

        $("." + parent + " .score").html(vdata.data);
        $("." + parent + " input.score").val(vdata.data);

        $("." + parent_final_score + " .final_score").html(vdata.final_score);
        $("." + parent_final_score + " input.final_score").val(
          vdata.final_score
        );

        setTotalFinalScore();
      },
      failed: function (xhr, textStatus, errorThrown) {
        alertError("Failed", xhr.message);
      },
    });
  }

  function setTotalFinalScore() {
    let total = 0;

    $(".final_score").each(function () {
      // console.log('final_score '+$(this).val())
      total += parseFloat($(this).val() ? $(this).val() : "0.00");
      console.log("total " + total);
    });

    $(".total_score").html(Number(total).toFixed(2));
    $("input.total_score").val(Number(total).toFixed(2));
  }

  // qualitative

  function setTotalQualitative() {
    let total = 0;

    $(".weight_percent_qualitative").each(function () {
      total += parseFloat($(this).val());
    });

    $("#total_weight_qualitative").html(total);
  }

  function setTotalFinalScoreQualitative() {
    let total = 0;

    $(".final_score_qualitative").each(function () {
      // console.log('final_score '+$(this).val())
      total += parseFloat($(this).val() ? $(this).val() : "0.00");
      console.log("total " + total);
    });

    $(".total_final_score_qualitative").html(total);
    $("input.total_final_score_qualitative").val(total);
  }

  $(document).on("change", ".score_qualitative", function () {
    // setScoreQualitative($(this));
  });

  function setScoreQualitative(that) {
    let parent = that.attr("data-idx_score");
    let total = [];
    $("select." + parent).each(function (k, v) {
      total.push({
        value: $(this).val(),
      });
    });
    // console.log(total)

    let parent_final_score = that.attr("data-idx_final_score");
    let idx_final_score = that.attr("data-idx_final_score");

    let weight_percent = $(".weight_percent_qualitative." + parent).val();
    console.log(".weight_percent_qualitative." + parent, weight_percent);

    let value_range = [];
    let achievement_range = [];
    $(".value_qualitative").each(function (k, v) {
      achievement_range.push({
        value: $(this).val(),
        start_value: $(this).parent().find(".start_value_qualitative").val(),
        end_value: $(this).parent().find(".end_value_qualitative").val(),
      });
    });
    // console.log(achievement_range)

    $.ajax({
      type: "POST",
      url: "/Api/PerformanceAppraisal/calculate_score_qualitative",
      data: {
        weight_percent: weight_percent,
        achievement_score: total,
        achievement_range: achievement_range,
      }, // serializes the form's elements.
      success: function (data) {
        let vdata = JSON.parse(data);
        console.log("");

        // $('.' + parent_final_score + ' .final_score_qualitative').html(vdata.final_score);
        // $('.' + parent_final_score + ' input.final_score_qualitative').val(vdata.final_score);

        // $(".final_score_qualitative." + parent).html(vdata.final_score);
        // $("input.final_score_qualitative." + parent).val(vdata.final_score);

        setTotalFinalScoreQualitative();
      },
      failed: function (xhr, textStatus, errorThrown) {
        alertError("Failed", xhr.message);
      },
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
    let formname = ''
    let show_notes = ''
    let action = ''
    let show_desc1_sub = ''
    let show_desc2_sendback = ''

    if(type === 'sendback') {
        title = 'Send back this document?'
        title_desc1 = 'Are you sure you want to send back this document'
        title_desc2 = 'You required to conduct 1 on 1 session with'
        formname = 'formRevise'
        action = '/Api/Goal/revise'
        show_desc2 = 'hide'
    }else {
        title = 'Approve this document?'
        title_desc1 = 'Are you sure you want approve this document'
        title_desc2 = ''
        formname = 'formApprove'
        action = '/Api/Goal/approve'
        show_desc1_sub = 'hide'
        show_desc2_sendback = 'hide'
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
                    <p class="div title_desc2 ${show_desc1_sub}" ><span class='name_nik'>${title_desc2}</span></p>
                    <p class="div title_desc2 ${show_desc2_sendback}" ><span class='name_nik'>${data['name']}.</span></p>
                    <p class="div title_desc2 ${show_desc2}" ><span class='name_nik'>${data['name']} / ${data['nik']}</span></p>
                    <p class="remarks">Remarks</p>
                    <form class="div notes ${show_notes}" id="${formname}" action="${action}">
                      <textarea name="notes" class="form-control datanotes" rows=5 style="width:100%;resize:none;"></textarea>
                      <input type="hidden" name="goal_id" class="goal_id" value="${data['goal_id']}" />
                      
                    </form>
                    
                </div>
                <div class="BUTTONS" style="margin-top:78px;">
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


