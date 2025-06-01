$(function () {
  "use strict";

  var currentRowData = null;
  var dataTable = null;

  function initializeDataTable(tableId, data) {
    var columns = [
      {
        data: "id",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "name",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "value_quantitative",
        render: function (data, type, row, meta) {
          return data + "%";
        },
      },
      {
        data: "value_qualitative",
        render: function (data, type, row, meta) {
          return data + "%";
        },
      },
      {
        data: "edit",
        width: "15%",
        render: function (data, type, row) {
          return (
            "<a href='#' class='update-link btn btn-dark shadow btn-xs sharp me-1' data-id='" +
            row.id +
            "' data-name='" +
            row.name +
            "' data-value-quantitative='" +
            row.value_quantitative +
            "' data-value-qualitative='" +
            row.value_qualitative +
            "'><i class='fas fa-pencil-alt'></i></a>"
          );
        },
      },
    ];

    return $("#" + tableId).DataTable({
      scrollY: false,
      scrollX: false,
      processing: false,
      serverSide: false,
      searching: false,
      paging: false,
      bInfo: false,
      ordering: false,
      data: data,
      columnDefs: [
        { className: "text-left", targets: [0, 1] },
        { className: "text-center", targets: [2, 3, 4] },
      ],
      order: [[0, "asc"]],
      initComplete: function () {
        $(this.api().table().container()).addClass("table-left-aligned");
      },
      columns: columns,
    });
  }

  function fetchData() {
    $.ajax({
      url: "/Api/Setting/Pillar/list",
      type: "get",
      dataType: "json",
      data: {
        REQUEST_CODE: "",
        target: "all",
      },
      success: function (response) {
        if (response && response.data) {
          response.data.sort(function (a, b) {
            return a.id - b.id;
          });

          if (dataTable) {
            dataTable.destroy();
          }
          dataTable = initializeDataTable("table_data_pillars", response.data);
        } else {
          console.error("Invalid response format");
        }
      },
    });
  }

  fetchData();

  function openEditModal(data) {
    $("#pillarName").val(data.name);
    $("#pillarQuantitative").val(data.value_quantitative);
    $("#pillarQualitative").val(data.value_qualitative);
    currentRowData = data;
    $("#editModal").modal("show");
  }

  $("#pillarQuantitative").on("input", function () {
    var quantitativeValue = parseInt($(this).val());
    quantitativeValue = Math.min(100, Math.max(0, quantitativeValue));
    $(this).val(quantitativeValue);
    var qualitativeValue = 100 - quantitativeValue;
    $("#pillarQualitative").val(qualitativeValue);
  });

  $("#pillarQualitative").on("input", function () {
    var qualitativeValue = parseInt($(this).val());
    qualitativeValue = Math.min(100, Math.max(0, qualitativeValue));
    $(this).val(qualitativeValue);
    var quantitativeValue = 100 - qualitativeValue;
    $("#pillarQuantitative").val(quantitativeValue);
  });

  $(document).on("click", ".update-link", function (e) {
    e.preventDefault();
    var rowData = {
      id: $(this).data("id"),
      name: $(this).data("name"),
      value_quantitative: $(this).data("value-quantitative"),
      value_qualitative: $(this).data("value-qualitative"),
    };
    openEditModal(rowData);
  });

  $("#closeButton").on("click", function () {
    $("#editModal").modal("hide");
  });

  $("#saveChanges").on("click", function () {
    var updatedData = {
      id: currentRowData.id,
      name: $("#pillarName").val(),
      value_quantitative: parseInt($("#pillarQuantitative").val()),
      value_qualitative: parseInt($("#pillarQualitative").val()),
    };

    $.ajax({
      url: "/Api/Setting/Pillar/update",
      type: "PUT",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(updatedData),
      success: function (response) {
        console.log("Data updated successfully");
        $("#editModal").modal("hide");
        fetchData();
      },
      error: function (xhr, status, error) {
        console.error("Failed to update data:", error);
      },
    });
  });
});
