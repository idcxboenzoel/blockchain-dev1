$(function(){
    "use strict"
    
    $('#exportExcel').on('click', function() {
        $('.buttons-excel').trigger('click')
    })

    $("#formLogin").submit(function(e) {
        let that = $(this)

        let route = $('#route').val();

        e.preventDefault(); // avoid to execute the actual submit of the form.         

        var form = that;
        var actionUrl = form.attr('action');

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: form.serialize(), // serializes the form's elements.
            dataType: "json",
            success: function(data)
            {
                console.log(data)
                if(data.status !== 200) {
                    alertError('Failed','', data.message);
                    return false
                }
                
                let html = "<p>Login is succuesfully.</p>"
                // html += "<p>See you soon at MMSGI Gala Dinner 2023!</p>"

                // alertSuccess("Success", '', html);
                // localStorage.setItem("user_login", JSON.stringify(data.profile));
                console.log(route)
                if(route != "" || route == null) {
                    // window.location = route
                }

                // alert(route);
                if (typeof route !== "undefined" || route !== null || route !== "" || route === "undefined") {
                    window.location = '/'; // Redirect to the route
                    return false;
                }

                window.location = '/' + route
                // let user = JSON.parse(localStorage.getItem('user_login'))
                // console.log(user)
                
            },
            failed: function(xhr, textStatus, errorThrown){
                alertError('Failed', xhr.message);
            }
        });
            
    });
});