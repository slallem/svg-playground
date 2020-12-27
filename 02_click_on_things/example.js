console.clear();

var svg = document.querySelector("#svg");
var reset = document.querySelector("#reset");
var pivot = document.querySelector("#pivot");
var proxy = document.createElement("div");
var viewport = document.querySelector("#viewport");

var point = svg.createSVGPoint();
var startClient = svg.createSVGPoint();
var startGlobal = svg.createSVGPoint();

var viewBox = svg.viewBox.baseVal;

var cachedViewBox = {
  x: viewBox.x,
  y: viewBox.y,
  width: viewBox.width,
  height: viewBox.height
};

var zoom = {
  animation: new TimelineLite(),
  scaleFactor: 1.6,
  duration: 0.4,
  ease: Power2.easeOut,
};

TweenLite.set(pivot, { scale: 0 });

var resetAnimation = new TimelineLite();
var pivotAnimation = TweenLite.to(pivot, 0.1, {
  alpha: 1,
  scale: 1,
  paused: true,
});

var pannable = Draggable.create(proxy, {
  throwResistance: 3000,
  trigger: svg,
  throwProps: true,
  onPress: selectDraggable,
  onDrag: updateViewBox,
  onThrowUpdate: updateViewBox,
  allowEventDefault: true,
});

reset.addEventListener("click", resetViewport);
window.addEventListener("wheel", onWheel, { passive: false });
window.addEventListener("resize", function() {
  pivotAnimation.reverse();
});

window.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
});

//  document.querySelector("#BTNX2").addEventListener("click", labelClick, { passive: false });
//document.getElementById("BTNX2").addEventListener("click", labelClick, false);

//document.querySelectorAll(".label").forEach(function(currentValue,item -> item.addEventListener("click", labelClick, { passive: false }));
$(".label").click(labelClick);


function labelClick(event) {
    var button_id = event.target.id;
    console.log("clicked on " + button_id);
    row_id = button_id.replace("BTN","COL");
    console.log("rowid is " + row_id);
    $("#"+button_id).toggleClass("active");
    $("#"+row_id).toggleClass("active");
}

// --------------------------------- On Wheel (zoom)
function onWheel(event) {

  event.preventDefault();

  pivotAnimation.reverse();

  var normalized;
  var delta = event.wheelDelta;

  if (delta) {
    normalized = (delta % 120) == 0 ? delta / 120 : delta / 12;
  } else {
    delta = event.deltaY || event.detail || 0;
    normalized = -(delta % 3 ? delta * 10 : delta / 3);
  }

  var scaleDelta = normalized > 0 ? 1 / zoom.scaleFactor : zoom.scaleFactor;

  point.x = event.clientX;
  point.y = event.clientY;

  var startPoint = point.matrixTransform(svg.getScreenCTM().inverse());

  var fromVars = {
    ease: zoom.ease,
    x: viewBox.x,
    y: viewBox.y,
    width: viewBox.width,
    height: viewBox.height,
  };

  viewBox.x -= (startPoint.x - viewBox.x) * (scaleDelta - 1);
  viewBox.y -= (startPoint.y - viewBox.y) * (scaleDelta - 1);
  viewBox.width *= scaleDelta;
  viewBox.height *= scaleDelta;

  zoom.animation = TweenLite.from(viewBox, zoom.duration, fromVars);
}

// --------------------------------- Start Drag
function selectDraggable(event) {

  if (resetAnimation.isActive()) {
    resetAnimation.kill();
  }

  startClient.x = this.pointerX;
  startClient.y = this.pointerY;
  startGlobal = startClient.matrixTransform(svg.getScreenCTM().inverse());
}

// --------------------------------- Update Viewbox
function updateViewBox() {

  if (zoom.animation.isActive()) {
    return;
  }

  point.x = this.pointerX;
  point.y = this.pointerY;

  var moveGlobal = point.matrixTransform(svg.getScreenCTM().inverse());

  viewBox.x -= (moveGlobal.x - startGlobal.x);
  viewBox.y -= (moveGlobal.y - startGlobal.y);
}

// --------------------------------- Reset viewport
function resetViewport() {

  var duration = 0.8;
  var ease = Power3.easeOut;

  pivotAnimation.reverse();

  if (pannable.tween) {
    pannable.tween.kill();
  }

  resetAnimation.clear()
    .to(viewBox, duration, {
      x: cachedViewBox.x,
      y: cachedViewBox.y,
      width: cachedViewBox.width,
      height: cachedViewBox.height,
      ease: ease
    }, 0)
    .to(viewport, duration, {
      attr: { transform: "matrix(1,0,0,1,0,0)" },
      // rotation: "0_short",
      smoothOrigin: false,
      svgOrigin: "0 0",
      ease: ease
    }, 0)
}
