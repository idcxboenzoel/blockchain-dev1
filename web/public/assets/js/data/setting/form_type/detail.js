$(function () {
  "use strict";

  const id = detail_id;

  $.ajax({
    url: "/Api/Setting/FormType/get/" + id,
    type: "get",
    dataType: "json",
    data: {
      REQUEST_CODE: function () {
        return "";
      },
    },
    success: function (response) {
      var formType = response.data;
      var quantitativeOn = formType.quantitative_on === 1 ? true : false;
      var qualitativeOn = formType.qualitative_on === 1 ? true : false;
      $("#formName").val(formType.form_name);
      $("#checkQuantitative").prop("checked", quantitativeOn);
      $("#checkQualitative").prop("checked", qualitativeOn);
      console.log(response.data);
    },
  });

  $("#btnSave").on("click", function () {
    var formNameValue = $("#formName").val();
    var checkQuantitativeValue = $("#checkQuantitative").prop("checked");
    var checkQualitativeValue = $("#checkQualitative").prop("checked");

    var requestData = {
      form_name: formNameValue,
      qualitative_on: checkQualitativeValue ? 1 : 0,
      quantitative_on: checkQuantitativeValue ? 1 : 0,
    };

    $.ajax({
      url: "/Api/Setting/FormType/update/" + id,
      type: "post",
      dataType: "json",
      data: JSON.stringify(requestData),
      success: function (response) {
        alert(response.message);
      },
      error: function (error) {
        alert(error);
      },
    });
  });
});
