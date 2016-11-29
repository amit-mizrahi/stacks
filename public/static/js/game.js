// requires Stack.js, Config.js, DOM.js, Motion.js

var Game = function() {
  this.stacks = [new Stack(), new Stack(), new Stack()]
  this.currentStack = this.stacks[0];
  this.state = State.AT_REST;

  this.time = 0;
  this.minTime = Time.DEFAULT_MIN_TIME;
  this.lastEnqueued = 0;
  this.score = 0;
  this.lost = false;

  this.motion = {
    sourceStack: null,
    targetStack: null,
    startTime: null
  };

  this.cancellation = {
    startTime: null,
    stack: null
  };

  for(var i = 0; i < this.stacks.length; i++) {
    this.stacks[i].randomlyFill();
  }
}

Game.prototype.setupPositions = function() {
  for(var i = 0; i < this.stacks.length; i++) {
    for(var j = 0; j < this.stacks[i].size(); j++) {
      var element = this.stacks[i].elements[j];
      element.x = Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i;
      element.y = Geometry.GROUND_HEIGHT + Geometry.MARKER_HEIGHT + Geometry.ELEMENT_HEIGHT*j;
    }
  }
}

Game.prototype.randomlyEnqueue = function() {
  var r = Math.floor(Math.abs(Math.random()*3 - 0.01));
  var randomStack = this.stacks[r];
  var element = randomStack.randomElement();
  if(randomStack.elements[0]) {
    while(element.color == randomStack.elements[0].color) {
      element = randomStack.randomElement();
    }
  }
  randomStack.enqueue(element);
  this.setupPositions();
}

Game.prototype.setState = function(state) {
  if(state == State.AT_REST || state == State.IN_MOTION || state == State.CANCELING_OUT) {
    this.state = state;
  }
}

Game.prototype.beginMotion = function() {
    this.setState(State.IN_MOTION);
    this.motion.startTime = this.time;
}

Game.prototype.drawStacks = function() {
  // Draws a stack given the canvas context, the stack,
  // the "x offset" of the stack, and whether the stack is selected.

  this.ctx.fillStyle = CanvasColor.BROWN;
  DOM.fillRect(
    this.ctx,
    0,
    0,
    Geometry.CANVAS_WIDTH,
    Geometry.GROUND_HEIGHT
  );

  for(var i = 0; i < this.stacks.length; i++) {
    var stack = this.stacks[i];
    this.ctx.fillStyle = CanvasColor.BLACK;
    DOM.fillRect(
      this.ctx,
      Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
      Geometry.GROUND_HEIGHT,
      Geometry.ELEMENT_WIDTH,
      Geometry.MARKER_HEIGHT
    );
    if(this.currentStack != stack) {
      this.ctx.fillStyle = 'rgba(255, 225, 225, 0.4)';
      DOM.fillRect(
        this.ctx,
        Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
        Geometry.GROUND_HEIGHT,
        Geometry.ELEMENT_WIDTH,
        Geometry.MARKER_HEIGHT
      );
    }
    for(var j = 0; j < stack.size(); j++) {
      stack.elements[j].draw(this.ctx, this.currentStack == stack);
    }
  }
}

Game.prototype.motionHandler = function() {
  var _this = this;

  var flyingElement = this.motion.sourceStack.peek();

  var old_x = flyingElement.x;
  var old_y = flyingElement.y;
  var new_x = Motion.xFlight(_this, this.stacks, this.motion.sourceStack, this.motion.targetStack);
  var new_y = Motion.yFlight(_this, this.stacks, this.motion.sourceStack, this.motion.targetStack);

  flyingElement.x = new_x;
  flyingElement.y = new_y;

  // Collision detection

  // Note: Checking here for downwards y-velocity to make collision detection accurate
  // (only detect collision if moving downward, not up). This covers the edge
  // case of popping onto the same stack.
  var dy = new_y - old_y;

  // Check whether the source and target stacks are equal

  if(this.motion.sourceStack == this.motion.targetStack) {
    stackTop = this.motion.targetStack.peekTwice();
  }
  else {
    stackTop = this.motion.targetStack.peek();
  }

  if(stackTop) {
    stackTopX = stackTop.x;
    stackTopY = stackTop.y;
  }
  else {
    var stackIndex = this.stacks.indexOf(this.motion.targetStack);
    stackTopY = Geometry.MARKER_HEIGHT + Geometry.GROUND_HEIGHT;
    stackTopX = Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(stackIndex+1) + Geometry.ELEMENT_WIDTH*stackIndex;
  }

  if(Motion.isColliding(flyingElement, stackTopX, stackTopY, dy)) {
    this.state = State.EVALUATING;
    this.motion.targetStack.push(this.motion.sourceStack.pop());
  }
}

