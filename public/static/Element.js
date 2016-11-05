var Element = function(color) {
  this.color = color;
  this.x = null;
  this.y = null;
  this.canceling = false;
}

Element.prototype.draw = function(ctx) {
  if(this.canceling) {
    ctx.fillStyle = CanvasColor.CANCEL_COLOR;
  }
  else {
    switch(this.color) {
      case Color.RED:
        ctx.fillStyle = CanvasColor.RED;
        break;
      case Color.YELLOW:
        ctx.fillStyle = CanvasColor.YELLOW;
        break;
      case Color.BLUE:
        ctx.fillStyle = CanvasColor.BLUE;
        break;
      case Color.GREEN:
        ctx.fillStyle = CanvasColor.GREEN;
        break;
      case Color.PURPLE:
        ctx.fillStyle = CanvasColor.PURPLE;
        break;
      case Color.ORANGE:
        ctx.fillStyle = CanvasColor.ORANGE;
        break;
      default:
        break;
    }
  }
  fillRect(ctx, this.x, this.y, Geometry.ELEMENT_WIDTH, Geometry.ELEMENT_HEIGHT);
}
