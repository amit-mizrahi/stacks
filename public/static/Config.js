var Key = {
  LEFT_SELECT: 37,
  RIGHT_SELECT: 39,
  LEFT_POP: 65,
  RIGHT_POP: 68,
  ENTER: 13
}

var Color = {
  RED: 1,
  YELLOW: 2,
  BLUE: 3,
  GREEN: 4,
  PURPLE: 5,
  ORANGE: 6
}

var ColorScore = {
  RED: 1,
  BLUE: 2,
  YELLOW: 5,
  GREEN: 10,
  PURPLE: 50,
  ORANGE: 100
}

var CanvasColor = {
  RED: '#F17777',
  YELLOW: '#F1DD77',
  BLUE: '#527B9B',
  GRAY: '#555555',
  BLACK: '#121212',
  BROWN: '#333333',
  CANCEL_COLOR: '#FFFFCC',
  GREEN: '#5AB66F',
  PURPLE: '#90519F',
  ORANGE: '#F1AD78'
}

var State = {
    AT_REST: 1,
    IN_MOTION: 2,
    EVALUATING: 3,
    CANCELING: 4
  }

var Time = {
  CANCELLATION_TIME: 20,
  RANDOM_TIME_THRESHOLD: 1e-3,
  MIN_TIME: 100,
  MINIMUM_MIN_TIME: 10
}

function setupGeometry(bodyWidth, bodyHeight) {
  var geom = {
    ELEMENT_WIDTH: bodyWidth/15.0,
    ELEMENT_HEIGHT: bodyHeight/8.0,
    ELEMENT_DIST: bodyWidth/15.0, // Distance between stacks
    ELEMENT_OFFSET: bodyWidth/3.7,
    MARKER_HEIGHT: bodyHeight/15.0, // Height of marker underneath each stack
    CANVAS_WIDTH: bodyWidth,
    CANVAS_HEIGHT: bodyHeight,
    GROUND_HEIGHT: bodyHeight/8.0,
    CEILING_HEIGHT: bodyHeight/15.0
  };
  geom.STACK_HEIGHT_THRESHOLD = (geom.CANVAS_HEIGHT -
    (geom.GROUND_HEIGHT + geom.MARKER_HEIGHT + geom.CEILING_HEIGHT))/(geom.ELEMENT_HEIGHT);
  return geom;
}

function setupPhysics(geom) {
  var phys = {
    GRAVITY: 9e-4*geom.CANVAS_HEIGHT,
    FLIGHT_TIME: 40
  };
  return phys;
}

var Geometry = {};
var Physics = {};

var adjustWindow = function() {
  var SMALLEST_HEIGHT = 400;
  var bodyWidth = Math.max($("body").width(),
    SMALLEST_HEIGHT*($("body").width()/$("body").height()));
  var bodyHeight = Math.max($("body").height()*0.9, SMALLEST_HEIGHT);
  Geometry = setupGeometry(bodyWidth, bodyHeight);
  Physics = setupPhysics(Geometry);
  $("#gameplay").attr("width", Geometry.CANVAS_WIDTH);
  $("#gameplay").attr("height", Geometry.CANVAS_HEIGHT);
  $("#gameplay").css("width", Geometry.CANVAS_WIDTH);
  $("#gameplay").css("height", Geometry.CANVAS_HEIGHT);
}
