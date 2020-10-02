$(window).bind('unload', function () {
  document.cookie = "refreshed=true";
});

var clickLock = false;

$(".node").click(function (e) {
  if (clickLock) {
    return false;
  }
  clickLock = true;
  var x = $(this).data('x');
  var y = $(this).data('y');
  console.log(x, y);

  $(this).attr("disabled", true);
  $(this).addClass("btn-secondary");
  $(this).removeClass("btn-info");

  $(this).html("X");


  $.post("/move",
    {
      x: x,
      y: y,
      user: "X"
    },
    function (data, status) {

      if(data.error){
        $("#gameResult").html(data.error);
      }

      if (data.move) {
        console.log("Data: " + data.move.x + "\nStatus: " + status);
        $(".node").toArray().forEach(element => {
          if ($(element).data('x') == data.move.x && $(element).data('y') == data.move.y) {
            $(element).attr("disabled", true);
            $(element).addClass("btn-secondary");
            $(element).removeClass("btn-info");

            $(element).html("O");
          }
        });
      }

      if (data.result) {
        switch (data.result) {
          case "T":
            $("#gameResult").html("Tie");
            break;
          case "X":
            $("#gameResult").html("Winner is User");
            break;
          case "O":
            $("#gameResult").html("Winner is Computer");
            break;
        }
        $("#resetButton").addClass("d-line");
        $("#resetButton").removeClass("d-none");

        $(".node").toArray().forEach(element => {
          if ($(element).html() == data.result) {
            $(element).attr("disabled", true);
            $(element).addClass("btn-danger");
            $(element).removeClass("btn-info");

            $("#resetButton").addClass("d-line");
            $("#resetButton").removeClass("d-none");
          }
        });
      }

      clickLock = false;

    });

});