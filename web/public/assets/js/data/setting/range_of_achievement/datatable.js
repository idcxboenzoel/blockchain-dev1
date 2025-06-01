$(function () {
  "use strict";

  function initializeDataTable(tableId, data, showEnd) {
    var columns = [
      {
        data: "value",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "type",
        render: function (data, type, row, meta) {
          return data;
        },
      },
      {
        data: "start_value",
        render: function (data, type, row, meta) {
          if (tableId.includes("qualitative")) {
            return row.start_value;
          } else {
            return (
              '<input class="start-value" style="max-width: 100%; padding: 5px; box-sizing: border-box; border: solid black" type="number" value="' +
              row.start_value +
              '">'
            );
          }
        },
      },
      {
        data: "end_value",
        render: function (data, type, row, meta) {
          if (tableId.includes("qualitative")) {
            return row.end_value;
          } else {
            return (
              '<input class="end-value" style="max-width: 100%; padding: 5px; box-sizing: border-box; border: solid black" type="number" value="' +
              row.end_value +
              '">'
            );
          }
        },
        visible: showEnd,
      },
    ];

    if (tableId.includes("qualitative")) {
      columns.push({
        data: "category_name",
        render: function (data, type, row, meta) {
          return (
            '<input class="name-value" style="max-width: 100%; padding: 5px; box-sizing: border-box; border: solid black" type="text" value="' +
            row.category_name +
            '">'
          );
        },
      });
      columns.push({
        data: "category_desc",
        width: "45%",
        render: function (data, type, row, meta) {
          return (
            '<textarea class="desc-value" rows="4" style="width: 100%; padding: 5px; box-sizing: border-box; border: solid black" type="text"">' +
            row.category_desc +
            "</textarea>"
          );
        },
      });
    }

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
      columnDefs: [{ className: "text-left", targets: "_all" }],
      order: [[0, "asc"]],
      initComplete: function () {
        $(this.api().table().container()).addClass("table-left-aligned");
      },
      columns: columns,
    });
  }

  $.ajax({
    url: "/Api/Setting/RangeOfAchievement/list",
    type: "get",
    dataType: "json",
    data: {
      REQUEST_CODE: function () {
        return "";
      },
    },
    success: function (response) {
      if (response && response.data) {
        var quantitativeData = response.data.filter(function (item) {
          return item.type === "QUANTITATIVE";
        });

        var qualitativeData = response.data.filter(function (item) {
          return item.type === "QUALITATIVE";
        });

        var quantitativeTable = initializeDataTable(
          "table_data_quantitative",
          quantitativeData,
          true
        );

        var qualitativeTable = initializeDataTable(
          "table_data_qualitative",
          qualitativeData,
          true
        );

        $("#table_data_qualitative").on(
          "change",
          'input[type="text"].name-value',
          function () {
            var rowIndex = qualitativeTable.row($(this).closest("tr")).index();
            qualitativeTable.cell(rowIndex, 4).data($(this).val());
          }
        );

        $("#table_data_qualitative").on(
          "change",
          'textarea[type="text"].desc-value',
          function () {
            var rowIndex = qualitativeTable.row($(this).closest("tr")).index();
            qualitativeTable.cell(rowIndex, 5).data($(this).val());
          }
        );

        $("#table_data_quantitative").on(
          "change",
          'input[type="number"].start-value',
          function () {
            var inputValue = parseFloat($(this).val());
            if (isNaN(inputValue)) {
              inputValue = 0;
            } else {
              inputValue = Math.max(0, Math.min(100, inputValue));
            }

            var rowIndex = quantitativeTable.row($(this).closest("tr")).index();
            quantitativeTable.cell(rowIndex, 2).data(inputValue);
          }
        );

        $("#table_data_quantitative").on(
          "change",
          'input[type="number"].end-value',
          function () {
            var inputValue = parseFloat($(this).val());
            if (isNaN(inputValue)) {
              inputValue = 0;
            } else {
              inputValue = Math.max(0, Math.min(100, inputValue));
            }

            var rowIndex = quantitativeTable.row($(this).closest("tr")).index();
            quantitativeTable.cell(rowIndex, 3).data(inputValue);
          }
        );

        $("#saveButton").on("click", function () {
          var updatedQualitativeData = qualitativeTable.rows().data().toArray();
          var updatedQuantitativeData = quantitativeTable
            .rows()
            .data()
            .toArray();

          var updatedData = updatedQualitativeData.concat(
            updatedQuantitativeData
          );

          console.log(updatedData);

          $.ajax({
            url: "/Api/Setting/RangeOfAchievement/update",
            type: "post",
            dataType: "json",
            data: JSON.stringify({ data: updatedData }),
            success: function (updateResponse) {
              alertSuccessfully();
            },
            error: function (error) {
              console.error(error);
            },
          });
        });
      } else {
        console.error("Invalid response format");
      }
    },
  });
});
