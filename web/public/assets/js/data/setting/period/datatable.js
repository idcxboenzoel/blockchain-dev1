$(function () {
  "use strict";

  var currentRowData = null;
  var dataTable = null;
  var fetchedData = [];

  function initializeDatePickers() {
    $("#submissionPeriodStart").on("change", function () {
      let submissionStart = $(this).val();
      if (submissionStart) {
        $("#submissionPeriodEnd").attr("min", submissionStart);
      } else {
        $("#submissionPeriodEnd").removeAttr("min");
      }

      let submissionEnd = $("#submissionPeriodEnd").val();
      if (submissionEnd && submissionEnd < submissionStart) {
        $("#submissionPeriodEnd").val("");
      }
    });

    $("#submissionPeriodEnd").on("change", function () {
      let submissionEnd = $(this).val();
      if (submissionEnd) {
        $("#submissionPeriodStart").attr("max", submissionEnd);
      } else {
        $("#submissionPeriodStart").removeAttr("max");
      }

      let submissionStart = $("#submissionPeriodStart").val();
      if (submissionStart && submissionStart > submissionEnd) {
        $("#submissionPeriodStart").val("");
      }
    });

    $("#approvalPeriodStart").on("change", function () {
      let approvalStart = $(this).val();
      if (approvalStart) {
        $("#approvalPeriodEnd").attr("min", approvalStart);
      } else {
        $("#approvalPeriodEnd").removeAttr("min");
      }

      let approvalEnd = $("#approvalPeriodEnd").val();
      if (approvalEnd && approvalEnd < approvalStart) {
        $("#approvalPeriodEnd").val("");
      }
    });

    $("#approvalPeriodEnd").on("change", function () {
      let approvalEnd = $(this).val();
      if (approvalEnd) {
        $("#approvalPeriodStart").attr("max", approvalEnd);
      } else {
        $("#approvalPeriodStart").removeAttr("max");
      }

      let approvalStart = $("#approvalPeriodStart").val();
      if (approvalStart && approvalStart > approvalEnd) {
        $("#approvalPeriodStart").val("");
      }
    });
  }

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
        data: "kpi_period",
        render: function (data, type, row, meta) {
          if (row.is_active_goal == 1) {
            return "GS + Mid-year";
          } else if (row.is_active_pa == 1) {
            return "Performance Appraisal";
          } else {
            return "";
          }
        },
      },
      {
        data: "submission_period",
        render: function (data, type, row, meta) {
          if (row.periode_rem_start_submit && row.periode_rem_end_submit) {
            let startDate = new Date(row.periode_rem_start_submit);
            let endDate = new Date(row.periode_rem_end_submit);

            let options = { day: "numeric", month: "short", year: "numeric" };

            let formattedStartDate = startDate.toLocaleDateString(
              "en-GB",
              options
            );
            let formattedEndDate = endDate.toLocaleDateString("en-GB", options);

            return formattedStartDate + " → " + formattedEndDate;
          } else {
            return "";
          }
        },
      },
      {
        data: "approval_period",
        render: function (data, type, row, meta) {
          if (row.periode_rem_start_appr && row.periode_rem_end_appr) {
            let startDate = new Date(row.periode_rem_start_appr);
            let endDate = new Date(row.periode_rem_end_appr);

            let options = { day: "numeric", month: "short", year: "numeric" };

            let formattedStartDate = startDate.toLocaleDateString(
              "en-GB",
              options
            );
            let formattedEndDate = endDate.toLocaleDateString("en-GB", options);

            return formattedStartDate + " → " + formattedEndDate;
          } else {
            return "";
          }
        },
      },
      {
        data: "reminder_frequency",
        render: function (data, type, row, meta) {
          if (data == 1) {
            return data + " Day";
          } else {
            return data + " Days";
          }
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
        { className: "text-left", targets: [0, 1, 2] },
        { className: "text-center", targets: [3, 4, 5] },
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
      },
      success: function (response) {
        if (response && response.data) {
          fetchedData = response.data.sort(function (a, b) {
            return a.id - b.id;
          });

          if (dataTable) {
            dataTable.destroy();
          }
          dataTable = initializeDataTable("table_data_pillars", fetchedData);
        } else {
          console.error("Invalid response format");
        }
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch data:", error);
      },
    });
  }

  document
    .getElementById("clearSubmissionPeriod")
    .addEventListener("change", function () {
      const submissionPeriodStart = document.getElementById(
        "submissionPeriodStart"
      );
      const submissionPeriodEnd = document.getElementById(
        "submissionPeriodEnd"
      );

      if (this.checked) {
        submissionPeriodStart.value = "";
        submissionPeriodEnd.value = "";
        submissionPeriodStart.disabled = true;
        submissionPeriodEnd.disabled = true;
      } else {
        submissionPeriodStart.disabled = false;
        submissionPeriodEnd.disabled = false;
      }
    });

  document
    .getElementById("clearApprovalPeriod")
    .addEventListener("change", function () {
      const approvalPeriodStart = document.getElementById(
        "approvalPeriodStart"
      );
      const approvalPeriodEnd = document.getElementById("approvalPeriodEnd");

      if (this.checked) {
        approvalPeriodStart.value = "";
        approvalPeriodEnd.value = "";
        approvalPeriodStart.disabled = true;
        approvalPeriodEnd.disabled = true;
      } else {
        approvalPeriodStart.disabled = false;
        approvalPeriodEnd.disabled = false;
      }
    });

  function validateForm() {
    let isValid = true;

    $(".error-message").remove();
    $("#generalError").hide();

    const submissionStart = $("#submissionPeriodStart").val();
    const submissionEnd = $("#submissionPeriodEnd").val();
    const approvalStart = $("#approvalPeriodStart").val();
    const approvalEnd = $("#approvalPeriodEnd").val();
    const reminderFrequency = $("#reminderFrequency").val();
    const kpiPeriod = $("#kpiPeriod").val();

    const submissionCheck = document.getElementById(
      "clearSubmissionPeriod"
    ).checked;
    const approvalCheck = document.getElementById(
      "clearApprovalPeriod"
    ).checked;

    const allEmpty =
      !submissionCheck &&
      !approvalCheck &&
      !submissionStart &&
      !submissionEnd &&
      !approvalStart &&
      !approvalEnd &&
      !reminderFrequency &&
      !kpiPeriod;

    if (allEmpty) {
      $("#generalError").show();
      isValid = false;
      return isValid;
    }

    if (submissionStart || submissionEnd) {
      if (!submissionStart) {
        $("#submissionPeriodStart").after(
          '<span class="error-message text-danger">This field is required</span>'
        );
        isValid = false;
      }
      if (!submissionEnd) {
        $("#submissionPeriodEnd").after(
          '<span class="error-message text-danger">This field is required</span>'
        );
        isValid = false;
      }
      if (submissionStart && submissionEnd && submissionEnd < submissionStart) {
        $("#submissionPeriodEnd").after(
          '<span class="error-message text-danger">End date cannot be before Start date</span>'
        );
        isValid = false;
      }
    }

    if (approvalStart || approvalEnd) {
      if (!approvalStart) {
        $("#approvalPeriodStart").after(
          '<span class="error-message text-danger">This field is required</span>'
        );
        isValid = false;
      }
      if (!approvalEnd) {
        $("#approvalPeriodEnd").after(
          '<span class="error-message text-danger">This field is required</span>'
        );
        isValid = false;
      }
      if (approvalStart && approvalEnd && approvalEnd < approvalStart) {
        $("#approvalPeriodEnd").after(
          '<span class="error-message text-danger">End date cannot be before Start date</span>'
        );
        isValid = false;
      }
    }

    if (reminderFrequency) {
      if (reminderFrequency <= 0) {
        $("#reminderContainer").after(
          '<span class="error-message text-danger">Reminder Frequency must be greater than 0</span>'
        );
        isValid = false;
      }
    }
    return isValid;
  }

  $("#saveButton").click(function () {
    if (!validateForm()) {
      return;
    }

    const submissionCheck = document.getElementById("clearSubmissionPeriod");
    const approvalCheck = document.getElementById("clearApprovalPeriod");

    var kpiPeriod = $("#kpiPeriod").val();
    var is_active_goal = 0;
    var is_active_pa = 0;

    if (kpiPeriod === "GS_Midyear") {
      is_active_goal = 1;
      is_active_pa = 0;
    } else if (kpiPeriod === "Performance_Appraisal") {
      is_active_goal = 0;
      is_active_pa = 1;
    }

    var data = fetchedData.map(function (item) {
      var entry = {
        id: item.id,
      };

      if ($("#submissionPeriodStart").val()) {
        entry.periode_rem_start_submit = $("#submissionPeriodStart").val();
      } else if (submissionCheck.checked) {
        entry.periode_rem_start_submit = null;
      }
      if ($("#submissionPeriodEnd").val()) {
        var submissionEndDate = new Date($("#submissionPeriodEnd").val());
        submissionEndDate.setHours(23, 59, 59, 999);
        entry.periode_rem_end_submit = submissionEndDate.toISOString();
      } else if (submissionCheck.checked) {
        entry.periode_rem_end_submit = null;
      }
      if ($("#approvalPeriodStart").val()) {
        entry.periode_rem_start_appr = $("#approvalPeriodStart").val();
      } else if (approvalCheck.checked) {
        entry.periode_rem_start_appr = null;
      }
      if ($("#approvalPeriodEnd").val()) {
        var approvalEndDate = new Date($("#approvalPeriodEnd").val());
        approvalEndDate.setHours(23, 59, 59, 999);
        entry.periode_rem_end_appr = approvalEndDate.toISOString();
      } else if (approvalCheck.checked) {
        entry.periode_rem_end_appr = null;
      }
      if ($("#reminderFrequency").val()) {
        entry.reminder_frequency = $("#reminderFrequency").val();
      }
      if (kpiPeriod) {
        entry.is_active_goal = is_active_goal;
        entry.is_active_pa = is_active_pa;
      }

      return entry;
    });

    console.log("Updated Data:", data);

    $.ajax({
      url: "/Api/Setting/Pillar/update_period",
      type: "PUT",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({ data }),
      success: function (response) {
        console.log("Data updated successfully");
        fetchData();
        $("#submissionPeriodStart").val("");
        $("#submissionPeriodEnd").val("");
        $("#approvalPeriodStart").val("");
        $("#approvalPeriodEnd").val("");
        $("#reminderFrequency").val(null);
        $("#kpiPeriod").val("");
        submissionCheck.checked = false;
        approvalCheck.checked = false;
        document.getElementById("submissionPeriodStart").disabled = false;
        document.getElementById("submissionPeriodEnd").disabled = false;
        document.getElementById("approvalPeriodStart").disabled = false;
        document.getElementById("approvalPeriodEnd").disabled = false;

        $("#successModal").modal("show");
      },
      error: function (xhr, status, error) {
        console.error("Failed to update data:", error);
      },
    });
  });

  function initializePage() {
    initializeDatePickers();
    fetchData();
  }

  initializePage();
});
