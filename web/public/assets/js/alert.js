function alertSuccess(title, text, html = '') {
    if(html != '') {
        Swal.fire({
            title: title,
            icon: 'success',
            html: html,
        })
        return false
    }
    Swal.fire(
        title,
        text,
        'success'
    )
}


function alertError(title, text, html = '') {
    if(html != '') {
        Swal.fire({
            title: title,
            icon: 'error',
            html: html,
        })
        return false
    }
    Swal.fire(
        title,
        text,
        'error'
    )
}

function alertWarning(title, text, html = '') {
    if(html != '') {
        Swal.fire({
            title: title,
            icon: 'warning',
            html: html,
        })
        return false
    }
    Swal.fire(
        title,
        text,
        'warning'
    )
}

function alertSuperiorDataNotCompleted() { 
  let alertHtml = `
          <div class="modal_alert modal_alert_success" aria-hidden="true">
              <div class="ITEMS">
                <img src="/assets/images/icon/icon-pending.png" aria-hidden="true">
                <p class="text_success" aria-hidden="true">Warning</p>
                <p class="text_success" aria-hidden="true">Data Employee Approval Not Completed</p>
              </div>
              <div class="BUTTONS" style="margin-top:40px;">
                  <div class="normal">
                      <button class="ok" aria-hidden="true">OK</button>
                  </div>
              </div>
          </div>
      `

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
        
      $('.modal_alert .ok').on('click', function() {
        swal.close()
        return false;
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
      redirect('/dashboard')
    },
    willClose: () => {
      
    }
  });
}

function alertConfirm(title, text, callback) {
  Swal.fire({
    title: title,
    text: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
}

function alertSuccessfully() { 
    let alertHtml = `
        <div class="modal_alert modal_alert_success" aria-hidden="true">
            <div class="ITEMS">
              <img src="/assets/images/icon/icon-success.png" aria-hidden="true">
              <p class="text_success" aria-hidden="true">Successful</p>
            </div>
            <div class="BUTTONS" style="margin-top:40px;">
                <div class="normal">
                    <button class="ok" aria-hidden="true">OK</button>
                </div>
            </div>
        </div>
    `

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
          
        $('.modal_alert .ok').on('click', function() {
          swal.close()
          return false;
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
}

function alertSuccessSubmit() { 
  let alertHtml = `
      <div class="modal_alert modal_alert_success" aria-hidden="true">
          <div class="ITEMS">
            <img src="/assets/images/icon/icon-success.png" aria-hidden="true">
            <p class="text_success" aria-hidden="true">Successful</p>
            <p class="title_desc2" style="font-size:14px;" aria-hidden="true">you are now required to conduct 1 on 1 session</p>
          </div>
          <div class="BUTTONS" style="margin-top:40px;">
              <div class="normal">
                  <button class="ok" aria-hidden="true">OK</button>
              </div>
          </div>
      </div>
  `

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
        
      $('.modal_alert .ok').on('click', function() {
        swal.close()
        return false;
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
}

function alertSuccessApproved() { 
  let alertHtml = `
      <div class="modal_alert modal_alert_success" aria-hidden="true">
          <div class="ITEMS">
            <img src="/assets/images/icon/icon-success.png" aria-hidden="true">
            <p class="text_success" aria-hidden="true">Successful</p>
            <p class="title_desc2" style="font-size:14px;" aria-hidden="true">you are now required to conduct 1 on 1 session</p>
          </div>
          <div class="BUTTONS" style="margin-top:40px;">
              <div class="normal">
                  <button class="ok" aria-hidden="true">OK</button>
              </div>
          </div>
      </div>
  `

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
        
      $('.modal_alert .ok').on('click', function() {
        swal.close()
        return false;
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
}

$( document ).ajaxStart(function() {
    var status = navigator.onLine;
    if (!status) {
      let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
      alertFailed(message)
      return false;
    }
    $('button').attr('disabled', true)
});

$( document ).ajaxStop(function() {
    var status = navigator.onLine;
    if (!status) {
      let message =  "Network connection failed.<br><span>Something temporarily wrong with your network connection, <br>please contact IT through @ask.IT for further assistance.</span> "
      alertFailed(message)
      return false;
    }
  $('button').removeAttr('disabled')
});


// alertFailed('Invalid file format. <br><span>The file <b>indisad.svg</b> could not be uploaded. </br>Only files with the following extensions are allowed: </br><b>jpeg, png, pdf and xlsx</b></span>')
  function alertFailed(message) { 
    let alertHtml = `
            <div class="modal_alert modal_alert_success" aria-hidden="true">
                <div class="ITEMS">
                  <img src="/assets/images/icon/icon-error.svg" aria-hidden="true">
                  <p class="text_error" aria-hidden="true">Error!</p>
                  <p class="text_message" style="font-size:14px;" aria-hidden="true">${message}</p>
                </div>
                <div class="BUTTONS" style="margin-top:40px;">
                    <div class="normal">
                        <button class="ok" aria-hidden="true">OK</button>
                    </div>
                </div>
            </div>
        `

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
          
        $('.modal_alert .ok').on('click', function() {
          swal.close()
          return false;
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
  }

  function alertConfirm(title, text, callback) {
    Swal.fire({
      title: title,
      text: text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  }