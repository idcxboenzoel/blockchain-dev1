$(function(){
    "use strict"

    var table_data = $('#table_data').DataTable({
        // Gw tambahain style ini mam start
        createdRow: function ( row, data, index ) {
            $(row).addClass('selected')
         } ,
        language: {
            paginate: {
            next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
            previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>' 
            }
        },
        dom: '<"top">rt<"bottom"lp><"clear">',
        // Gw tambahain style ini mam end
        
        // "scrollY": true,
        // "fixedHeader": true,
        // "scrollX": false,
        "processing": true,
        "serverSide": true,
        // "searching": true,
        "paging": true,
        "lengthChange" : true,
        "pageLength": 10,
        "lengthMenu": [5, 10, 25, 50, 75, 100],
        // "bInfo" : false,
        "ordering": false,
        "ajax":{
            "url": "/Api/Employee/list",
            "type": "get",
            "dataType": 'json',
            "data": {
                search: function() { return $('.searchbox').val() },
                searchby: function() { return $('.searchby').val() },
                sortby: function() { return $('.sortby').val() },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "",
                render: function(data, type, row, meta) { 
                    return meta.row + 1
                },
            },

            { "data": "fullname","width":"25%",
                render: function(data, type, row, meta) { 
                    let color = row.status === 0 ? 'blue' : 'blue';
                    var dt1 = '<a style="color:'+color+';" class="link-detail" href="/Employee/Detail/'+row.nik+'">'+row.fullname+'</a><br>';
                    var dt2 = `<span "sub">${row.position_name}</span>`
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1 + dt2;
                },
            },

            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            
            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.department_name != null ? row.department_name : '-'
                },
            },

            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.division_name != null ? row.division_name : '-'
                },
            },

            { "data": "company_name","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },

            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.business_pilar != null ? row.business_pilar : '-'
                },
            },
            { "data": "","width":"25%",
                render: function(data, type, row, meta) { 
                    return row.company_group != null ? row.company_group : '-'
                },
            },
            // report to
            { "data": "supervisors","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data.length > 0 ? data[0].spv_fullname : ''
                    return dt1;
                },
            },
            // approval 2
            { "data": "supervisors","width":"25%",
                render: function(data, type, row, meta) { 
                    console.log(data.length)
                    var dt1 = data.length > 1 ? data[1].spv_fullname : ''
                    return dt1;
                },
            },
            { "data": "form_type","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = data ? data.form_alias : '-'
                    return dt1;
                },
            },
            { "data": "nik","width":"10%",
                render: function(data, type, row) { 
                    var dt1 = '<a class="btn btn-dark shadow btn-xs sharp me-1" href="/Employee/Edit/'+row.nik+'" ><i class="fas fa-pencil-alt"></i></a>'
                    var dt2 = ''
                    return dt1 + dt2;
                }
            },
        ],
        initComplete: function (settings, json) {
            let vfooter = $('.table-responsive .bottom').clone();

            // $('.table-responsive .bottom').hide();
            // $('.footer-table').html(vfooter)
            // $('.footer-table .bottom').show()


            // $('.footer-table .bottom #table_data_length select').on('change', function() {
            //     $('.table-responsive .bottom #table_data_length select').val($(this).val()).trigger('change');
                
            // })

            $('.table-responsive .bottom').appendTo('.footer-table');
           
        },
        drawCallback: function() {
            // let vnewfooter = $('.table-responsive .bottom').clone();

            // $('.table-responsive .bottom').hide();
            // $('.footer-table').html(vnewfooter)
            // $('.footer-table .bottom').show()
        }
    });

    // $('.table-responsive .bottom #table_data_length select').on('change', function() {
    //     let vnewfooter = $('.table-responsive .bottom').html()

    //     $('.footer-table .bottom .dataTables_paginate').append($('.table-responsive .bottom .dataTables_paginate').html())
    // })
    
    var table_data_spv_failed = $('#table_data_spv_failed').DataTable({
        // Gw tambahain style ini mam start
        createdRow: function ( row, data, index ) {
            $(row).addClass('selected')
        } ,
        language: {
            paginate: {
            next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
            previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>' 
            }
        },
        dom: '<"top">rt<"bottom"lp><"clear">',
        // Gw tambahain style ini mam end
        
        // "scrollY": false,
        // "scrollX": false,
        "processing": true,
        "serverSide": true,
        // "searching": true,
        "paging": true,
        // "bInfo" : false,
        // "ordering": true,
        "ajax":{
            "url": "/Api/Employee/list_upload_superior_failed",
            "type": "get",
            "dataType": 'json',
            "data": {
                logs_id: function() { return $('#logs_id').val() },
                search: function() { return $('.searchbox').val() },
                searchby: function() { return $('.searchby').val() },
                sortby: function() { return $('.sortby').val() },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "nik_employee",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "spv_nik","width":"15%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "spv_fullname","width":"25%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "spv_position_name","width":"15%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "spv_email","width":"15%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "order","width":"5%",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            { "data": "response","width":"35%",
                render: function(data, type, row, meta) { 
                    let response = ''
                    $.each((data), function(k, v) {
                        response += v
                        if(k === data.length - 1){
                            response += ' and '
                        }else {
                            response += ', '
                        }
                    })
                    return data ? '<span style="color:red;">' + response + "</span>" : ''
                    
                },
            }
        ],
        initComplete: function (settings, json) {
            $('.table_superior .footer-table').html('')
            $('.table_superior .table-responsive .bottom').appendTo('.table_superior .footer-table');
        }
    });

    var table_data_failed = $('#table_data_failed').DataTable({
        // Gw tambahain style ini mam start
        createdRow: function ( row, data, index ) {
            $(row).addClass('selected')
        } ,
        language: {
            paginate: {
            next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
            previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>' 
            }
        },
        dom: '<"top">rt<"bottom"lp><"clear">',
        // Gw tambahain style ini mam end
        
        // "scrollY": false,
        // "scrollX": false,
        "processing": true,
        "serverSide": true,
        // "searching": true,
        "paging": true,
        // "bInfo" : false,
        // "ordering": true,
        "ajax":{
            "url": "/Api/Employee/list_upload_failed",
            "type": "get",
            "dataType": 'json',
            "dataSource": 'employee',
            "data": {
                logs_id: function() { return $('#logs_id').val() },
                search: function() { return $('.searchbox').val() },
                searchby: function() { return $('.searchby').val() },
                sortby: function() { return $('.sortby').val() },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "",
                render: function(data, type, row, meta) { 
                    return meta.row + 1
                },
            },

            { "data": "fullname","width":"25%",
                render: function(data, type, row, meta) { 
                    var dt1 = row.fullname + '<br>';
                    var dt2 = `<span "sub">${row.position_name}</span>`
                    // var dt2 = '<small style="color:gray;">'+row.nik+'</small>';

                    return dt1 + dt2;
                },
            },

            { "data": "nik",
                render: function(data, type, row, meta) { 
                    return data
                },
            },
            
            { "data": "","width":"10%",
                render: function(data, type, row, meta) { 
                    return row.department_name != null ? row.department_name : '-'
                },
            },

            { "data": "","width":"10%",
                render: function(data, type, row, meta) { 
                    return row.division_name != null ? row.division_name : '-'
                },
            },

            { "data": "company_name","width":"10%",
                render: function(data, type, row, meta) { 
                    var dt1 = data
                    return dt1;
                },
            },
            { "data": "","width":"10%",
                render: function(data, type, row, meta) { 
                    return row.business_pilar != null ? row.business_pilar : '-'
                },
            },

            { "data": "","width":"15%",
                render: function(data, type, row, meta) { 
                    return row.company_group != null ? row.company_group : '-'
                },
            },
            { "data": "response","width":"35%",
                render: function(data, type, row, meta) { 
                    let response = ''
                    
                    $.each(((data)), function(k, v) {
                        response += v
                        if(k === data.length - 2){
                            response += ' and '
                        } else if(k === data.length - 1){
                            response += ''
                        }else {
                            response += ', '
                        }
                    })
                    return data ? '<span style="color:red;">' + response + "</span>" : ''
                },
            }
        ],
        initComplete: function (settings, json) {
            $('.table_employee .footer-table').html('')
            $('.table_employee .table-responsive .bottom').appendTo('.table_employee .footer-table');
        }
    });

    var table_data_history_logs = $('#table_data_history_logs').DataTable({
        // Gw tambahain style ini mam start
        createdRow: function ( row, data, index ) {
            $(row).addClass('selected')
         } ,
         language: {
             paginate: {
                next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
               previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>' 
             }
           },
        // Gw tambahain style ini mam end
        dom: '<"top">rt<"bottom"lp><"clear">',
        // "scrollY": false,
        // "scrollX": false,
        "processing": true,
        "serverSide": true,
        // "searching": true,
        "paging": true,
        "lengthChange" : true,
        "pageLength": 5,
        "lengthMenu": [5, 10, 25, 50, 75, 100],
        // "bInfo" : false,
        "ordering": false,
        // "orderable": false,
        "ajax":{
            "url": "/Api/Employee/list_history_logs",
            "type": "get",
            "dataType": 'json',
            "dataSource": 'employee',
            "data": {
                search: function() { return $('.searchbox').val() },
                searchby: function() { return $('.searchby').val() },
                sortby: function() { return $('.sortby').val() },
            },
        },
        "columnDefs": [
            {"className": "text-center", "targets": [0]},// Applies the option to all columns
        ], 
        
        "order": [[ 0, 'asc' ]],
        "columns": [
            { "data": "", "orderable":false,
                render: function(data, type, row, meta) { 
                    return "ID: "+ row.id
                },
            },

            { "data": "","width":"35%",
                render: function(data, type, row, meta) { 
                    let vdata = row.name != null ? (row.name) : []
                    let vreturn = ''


                    // let sdata = vdata.data.toString()
                    
                    vreturn += 'Name: '+vdata + '<br>'

                    // if(row.base64 != "") {
                        
                    //     const blob = b64toBlob(row.base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    //     const blobUrl = URL.createObjectURL(blob);
                    //     vreturn += `File: <a  style="text-decoration:underline;" href='${blobUrl}' >Download</a>`

                    // }

                    vreturn += `File: <a  style="text-decoration:underline;" href='${row.download_path}' >Download</a>`

                    return vreturn
                },
            },
            { "data": "response","width":"35%",
                render: function(data, type, row, meta) { 
                    let data_success = data ? '<span style="color:red;">' + row.response.success + "</span>" : 'not found'
                    let data_failed = data ? '<span style="color:red;">' + row.response.failed + "</span>" : 'not found'

                    return `<p>${data_success} employee records uploaded</p><p>${data_failed} employee records error</p>`
                },
            },
            { "data": "","width":"5%",
                render: function(data, type, row, meta) { 
                    var dt1 = row.user ? row.user.name : '-'
                    return dt1;
                },
            },
            { "data": "created_at","width":"5%",
                render: function(data, type, row, meta) { 
                    var d = new Date(data);

                    var month = (d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0'+(d.getMonth()+1)
                    var date = (d.getDate()) > 9 ? (d.getDate()) : '0'+(d.getDate())
                    var hours = (d.getHours()) > 9 ? (d.getHours()) : '0'+(d.getHours())
                    var minutes = (d.getMinutes()) > 9 ? (d.getMinutes()) : '0'+(d.getMinutes())
                    

                    var datestring = date  + "-" + month + "-" + d.getFullYear() + " " + hours + ":" + minutes
                    var dt1 = datestring

                    return dt1;
                },
            },
            { "data": "","width":"5%",
                render: function(data, type, row, meta) { 
                    var dt1 = `<a href="/Employee/UploadFailed/${row.id}" ><i class="fa fa-eye" /></a>`
                    return dt1;
                },
            },
        ],
        initComplete: function (settings, json) {
            $('.footer-table').html('')
            $('.table-responsive .bottom').appendTo('.footer-table');
        }
    });

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
    

    // $('#table_data_history_logs').on('change', '.dataTables_length select', function() {
    //     table_data.ajax.reload();
    // })

    $('.btn-search.data_employee').on('click', function() {

        let search = $('.searchbox').val()
        let searchby = $('.searchby').val()
        // if(searchby === "" || search === "") {
        //     return false;
        // }
        table_data.ajax.reload();
    })

    $('.btn-search.data_history_logs').on('click', function() {
        table_data_history_logs.ajax.reload();
    })

    

    function htmlspecialchars(text) {
        
        return text
         .replace("&amp;",/&/g )
         .replace("&lt;",/</g )
         .replace("&gt;",/>/g )
         .replace("&quot;",/"/g )
         .replace("&#039;",/'/g );
    }
    
});