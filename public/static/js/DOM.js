// requires Config.js

var DOM = {
  animateScoreChange: function() {
    $(".score-display").css("background-color", "#ffe74c");
    $(".score-display").animate({backgroundColor: "#FFFFFF"}, 1000);
  },

  updateScoreText: function(score) {
    $(".score-display").text(score);
    $(".score-display-big").text(score);
  },

  updateHighScore: function(score) {
    $(".highest-score").text(score);
  },

  showGameOverText: function() {
    $("#title").hide();
    $("#explanation").hide();
    $("#game-over-heading").show();
    $("#game-over-text").show();
  },

  hideGameOverText: function() {
    $("#title").show();
    $("#explanation").show();
    $("#game-over-heading").hide();
    $("#game-over-text").hide();
  },

  fillRect: function(ctx, x, y, width, height) {
    ctx.fillRect(x, Geometry.CANVAS_HEIGHT - y, width, -1 * height);
  },

  drawRect: function(ctx, x, y, width, height) {
    ctx.strokeRect(x, Geometry.CANVAS_HEIGHT - y, width, -1 * height);
  }
}
