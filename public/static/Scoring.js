var determineScore = function(block) {
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
