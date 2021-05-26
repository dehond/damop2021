let animation_state = 0;
let svgc = d3.select("#heisenberg-animation-container");

let ellipse = svgc.append("ellipse")
    .attr("cx", 65)
    .attr("cy", 53)
    .attr("rx", 50)
    .attr("ry", 25)
    .attr("fill", "none")
    .attr("stroke", "#ededed")
    .attr("stroke-dasharray", 4)
    .attr("opacity", 0);

let ellipse2 = svgc.append("ellipse")
    .attr("cx", 130)
    .attr("cy", 53)
    .attr("rx", 50)
    .attr("ry", 25)
    .attr("fill", "none")
    .attr("stroke", "#ededed")
    .attr("stroke-dasharray", 4)
    .attr("opacity", 0);

let annot1 = svgc.append("g")
    .attr("transform", "translate(70, 70) scale(0.3)")
    .append(() => MathJax.tex2svg(String.raw`J = \frac{4t^2}{U_{\!\bullet\circ}}`).querySelector("svg"))
    .attr("opacity", 0)

let annot2 = svgc.append("g")
    .attr("transform", "translate(78, 83) scale(0.3)")
    .append(() => MathJax.tex2svg(String.raw`D = U_{\!\bullet\bullet/\circ\circ} - U_{\!\bullet\circ}`).querySelector("svg"))
    .attr("opacity", 0)

svgc.on("click", animate_atoms);

function animate_atoms() {
    let duration = 1000;
    let x1 = 32.37;
    let x2 = 97.5;
    let y1 = 60.04;
    let y2 = 47.72;
    if (animation_state == 0) {
      ellipse.transition().delay(duration).duration(duration).attr("opacity", 1);
      annot1.transition().delay(duration).duration(duration).attr("opacity", 1);
      d3.select("#ball4").transition().duration(duration).attr("cx", x1).attr("cy", 2*y2 - y1);
      d3.select("#ball1").transition().duration(duration).delay(duration).attr("cx", x2).attr("cy", y2);
      d3.select("#ball2").transition().delay(duration).duration(duration).attr("cy", y1);
      d3.select("#ball4").transition().delay(duration).duration(duration).attr("cy", y2)
        .on("end", () => (animation_state = 1));
    }
    else if (animation_state == 1){
      ellipse.transition().duration(duration).attr("opacity", 0);
      annot1.transition().duration(duration).attr("opacity", 0);
      ellipse2.transition().delay(duration).duration(duration).attr("opacity", 1);
      annot2.transition().delay(duration).duration(duration).attr("opacity", 1)
        .on("end", () => (animation_state = 2));
    }
    else if (animation_state == 2) {
      ellipse2.transition().duration(duration).attr("opacity", 0);
      annot2.transition().duration(duration).attr("opacity", 0);
      d3.select("#ball1").transition().duration(duration).attr("cx", x1).attr("cy", 2*y2 - y1);
      d3.select("#ball4").transition().duration(duration).delay(duration).attr("cx", x2).attr("cy", y2);
      d3.select("#ball1").transition().duration(duration).delay(duration).attr("cx", x1).attr("cy", y1)
      d3.select("#ball2").transition().duration(duration).delay(duration).attr("cx", x1).attr("cy", y2)
        .on("end", function() {
        animation_state = 0;
      } )
    }
  }
