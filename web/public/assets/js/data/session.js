$(function(){
    "use strict"

    $('.role_menu .dropdown-item:not(.disabled)').on('click', function() {
        let id = $(this).attr('data-role_id');
        $('#role_active').val(id);
        
        $.ajax({
            type: "POST",
            url: "/Api/Auth/roleChange",
            "data": {
                role_id: id,
            },
            dataType: "json",
            success: function(data)
            {
                console.log(data)
                if(data.status !== 201) {
                    toastError(data.message);
                    return false
                }
                
                html = "<p>Change Role is succuesfully.</p>"
                // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"
        
                toastSuccess(html);
                window.location = '/'
                
            },
            failed: function(xhr, textStatus, errorThrown){
                toastError('Failed', xhr.message);
            }
        });
    })

    function toastSuccess(message)
    {
        const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "success",
            title: message
          });
    }

    function toastError(message)
    {
        const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: message
          });
    }

});