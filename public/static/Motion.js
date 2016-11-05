function xFlight(game, stacks, source, target) {
  var s = source.size();
  var r = target.size();
  var g = Physics.GRAVITY;
  var h = Geometry.ELEMENT_HEIGHT;
  var T = Physics.FLIGHT_TIME;

  var timeElapsed = game.time - game.motion.startTime;
  var coefficient = stacks.indexOf(target) - stacks.indexOf(source);
  var stackIndex = stacks.indexOf(source);
  var stackX = Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(stackIndex+1) + Geometry.ELEMENT_WIDTH*stackIndex;

  return stackX +
    ((coefficient*(Geometry.ELEMENT_WIDTH + Geometry.ELEMENT_DIST)*timeElapsed)/T);
}

function yFlight(game, stacks, source, target) {
  var s = source.size();
  var r = target.size();
  var g = Physics.GRAVITY;
  var h = Geometry.ELEMENT_HEIGHT;
  var T = Physics.FLIGHT_TIME;

  var timeElapsed = game.time - game.motion.startTime;

  return -0.5*g*(timeElapsed)**2 + (0.5*g*T - (Geometry.GROUND_HEIGHT + Geometry.MARKER_HEIGHT + (h*s))/T +
    (Geometry.GROUND_HEIGHT + Geometry.MARKER_HEIGHT + (h*r))/T)*timeElapsed + (Geometry.MARKER_HEIGHT + Geometry.GROUND_HEIGHT + h*s);
}

function isColliding(flyingElement, stackTopX, stackTopY, dy) {
  return Math.abs(flyingElement.x - stackTopX) <= 1 &&
    Math.abs(flyingElement.y - stackTopY) <= 1 + Geometry.ELEMENT_HEIGHT &&
    dy < 0;
}
