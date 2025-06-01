$(function () {
  ("use strict");

  function alertSuccess(title, message) {
    alert(title + "\n\n" + message);
  }

  $(document).ready(function () {
    $(".save-button").on("click", function () {
      var corporateValue = $("input[placeholder='Corporate Value']").val();
      var weightPercent = $("input[placeholder='Weight Percent']").val();
      if (corporateValue == "") {
        return alert("Tolong isi Corporate Value");
      }

      if (weightPercent == "") {
        return alert("Tolong isi Weight Percent");
      }

      var data = {
        corporate_value: corporateValue,
        weight_percent: weightPercent,
      };

      $.ajax({
        url: "/Api/Setting/Qualitative/addCorporateValue",
        type: "post",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (updateResponse) {
          console.log(updateResponse);

          if (updateResponse.status == 409) {
            alertSuccess("Error", updateResponse.message);
          } else {
            alertSuccessfully();
            setTimeout(function () {
              window.location.href = document.referrer;
            }, 2000);
          }
        },
        error: function (error) {
          console.error(error);
        },
      });
    });
  });
});
