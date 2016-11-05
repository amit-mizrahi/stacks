function fillRect(ctx, x, y, width, height) {
  ctx.fillRect(x, Geometry.CANVAS_HEIGHT - y, width, -1 * height);
}

var randomElement = function() {
  var r = Math.random();
  if(r < 0.30) {
    return new Element(Color.RED);
  }
  else if(0.30 <= r && r <= 0.60) {
    return new Element(Color.YELLOW);
  }
  else if(0.60 <= r && r <= 0.90) {
    return new Element(Color.BLUE);
  }
  else if(0.90 <= r && r <= 0.94) {
    return new Element(Color.PURPLE);
  }
  else if(0.94 <= r && r <= 0.97) {
    return new Element(Color.GREEN);
  }
  else {
    return new Element(Color.ORANGE);
  }
}

var updateScoreText = function(score) {
  $(".score-display").text(score);
}
