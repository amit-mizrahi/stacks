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
  },

  drawExplanation: function(ctx) {
    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
    '<foreignObject width="100%" height="100%">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" id="explanation">' +
    '<h3>How to Play</h3>' +
    '<ul>' +
    '  <li>Use the arrow keys to move<br/>' +
    '     between the stacks.</li> ' +
    '  <li>Press A to launch an item<br/> ' +
    '  to the left of the current stack.</li> ' +
    '  <li>Press D to launch an item to<br/> ' +
    '     the right of the current stack.</li> ' +
    '  <li>Try to make blocks of the same ' +
    '    color touch!</li> ' +
    ' </ul> ' +
    ' </div> ' +
    ' </foreignObject> ' +
    ' </svg>';

    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([data], {type: 'image/svg+xml'});
    var url = DOMURL.createObjectURL(svg);

    img.onload = function() {
      ctx.drawImage(img, Geometry.CANVAS_WIDTH / 5, Geometry.CANVAS_HEIGHT - (2 * Geometry.CANVAS_HEIGHT / 3));
      DOMURL.revokeObjectURL(url);
    }

    img.src = url;
  }
}
