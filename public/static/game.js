var Game = function() {
  this.stacks = [new Stack(), new Stack(), new Stack()]
  this.currentStack = this.stacks[0];
  this.state = State.AT_REST;

  this.time = 0;
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
  var element = randomElement();
  if(randomStack.elements[0]) {
    while(element.color == randomStack.elements[0].color) {
      element = randomElement();
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

Game.prototype.drawStacks = function(ctx) {
  // Draws a stack given whether the canvas context, the stack,
  // the "x offset" of the stack, and whether the stack is selected.

  ctx.fillStyle = CanvasColor.BROWN;
  fillRect(
    ctx,
    0,
    0,
    Geometry.CANVAS_WIDTH,
    Geometry.GROUND_HEIGHT
  );

  for(var i = 0; i < this.stacks.length; i++) {
    var stack = this.stacks[i];
    if(this.currentStack == stack) {
      ctx.fillStyle = CanvasColor.GRAY;
    }
    else {
      ctx.fillStyle = CanvasColor.BLACK;
    }
    fillRect(
      ctx,
      Geometry.ELEMENT_OFFSET + Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
      Geometry.GROUND_HEIGHT,
      Geometry.ELEMENT_WIDTH,
      Geometry.MARKER_HEIGHT
    );
    for(var j = 0; j < stack.size(); j++) {
      stack.elements[j].draw(ctx);
    }
  }
}

Game.prototype.motionHandler = function() {
  var _this = this;

  var flyingElement = this.motion.sourceStack.peek();

  var old_x = flyingElement.x;
  var old_y = flyingElement.y;
  var new_x = xFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
  var new_y = yFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);

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

  if(isColliding(flyingElement, stackTopX, stackTopY, dy)) {
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
    this.score = this.score + determineScore(top);
    updateScoreText(parseInt(this.score));
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
}

Game.prototype.showGameOverMessage = function() {
  $("#title").hide();
  ctx.fillStyle = 'rgba(250, 200, 200, 0.5)';
  fillRect(ctx, 0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  $("#game-over-heading").show();
  $("#game-over-text").show();
}

Game.prototype.update = function() {
  this.time++;
  if(this.time % 10 == 0) {
      this.score++;
      updateScoreText(this.score);
  }

  if(this.state == State.AT_REST) {
    r = Math.random();
    if(r < this.time*Time.RANDOM_TIME_THRESHOLD &&
        this.time - this.lastEnqueued > Time.MIN_TIME) {
      // Decrease minimum time between enqueueings

      if(Time.MIN_TIME > Time.MINIMUM_MIN_TIME) {
        Time.MIN_TIME -= 1;
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
  var canvas = document.getElementById("gameplay");
  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  ctx.fillStyle = 'rgba(230, 0, 0, 0.7)';
  fillRect(ctx, 0, Geometry.CANVAS_HEIGHT - Geometry.CEILING_HEIGHT,
    Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
  ctx.fillStyle = 'rgba(225, 225, 225, 0.9)';
  fillRect(ctx, 0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT -
    Geometry.CEILING_HEIGHT);
  this.drawStacks(ctx);
}
