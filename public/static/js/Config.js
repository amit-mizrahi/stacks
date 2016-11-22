var Key = {
  LEFT_SELECT: 37,
  RIGHT_SELECT: 39,
  LEFT_POP: 65,
  RIGHT_POP: 68,
  ENTER: 13
};

var Color = {
  RED: 1,
  YELLOW: 2,
  BLUE: 3,
  GREEN: 4,
  PURPLE: 5,
  ORANGE: 6
};

var ColorScore = {
  RED: 1,
  BLUE: 2,
  YELLOW: 5,
  GREEN: 10,
  PURPLE: 50,
  ORANGE: 100
};

var CanvasColor = {
  RED: "#F17777",
  YELLOW: "#F1DD77",
  BLUE: "#527B9B",
  GRAY: "#AAAAAA",
  BLACK: "#121212",
  BROWN: "#333333",
  CANCEL_COLOR: "#FFFFCC",
  GREEN: "#5AB66F",
  PURPLE: "#90519F",
  ORANGE: "#F1AD78"
};

var State = {
  AT_REST: 1,
  IN_MOTION: 2,
  EVALUATING: 3,
  CANCELING: 4
};

var Time = {
  CANCELLATION_TIME: 20,
  RANDOM_TIME_THRESHOLD: 1e-3,
  DEFAULT_MIN_TIME: 100,
  MINIMUM_MIN_TIME: 10
};

var setupGeometry = function(canvasWidth, canvasHeight) {
  var Geometry = {
    ELEMENT_WIDTH: canvasWidth / 15.0,
    ELEMENT_HEIGHT: canvasHeight / 8.0,
    ELEMENT_DIST: canvasWidth / 15.0, // Distance between stacks
    ELEMENT_OFFSET: canvasWidth / 3.7,
    MARKER_HEIGHT: canvasHeight / 15.0, // Height of marker underneath each stack
    CANVAS_WIDTH: canvasWidth,
    CANVAS_HEIGHT: canvasHeight,
    GROUND_HEIGHT: canvasHeight / 8.0,
    CEILING_HEIGHT: canvasHeight / 15.0
  };
  Geometry.STACK_HEIGHT_THRESHOLD = (Geometry.CANVAS_HEIGHT -
    (Geometry.GROUND_HEIGHT + Geometry.MARKER_HEIGHT + Geometry.CEILING_HEIGHT))
    /(Geometry.ELEMENT_HEIGHT);
  return Geometry;
};

var setupPhysics = function(Geometry) {
  var Physics = {
    GRAVITY: 9e-4 * Geometry.CANVAS_HEIGHT,
    FLIGHT_TIME: 40
  };
  return Physics;
};

var Geometry;
var Physics;

var Config = {
  adjustWindow: function () {
    var bodyWidth = $(window).width();
    var bodyHeight = $(window).height();
    var SMALLEST_WIDTH = 900;
    var canvasWidth = Math.max(bodyWidth, SMALLEST_WIDTH);
    var canvasHeight = Math.max(bodyHeight * 0.9,
      SMALLEST_WIDTH * (bodyHeight / bodyWidth) * 0.9);
    Geometry = setupGeometry(canvasWidth, canvasHeight);
    Physics = setupPhysics(Geometry);
    $("#gameplay").attr("width", Geometry.CANVAS_WIDTH);
    $("#gameplay").attr("height", Geometry.CANVAS_HEIGHT);
    $("#gameplay").css("width", Geometry.CANVAS_WIDTH);
    $("#gameplay").css("height", Geometry.CANVAS_HEIGHT);
  }
};
