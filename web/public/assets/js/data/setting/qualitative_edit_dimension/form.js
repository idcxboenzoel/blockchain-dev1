$(function () {
  ("use strict");

  function alertSuccess(title, message) {
    alert(title + "\n\n" + message);
  }

  function fetchData() {
    var data = {
      corporate_id: corporate_id,
      dimension_id: dimension_id,
    };

    $.ajax({
      url: "/Api/Setting/Qualitative/getDimension",
      type: "post",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.status == 200) {
          var dimension = response.dimension;
          $("#dimension-name").val(dimension.name);
          $("#description").val(dimension.description);
          if (dimension.range_of_achievement.length > 0) {
            $("#roa-a").val(dimension.range_of_achievement[0]);
            $("#roa-b").val(dimension.range_of_achievement[1]);
            $("#roa-c").val(dimension.range_of_achievement[2]);
            $("#roa-d").val(dimension.range_of_achievement[3]);
          }
        } else {
          alertSuccess("Error", "Failed to fetch data.");
        }
      },
      error: function (error) {
        console.error(error);
        alertSuccess("Error", "An error occurred while fetching data.");
      },
    });
  }

  $(document).ready(function () {
    fetchData();

    $(".save-button").on("click", function () {
      var dimensionName = $("input[placeholder='Dimension']").val();
      var description = $("#description").val();
      var roaA = $("#roa-a").val();
      var roaB = $("#roa-b").val();
      var roaC = $("#roa-c").val();
      var roaD = $("#roa-d").val();
      var rangeOfAchievement = [roaA, roaB, roaC, roaD];

      var data = {
        dimension_id: dimension_id,
        corporate_id: corporate_id,
        name: dimensionName,
        description: description,
        range_of_achievement: rangeOfAchievement,
      };

      $.ajax({
        url: "/Api/Setting/Qualitative/updateDimension",
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
