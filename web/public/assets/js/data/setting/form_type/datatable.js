$(function () {
  "use strict";

  function initializeDataTable(tableId, data) {
    return $("#" + tableId).DataTable({
      scrollY: false,
      scrollX: false,
      processing: false,
      serverSide: false,
      searching: false,
      paging: false,
      bInfo: false,
      ordering: true,
      order: [[0, "asc"]],
      data: data,
      columnDefs: [{ className: "text-left", targets: "_all" }],
      columns: [
        {
          data: "form_name",
          render: function (data, type, row, meta) {
            return (
              '<a href="' +
              base_url +
              "Settings/DetailFormType/" +
              row.id +
              '">' +
              data +
              "</a>"
            );
          },
        },
        {
          data: "total_weight_qualitative",
          render: function (data, type, row, meta) {
            return (
              '<span class="edit-data">' +
              data +
              "</span>" +
              ' <a class="btn btn-dark btn-xs sharp me-1 edit-btn" data-toggle="modal" data-target="#editModal" data-value="' +
              data +
              '" data-id="' +
              row.id +
              '" data-type="' +
              "qualitative" +
              '"><i class="fas fa-pencil-alt"></i></a>'
            );
          },
        },
        {
          data: "total_weight_quantitative",
          render: function (data, type, row, meta) {
            return (
              '<span class="edit-data">' +
              data +
              "</span>" +
              ' <a class="btn btn-dark btn-xs sharp me-1 edit-btn" data-toggle="modal" data-target="#editModal" data-value="' +
              data +
              '" data-id="' +
              row.id +
              '" data-type="' +
              "quantitative" +
              '"><i class="fas fa-pencil-alt"></i></a>'
            );
          },
        },
      ],
    });
  }

  $("#table_form_type").on("click", ".edit-btn", function () {
    var value = $(this).data("value");
    var dataId = $(this).data("id");
    var type = $(this).data("type");

    $("#editModal").modal("show");
    $("#editModalInput").val(value);
    $("#editModal").data("id", dataId);
    $("#editModal").data("type", type);
  });

  $("#editModal").on("click", ".btn-primary", function () {
    var editedValue = $("#editModalInput").val();
    var dataId = $("#editModal").data("id");
    var type = $("#editModal").data("type");

    if (editedValue !== "" && editedValue >= 0 && editedValue <= 100) {
      $.ajax({
        url: "/Api/Setting/FormType/save/" + dataId,
        type: "post",
        dataType: "json",
        data: JSON.stringify({
          editedValue: editedValue,
          type: type,
        }),
        success: function (response) {
          console.log("Save action successful:", response);
          $("#editModal").modal("hide");
          location.reload();
        },
        error: function (error) {
          console.error("Error during save action:", error);
        },
      });
    } else {
      alert("Invalid input. Please enter a value between 0 and 100.");
    }
  });

  $("#editModal").on("click", ".btn-secondary", function () {
    $("#editModal").modal("hide");
  });

  $.ajax({
    url: "/Api/Setting/FormType/list",
    type: "get",
    dataType: "json",
    data: {
      REQUEST_CODE: function () {
        return "";
      },
    },
    success: function (response) {
      console.log(response);
      if (response && response.data) {
        var formTypeList = response.data;
        console.log(formTypeList);

        initializeDataTable("table_form_type", formTypeList);
      }
    },
  });
});
