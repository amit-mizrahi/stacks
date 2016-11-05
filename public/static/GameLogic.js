var newGame = function() {

  window.game = new Game();

  var canvas = document.getElementById("gameplay");
  game.ctx = canvas.getContext("2d");

  game.setupPositions();
  game.draw();
  Time.MIN_TIME = 50;
  updateScoreText(0);
  $("#title").show();
  $("#game-over-heading").hide();
  $("#game-over-text").hide();

  var makeNewGame = function(e) {
    if(e.keyCode == Key.ENTER) {
      newGame();
    }
  }

  var keyHandler = function(e) {
    var result = switchHandler(e);
    if(game.state == State.AT_REST) {
      result = result || motionKeyHandler(e);
    }
    return result;
  }

  $("body").unbind("keydown", makeNewGame);
  $("body").keydown(keyHandler);

  var gameLoop = function() {
    if(!game.lost) {
      game.update();
      game.draw();
      requestAnimationFrame(gameLoop);
    }
    else {
      $("body").unbind("keydown", keyHandler);
      $("body").keydown(makeNewGame);
    }
  }

  var switchHandler = function(e) {
    var currentIndex = game.stacks.indexOf(game.currentStack);
    if(e.keyCode == Key.LEFT_SELECT) {
      if(currentIndex > 0) {
        game.currentStack = game.stacks[currentIndex - 1];
        return true;
      }
      return false;
    }
    else if(e.keyCode == Key.RIGHT_SELECT) {
      if(currentIndex < 2) {
        game.currentStack = game.stacks[currentIndex + 1];
        return true;
      }
      return false;
    }
    return false;
  }

  var motionKeyHandler = function(e) {
    var currentIndex = game.stacks.indexOf(game.currentStack);
    targetStack = null;
    if(e.keyCode == Key.LEFT_POP) {
      if(currentIndex > 0) {
        targetStack = game.stacks[currentIndex - 1];
      }
    }
    else if(e.keyCode == Key.RIGHT_POP) {
      if(currentIndex < 2) {
        targetStack = game.stacks[currentIndex + 1];
      }
    }
    if(targetStack) {
      game.motion.sourceStack = game.currentStack;
      game.motion.targetStack = targetStack;
      if(game.motion.sourceStack.peek()) {
        game.beginMotion();
        return true;
      }
      return false;
    }
    return false;
  }

  requestAnimationFrame(gameLoop);
}

$(function() {
  adjustWindow(); // from Config
  newGame();
})
