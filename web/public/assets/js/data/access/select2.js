$(function(){
    "use strict"

    $(document).ready(function () {
        // Initialize Select2 for Add Parent Dropdown
        $('#add_parent').select2({
            placeholder: 'Select Parent',
            allowClear: true,
            ajax: {
                url: '/Api/Setting/Access/parents', // Replace with your API endpoint
                dataType: 'json',
                processResults: function (data) {
                    return {
                        results: data.map(function (item) {
                            return { id: item.id, text: item.name };
                        }),
                    };
                },
            },
        });
    
        // Initialize Select2 for Update Parent Dropdown
        $('#modal_parent').select2({
            placeholder: 'Select Parent',
            allowClear: true,
            ajax: {
                url: '/Api/Setting/Access/parents', // Replace with your API endpoint
                dataType: 'json',
                processResults: function (data) {
                    return {
                        results: data.map(function (item) {
                            return { id: item.id, text: item.name };
                        }),
                    };
                },
            },
        });
    });
});