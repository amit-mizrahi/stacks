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
    $(".game-over-container").show();
  },

  updateTweetBox: function(text) {
    $("#share").append(
      $("<a href='https://twitter.com/share' class='twitter-share-button' data-size='large' data-text='" + text + "' data-url='http://stacks.amizrahi.com' data-hashtags='StacksGame' data-show-count='false'>Tweet</a><script async src='//platform.twitter.com/widgets.js' charset='utf-8'></script>")
    );
  },

  hideGameOverText: function() {
    $("#title").show();
    $("#explanation").show();
    $(".game-over-container").hide();
  },

  fillRect: function(ctx, x, y, width, height) {
    ctx.fillRect(x, Geometry.CANVAS_HEIGHT - y, width, -1 * height);
  },

  drawRect: function(ctx, x, y, width, height) {
    ctx.strokeRect(x, Geometry.CANVAS_HEIGHT - y, width, -1 * height);
  }
}
