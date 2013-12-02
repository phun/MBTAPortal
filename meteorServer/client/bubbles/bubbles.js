blobsElm = {};

InitBubbles = function() {
  var width = document.body.clientWidth,
    height = document.body.clientHeight;

  var canvas = d3.select(".bubbles-game").append("svg:svg")
    .attr("width", width)
    .attr("height", height);

  function drawBlob(id, blob) {
    var color = (blob.val <= 0) ? "rgba(255,0,0, 0.75)" : "rgba(0,0,0, 0.75)";
    blobsElm[id] = canvas.append("svg:circle")
      .attr("r", blob.r)
      .attr("fill", color)
      .attr("cx", blob.x)
      .attr("cy", blob.y)
      .attr("class", "detectable")
      .attr("data-id", id);
  }

  function init() {
    //Meteor.setInterval(function() { draw() }, 25);
    var blobs = Blobs.find();
    var handle = blobs.observeChanges({
      added: function(id, blob) {
        drawBlob(id, blob);
      },
      changed: function (id, fields) {
        if (blobsElm[id] && (fields.x || fields.y)) {
          blobsElm[id].attr("cx", fields.x)
            .attr("cy", fields.y);
        } else {
          var missingBlob = Blobs.find({_id: id});
          if (missingBlob) {
            drawBlob(id, missingBlob);
          }
        }
      },
      removed: function (id) {
        if (blobsElm[id]) {
          blobsElm[id].remove();
          delete blobsElm[id];
        }
      }
    });
  }

  function draw() {
    d3.selectAll(".detectable").remove();
    blobsElm = {};
    var blobs = Blobs.find();
    blobs.forEach(function (blob) {
      var color = (blob.val <= 0) ? "rgba(255,0,0, 0.75)" : "rgba(0,0,0, 0.75)";
      blobsElm[blob._id] = canvas.append("svg:circle")
        .attr("r", blob.r)
        .attr("fill", color)
        .attr("cx", blob.x)
        .attr("cy", blob.y)
        .attr("class", "detectable")
        .attr("data-id", blob._id);
    });
  }

  function popBubbles(cx, cy, r) {
    var nearby = [],
      c1 = {cx: cx, cy: cy, r: r};
    
    canvas.selectAll(".detectable").each(function () {
        switch (this.nodeName) {
            case "circle":
                var c2 = {cx: +this.getAttribute("cx"),
                          cy: +this.getAttribute("cy"),
                          r: +this.getAttribute("r")};
                if (circleOverlapQ(c1, c2)) {
                  Blobs.remove({_id: this.getAttribute("data-id")});
                  Players.update({_id: Session.get('player')}, {$inc: {points: 1}});
                  this.remove();
                  delete blobsElm[this.getAttribute("data-id")];
                }
                break;

            default:
                console.log("shape not supported");
        }            
    }); // each
  }

  function circleOverlapQ (c1, c2) {
      var distance = Math.sqrt(
          Math.pow(c2.cx - c1.cx, 2) + 
          Math.pow(c2.cy - c1.cy, 2)
      );
      if (distance < (c1.r + c2.r)) {
          return true;
      } else {
          return false;
      }
  }

  Leap.loop({enableGestures: true}, function(frame) {
    d3.selectAll(".cursor").remove();

    if (frame.pointables.length < 1) return;

    frame.pointables.forEach(function(pointable,i) {
      // only do 1 finger
      if (i > 0) return;

      // interaction box
      var pos = [
        width/2 + 6*pointable.tipPosition[0],
        height - 4*pointable.tipPosition[1] + 150,
        pointable.tipPosition[2]
      ];

      // distance to touch
      var sizeDifference = 100-Math.abs(pos[2]);
      if (sizeDifference < 0) sizeDifference = 0;

      var mv = canvas.append("svg:circle")
        .attr("r", 15)
        .attr("stroke", "black")
        .attr("fill", "rgba(255,255,255,0.75)")
        .attr("stroke-width", 1)
        .attr("class", "cursor");

      mv.attr("cx", pos[0] )
        .attr("cy", pos[1] );

      popBubbles(pos[0], pos[1], 15);
    });
  });

  init();
}