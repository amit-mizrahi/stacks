$(function() {

  var ELEMENT_WIDTH = 50;
  var ELEMENT_HEIGHT = 50;

  var Color = {
      RED: 1,
      GREEN: 2,
      BLUE: 3
    }

  var Element = function(color) {
    this.color = color;
  }

  Element.prototype.draw = function(ctx, x, y) {
    if(this.color == Color.RED) {
      ctx.fillStyle = '#FF0000';
    }
    else if(this.color == Color.GREEN) {
      ctx.fillStyle = '#00FF00';
    }
    else if(this.color == Color.BLUE) {
      ctx.fillStyle = '#0000FF';
    }
    ctx.fillRect(x, 500 - y, ELEMENT_WIDTH, ELEMENT_HEIGHT);
  }

  var randomElement = function() {
    var r = Math.random();
    if(r < 0.33) {
      return new Element(Color.RED);
    }
    else if(0.33 <= r && r <= 0.66) {
      return new Element(Color.GREEN);
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
    this.left = null;
    this.right = null;
  }

  Stack.prototype.push = function(el) {
    // Pushes an item onto the stack
    this.elements.push(el);
  }

  Stack.prototype.pop = function() {
    // Pops an item from the stack and returns it
    return this.elements.pop();
  }

  Stack.prototype.randomlyFill = function() {
    // Fills the stack with a random number (2 < n < 10) of random elements.
    var numElements = Math.floor((Math.random() * 12) - 2);
    for(var i = 0; i < numElements; i++) {
      this.push(randomElement());
    }
  }

  Stack.prototype.enqueue = function(el) {
    // Only accessible to the game, not to the user. Adds an item to the bottom of the stack.
    var newElements = [];
    newElements.push(el);
    for(var i = 0; i < this.elements.length; i++) {
      newElements.push(this.elements[i]);
    }
    this.elements = newElements;
  }

  var GameState = function() {
    this.stack1 = new Stack();
    this.stack2 = new Stack();
    this.stack3 = new Stack();

    this.stack1.right = this.stack2;
    this.stack2.right = this.stack3;
    this.stack2.left = this.stack1;
    this.stack3.left = this.stack2;

    this.currentStack = this.stack1;

    this.stack1.randomlyFill();
    this.stack2.randomlyFill();
  }

  GameState.prototype.popPush = function(sourceStack, sinkStack) {
    if(sinkStack) {
      sinkStack.push(sourceStack.pop());
    }
  }

  GameState.prototype.debug = function() {
    console.log(this.stack1.elements);
    console.log(this.stack2.elements);
    console.log(this.stack3.elements);
  }

  GameState.prototype.drawStack = function(ctx, stack, xOffset) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(xOffset, 480, ELEMENT_WIDTH, 10);
    for(var i = 0; i < stack.elements.length; i++) {
      stack.elements[i].draw(ctx, xOffset, 70 + ELEMENT_HEIGHT*i);
    }
  }

  GameState.prototype.draw = function() {
    var canvas = document.getElementById("gameplay");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);

    // Left stack

    this.drawStack(ctx, this.stack1, 50);

    // Middle stack

    this.drawStack(ctx, this.stack2, 150);

    // Right stack

    this.drawStack(ctx, this.stack3, 250);
  }

  var state = new GameState();
  state.draw();
  state.debug();
  $("body").keydown(function(e) {
    if(e.keyCode == 65) {
      state.currentStack = state.stack1;
    }
    else if(e.keyCode == 83) {
      state.currentStack = state.stack2;
    }
    else if(e.keyCode == 68) {
      state.currentStack = state.stack3;
    }

    else if(e.keyCode == 74) {
      state.popPush(state.currentStack, state.currentStack.left);
    }
    else if(e.keyCode == 76) {
      state.popPush(state.currentStack, state.currentStack.right);
    }
    state.draw();
    state.debug();
  });
});
