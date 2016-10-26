$(function() {

  var Geometry = {
    ELEMENT_WIDTH: 50,
    ELEMENT_HEIGHT: 50,
    ELEMENT_DIST: 50, // Distance between stacks
    MARKER_HEIGHT: 20, // Height of marker underneath each stack
    CANVAS_WIDTH: 350,
    CANVAS_HEIGHT: 500,
    GROUND_HEIGHT: 100,
  }

  var Physics = {
    GRAVITY: 0.5,
    FLIGHT_TIME: 35
  }

  var Key = {
    LEFT_STACK_SELECT: 65,
    MID_STACK_SELECT: 83,
    RIGHT_STACK_SELECT: 68,
    POP_ONTO_LEFT: 74,
    POP_ONTO_MID: 75,
    POP_ONTO_RIGHT: 76
  }

  var Color = {
      RED: 1,
      YELLOW: 2,
      BLUE: 3
  }

  var CanvasColor = {
      RED: '#AF2001',
      YELLOW: '#F1DE55',
      BLUE: '#5595F1',
      GRAY: '#555555',
      BLACK: '#121212',
      BROWN: '#734D26'
  }

  var State = {
      AT_REST: 1,
      IN_MOTION: 2,
      CANCELING_OUT: 3
  }

  var Element = function(color) {
    this.color = color;
    this.x = null;
    this.y = null;
  }

  Element.prototype.draw = function(ctx) {
    if(this.color == Color.RED) {
      ctx.fillStyle = CanvasColor.RED;
    }
    else if(this.color == Color.YELLOW) {
      ctx.fillStyle = CanvasColor.YELLOW;
    }
    else if(this.color == Color.BLUE) {
      ctx.fillStyle = CanvasColor.BLUE
    }
    ctx.fillRect(this.x, Geometry.CANVAS_WIDTH - this.y, Geometry.ELEMENT_WIDTH, Geometry.ELEMENT_HEIGHT);
  }

  var randomElement = function() {
    var r = Math.random();
    if(r < 0.33) {
      return new Element(Color.RED);
    }
    else if(0.33 <= r && r <= 0.66) {
      return new Element(Color.YELLOW);
    }
    else {
      return new Element(Color.BLUE);
    }
  }

  var Stack = function() {
    // Represents a stack of elements as a list
    // "Top" element is the last element
    // (although this is really a deque whose interface is restricted to act as a stack)
    this.elements = [];
  }

  Stack.prototype.push = function(el) {
    this.elements.push(el);
  }

  Stack.prototype.pop = function() {
    if(this.elements != []) {
      return this.elements.pop();
    }
    else {
      return null;
    }
  }

  Stack.prototype.randomlyFill = function() {
    // Fills the stack with a random number (2 < n < 10) of random elements.
    var numElements = Math.floor((Math.random() * 5) + 2);
    for(var i = 0; i < numElements; i++) {
      this.push(randomElement());
    }
  }

  Stack.prototype.enqueue = function(el) {
    // Only accessible to the game, not to the user. Adds an item to the bottom of the stack.
    var newElements = [];
    newElements.push(el);
    for(var i = 0; i < this.size(); i++) {
      newElements.push(this.elements[i]);
    }
    this.elements = newElements;
  }

  Stack.prototype.size = function() {
    return this.elements.length;
  }

  var Game = function() {
    this.stacks = [new Stack(), new Stack(), new Stack()]
    this.currentStack = this.stacks[0];
    this.state = State.AT_REST;
    this.time = 0;
    this.motion = {
      sourceStack: null,
      targetStack: null,
      startTime: null
    };

    for(var i = 0; i < this.stacks.length; i++) {
      this.stacks[i].randomlyFill();
    }
  }

  Game.prototype.setupPositions = function() {
    for(var i = 0; i < this.stacks.length; i++) {
      for(var j = 0; j < this.stacks[i].size(); j++) {
        var element = this.stacks[i].elements[j];
        element.x = Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i;
        element.y = Geometry.MARKER_HEIGHT + Geometry.ELEMENT_HEIGHT*j;
      }
    }
  }

  Game.prototype.setState = function(state) {
    if(state == State.AT_REST || state == State.IN_MOTION || state == State.CANCELING_OUT) {
      this.state = state;
    }
  }

  Game.prototype.popPush = function(sourceStack, targetStack) {
    if(targetStack) {
      var popped = sourceStack.pop();
      if(popped) {
        targetStack.push(popped);
      }
    }
  }

  Game.prototype.debug = function() {
    console.log(this.stacks[0].elements);
    console.log(this.stacks[1].elements);
    console.log(this.stacks[2].elements);
  }

  Game.prototype.beginMotion = function() {
      game.setState(State.IN_MOTION);
      game.motion.startTime = game.time;
  }

  Game.prototype.drawStacks = function(ctx) {
    // Draws a stack given whether the canvas context, the stack,
    // the "x offset" of the stack, and whether the stack is selected.

    ctx.fillStyle = CanvasColor.BROWN;
    ctx.fillRect(
      0,
      Geometry.CANVAS_HEIGHT - Geometry.GROUND_HEIGHT,
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
      ctx.fillRect(
        Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
        Geometry.CANVAS_HEIGHT - Geometry.GROUND_HEIGHT - Geometry.MARKER_HEIGHT,
        Geometry.ELEMENT_WIDTH,
        Geometry.MARKER_HEIGHT
      );
      for(var j = 0; j < stack.size(); j++) {
        stack.elements[j].draw(ctx);
      }
    }
  }

  Game.prototype.update = function() {

    game.time += 1;

    function xFlight(stacks, source, target) {
      var s = source.size();
      var r = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var T = Physics.FLIGHT_TIME;
      var timeElapsed = game.time - game.motion.startTime;
      var coefficient = stacks.indexOf(target) - stacks.indexOf(source);
      return source.elements[0].x +
        (coefficient*(Geometry.ELEMENT_WIDTH + Geometry.ELEMENT_DIST)*timeElapsed)/T;
    }

    function yFlight(stacks, source, target) {
      var s = source.size();
      var r = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var T = Physics.FLIGHT_TIME;
      var timeElapsed = game.time - game.motion.startTime;
      return source.elements[0].y +
        -0.5*g*(timeElapsed)**2 +
        (0.5*g*T - (h*s)/T + (h*r)/T)*timeElapsed +
        h*s;
    }

    if(this.state == State.IN_MOTION) {
      var flyingElement = this.motion.sourceStack.elements[
        this.motion.sourceStack.size() - 1];
      var new_x = xFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
      var new_y = yFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
      console.log(new_x);
      console.log(new_y);
      flyingElement.x = new_x;
      flyingElement.y = new_y;

    }
    else if(this.state == State.CANCELING_OUT) {

    }
  }

  Game.prototype.toBeCanceled = function() {
    return this.stacks[0].needsCanceling ||
    this.stacks[1].needsCanceling ||
    this.stacks[2].needsCanceling;
  }

  Game.prototype.draw = function() {
    var canvas = document.getElementById("gameplay");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
    this.drawStacks(ctx);
  }

  var game = new Game();
  game.setupPositions();
  game.draw();
  game.debug();

  var switchHandler = function(e) {
    var keys = [Key.LEFT_STACK_SELECT, Key.MID_STACK_SELECT, Key.RIGHT_STACK_SELECT];
    var keyPos = keys.indexOf(e.keyCode);
    if(keyPos >= 0) {
      game.currentStack = game.stacks[keyPos];
      return true;
    }
    return false;
  }

  var motionHandler = function(e) {
    var keys = [Key.POP_ONTO_LEFT, Key.POP_ONTO_MID, Key.POP_ONTO_RIGHT];
    var keyPos = keys.indexOf(e.keyCode);
    if(keyPos >= 0) {
      game.motion.sourceStack = game.currentStack;
      game.motion.targetStack = game.stacks[keyPos];
      game.beginMotion();
      return true;
      // game.popPush(game.motion.sourceStack, game.motion.targetStack);
    }
    return false;
  }

  $("body").keydown(function(e) {
    var result = switchHandler(e) || motionHandler(e);
    if(result) {
      game.update();
      game.draw();
    }
  });

  var gameLoop = function() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);

});