Game.prototype.evalHandler = function() {
  if(this.motion.targetStack.peekTwice()) {
    // We've popped onto a nonempty stack. Check to see if colors cancel
    if(this.motion.targetStack.peek().color == this.motion.targetStack.peekTwice().color) {
      this.motion.targetStack.peek().canceling = true;
      this.motion.targetStack.peekTwice().canceling = true;
      return this.state = State.CANCELING;
    }
  }
  this.motion.sourceStack = null;
  this.motion.targetStack = null;
  this.state = State.AT_REST;
  if(this.losing()) {
    this.gameOver();
  }
}

Game.prototype.cancelHandler = function() {

  if(this.cancellation.startTime == null) {
    this.cancellation.stack = this.motion.targetStack;
    this.motion.sourceStack = null;
    this.motion.targetStack = null;
    this.cancellation.startTime = this.time;
  }
  else if(this.time - this.cancellation.startTime == Time.CANCELLATION_TIME) {
    this.cancellation.startTime = null;
    var top = this.cancellation.stack.pop();
    var second = this.cancellation.stack.pop();
    if(this.losing()) {
      this.gameOver();
    }
    this.score = this.score + this.determineScore(top);
    DOM.updateScoreText(parseInt(this.score));
    this.state = State.AT_REST;
  }
}

Game.prototype.losing = function() {
  var result = false;
  for(var i = 0; i < this.stacks.length; i++) {
    result = result || this.stacks[i].size() > Geometry.STACK_HEIGHT_THRESHOLD;
  }
  return result;
}

Game.prototype.gameOver = function() {
  this.lost = true;
  this.ctx.fillStyle = 'rgba(250, 200, 200, 0.5)';
  DOM.fillRect(this.ctx, 0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  DOM.showGameOverText(); // from DOM.js
}

Game.prototype.determineScore = function(block) {
  if(block.color == Color.RED ||
    block.color == Color.BLUE ||
    block.color == Color.YELLOW) {
    return 200;
  }
  else if(block.color == Color.GREEN) {
    return 500;
  }
  else if(block.color == Color.PURPLE) {
    return 1000;
  }
  else if(block.color == Color.ORANGE) {
    return 2000;
  }
  else {
    return 0;
  }
}

Game.prototype.update = function() {
  this.time++;
  if(this.time % 10 == 0) {
      this.score++;
      DOM.updateScoreText(this.score);
  }

  if(this.state == State.AT_REST) {
    r = Math.random();
    if(r < this.time*Time.RANDOM_TIME_THRESHOLD &&
        this.time - this.lastEnqueued > this.minTime) {
      // Decrease minimum time between enqueueings

      if(this.minTime > Time.MINIMUM_MIN_TIME) {
        this.minTime -= 1;
      }

      this.randomlyEnqueue();
      this.lastEnqueued = this.time;
      if(this.losing()) {
        this.gameOver();
      }
    }
  }
  else if(this.state == State.IN_MOTION) {
    this.motionHandler();
  }
  else if(this.state == State.EVALUATING) {
    this.evalHandler();
  }
  else if(this.state == State.CANCELING) {
    this.cancelHandler();
  }
}

Game.prototype.draw = function() {
  this.ctx.clearRect(0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  this.ctx.fillStyle = 'rgba(230, 0, 0, 0.7)';
  DOM.fillRect(this.ctx, 0, Geometry.CANVAS_HEIGHT - Geometry.CEILING_HEIGHT,
    Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  this.ctx.fillStyle = 'rgba(225, 225, 225, 0.9)';
  DOM.fillRect(this.ctx, 0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT -
    Geometry.CEILING_HEIGHT);
  this.drawStacks(this.ctx);
}
