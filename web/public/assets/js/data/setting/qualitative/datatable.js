$(function () {
  "use strict";

  $(document).ready(function () {
    $(document).on("mouseenter", ".detail-link", function () {
      $(this).css("color", "maroon");
    });

    $(document).on("mouseleave", ".detail-link", function () {
      $(this).css("color", "red");
    });
  });

  var table_data = $("#table_data").DataTable({
    scrollY: false,
    scrollX: false,
    processing: false,
    serverSide: false,
    searching: false,
    paging: false,
    bInfo: false,
    ordering: false,
    ajax: {
      url: "/Api/Setting/Qualitative/list",
      type: "get",
      dataType: "json",
      data: {
        REQUEST_CODE: function () {
          return "";
        },
      },
    },
    columnDefs: [{ className: "text-center", targets: [0] }],

    order: [[0, "asc"]],
    columns: [
      {
        data: "corporate_value",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "weight_percent",
        width: "25%",
        render: function (data, type, row, meta) {
          return data + "%";
        },
      },
      {
        data: "dimension",
        render: function (data, type, row, meta) {
          var dt = JSON.parse(data);

          return (
            "<a href='/Settings/QualitativeDetail/" +
            row.id +
            "' class='detail-link' style='color: red;'>Detail</a>"
          );
        },
      },
      {
        data: "edit",
        width: "15%",
        render: function (data, type, row) {
          return (
            "<a href='#" +
            row.id +
            "' class='update-link btn btn-dark shadow btn-xs sharp me-1' data-id='" +
            row.id +
            "' data-corporate-value='" +
            row.corporate_value +
            "' data-weight-percent='" +
            row.weight_percent +
            "' data-dimension='" +
            row.dimension +
            "'><i class='fas fa-pencil-alt'></i></a>" +
            "<a href='#' class='delete-link btn btn-danger shadow btn-xs sharp' data-id='" +
            row.id +
            "'><i class='fa fa-trash'></i></a>"
          );
        },
      },

      // { "data": "nik","width":"10%",
      //     render: function(data, type, row) {
      //         return ''
      //         var dt1 = '<a href="/EmployeeData/EmployeeEdit" class="btn btn-dark shadow btn-xs sharp me-1"><i class="fas fa-pencil-alt"></i></a>'
      //         var dt2 = '<a href="#" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>'
      //         return dt1 + dt2;
      //     }
      // },
    ],
  });

  $("#table_data").on("click", ".delete-link", function (e) {
    e.preventDefault();
    var id = $(this).data("id");
    alertConfirm(
      "Anda yakin ingin menghapus corporate value ini?",
      "Tindakan ini tidak dapat dibatalkan.",
      function () {
        $.ajax({
          url: "/Api/Setting/Qualitative/delete/" + id,
          type: "get",
          success: function (response) {
            alertSuccess(
              "Deleted",
              "Corporate value has been deleted successfully."
            );
            table_data.ajax.reload();
          },
          error: function (xhr, status, error) {
            alertError("Error", "Failed to delete corporate value.");
            console.error(xhr.responseText);
          },
        });
      }
    );
  });

  $("#table_data").on("click", ".update-link", function (e) {
    e.preventDefault();
    var id = $(this).data("id");
    var corporateValue = $(this).data("corporate-value");
    var weightPercent = $(this).data("weight-percent");

    $("#editModal").modal("show");
    $("#editModalCorpInput").val(corporateValue);
    $("#editModalWeightInput").val(weightPercent);
    $("#editModal").data("id", id);
  });

  $("#editModal").on("click", ".btn-primary", function () {
    var editedCorpValue = $("#editModalCorpInput").val();
    var editedWeightValue = $("#editModalWeightInput").val();
    var dataId = $("#editModal").data("id");

    if (editedCorpValue === "") {
      alert("Tolong Isi Corporate Value");
    }
    if (editedWeightValue === "") {
      alert("Tolong Isi Weight Percent");
    }

    var data = {
      corporate_value: editedCorpValue,
      weight_percent: editedWeightValue,
    };

    if (editedCorpValue !== "" && editedWeightValue !== "") {
      $.ajax({
        url: "/Api/Setting/Qualitative/update/" + dataId,
        type: "post",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (response) {
          $("#editModal").modal("hide");
          alertSuccessfully();
          table_data.ajax.reload();
        },
        error: function (error) {
          console.error("Error during save action:", error);
        },
      });
    }
  });

  $("#editModal").on("click", ".btn-secondary", function () {
    $("#editModal").modal("hide");
  });

  var detail_id = $("#detail_id").val();

  var table_data_detail = $("#table_data_detail").DataTable({
    scrollY: false,
    scrollX: false,
    processing: false,
    serverSide: false,
    searching: false,
    paging: false,
    bInfo: false,
    ordering: false,
    ajax: {
      url: "/Api/Setting/Qualitative/selected/" + detail_id,
      type: "get",
      dataType: "json",
      data: {
        REQUEST_CODE: function () {
          return "";
        },
      },
    },
    columnDefs: [{ className: "text-center", targets: [0] }],

    order: [[0, "asc"]],
    columns: [
      {
        data: "dimension",
        width: "15%",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "description",
        width: "25%",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "value",
        render: function (data, type, row, meta) {
          return data
            .map((item, index) => `${index + 1}. ${item}`)
            .join("<br><br>");
        },
      },
      {
        data: "edit",
        width: "10%",
        render: function (data, type, row) {
          var dt1 =
            '<a href="/Settings/QualitativeEditDimension/' +
            detail_id +
            "/" +
            row.dimension_id +
            '" class="btn btn-dark shadow btn-xs sharp me-1"><i class="fas fa-pencil-alt"></i></a>';

          var dt2 =
            '<a href="#" class="delete-link btn btn-danger shadow btn-xs sharp delete-link" data-id="' +
            row.dimension_id +
            '"><i class="fa fa-trash"></i></a>';

          return dt1 + dt2;
        },
      },
    ],
  });

  $("#table_data_detail").on("click", ".delete-link", function (e) {
    e.preventDefault();
    var dimension_id = $(this).data("id");

    var data = {
      corporate_id: detail_id,
      dimension_id: dimension_id,
    };

    alertConfirm(
      "Anda yakin ingin menghapus dimension ini?",
      "Tindakan ini tidak dapat dibatalkan.",
      function () {
        $.ajax({
          url: "/Api/Setting/Qualitative/deleteDimension",
          type: "post",
          data: JSON.stringify(data),
          success: function (response) {
            alertSuccess("Deleted", "Dimension has been deleted successfully.");
            table_data_detail.ajax.reload();
          },
          error: function (xhr, status, error) {
            alertError("Error", "Failed to delete dimension.");
            console.error(xhr.responseText);
          },
        });
      }
    );
  });
});
