// requires Config.js

var DOM = {
  updateScoreText: function(score) {
    $(".score-display").text(score);
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
