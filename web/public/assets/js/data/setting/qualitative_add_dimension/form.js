$(function () {
  ("use strict");

  function alertSuccess(title, message) {
    alert(title + "\n\n" + message);
  }

  $(document).ready(function () {
    $(".save-button").on("click", function () {
      var dimensionName = $("input[placeholder='Dimension']").val();
      var description = $("#description").val();
      var roaA = $("#roa-a").val();
      var roaB = $("#roa-b").val();
      var roaC = $("#roa-c").val();
      var roaD = $("#roa-d").val();
      var rangeOfAchievement = [roaA, roaB, roaC, roaD];

      var data = {
        name: dimensionName,
        description: description,
        range_of_achievement: rangeOfAchievement,
      };

      const id = detail_id;

      $.ajax({
        url: "/Api/Setting/Qualitative/addDimension/" + id,
        type: "post",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (updateResponse) {
          console.log(updateResponse);

          // alertSuccess("Success", "Your data has been successfully saved.");
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
