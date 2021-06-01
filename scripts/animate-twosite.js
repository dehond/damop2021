let height = 700;
let width = 960;
let animationstate = 0;
let hposSphere = width / 2 * 0.6;
let projangle = [5, -20, 0];
let oscAmp = 0.0;
let oscOffs = 0.5; //0.76
let precesLat = 50;

let svg = d3.select("#two-site-container")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .style("background-color", "#111111");
  //.style("background-color", "#1d2c4a");

let yscalePlot = drawAxes(svg);
let plotpts = svg.select("#plotpoints").selectAll("circle");

let points = [...Array(20).keys()].map(k => k).map(k => [k, precesLat])

// First two projections for graticules
let projection = generateProjection(projangle);
let projection2 = generateProjection(projangle)
  .clipAngle(0);
// Rotatable projections for drawing
let projection3 = generateProjection(projangle)
  .clipAngle(0);
let projection4 = generateProjection(projangle);

let path = d3.geoPath().projection(projection);
let path2 = d3.geoPath().projection(projection2);
let path3 = d3.geoPath().projection(projection3)
  .pointRadius(5);
let path4 = d3.geoPath().projection(projection4);

// Draw fore- and background graticules
drawGraticule(svg, path, 1);
drawGraticule(svg, path2, 0.25);

let npolecoords = projection2([0, 90]);
let mjx = MathJax.tex2svg(String.raw`|\circ\circ\rangle`);
svg.append("g")
  .attr("transform", `translate(${npolecoords[0] - 20}, ${npolecoords[1] - 50}) scale(0.6)`)
  .append(() => mjx.querySelector("svg"))
  .attr("color", "#ebebeb")
let spolecoords = projection2([0, -90]);

mjx = MathJax.tex2svg(String.raw`\left( |\!\Uparrow\Downarrow\rangle + |\!\Downarrow\Uparrow\rangle \right)/\sqrt{2}`);
svg.append("g")
  .attr("transform", `translate(${spolecoords[0] - 110}, ${spolecoords[1] + 20}) scale(0.6)`)
  .append(() => mjx.querySelector("svg"))
  .attr("color", "#ededed")

let pt = svg.append("g")
  .attr("id", "loc-points")
  .selectAll("path")
  .data(points)
  .enter()
  .append("path")
  .attr("d", d => path3(convertPointToGeoJSON(d)))
  .attr("stroke", "#ebebeb")
  .attr("fill", "#ebebeb")
  .attr("opacity", (d, i) => 1 - 0.8 * (d[0] / 20) ** (1 / 4))
  .attr("stroke-width", 0.1)

pt.transition()
  .duration(5000)
  .ease(d3.easeLinear)
  .on("start", function repeat(i) {
    d3.active(this)
      .attrTween("opacity", (d, i) => {
        return function (t) {
          return (pointposWithClip(t)(d) != null) ? 0.8 * (1 - (d[0] / 20) ** (1 / 4)) : (1 - (d[0] / 20) ** (1 / 4)) / 3
        }
      })
      .attrTween("d", d => {
        return function (t) {
          plotpts.attr("cy", function (d) {
            // Add oscillation on top of signal to create suggestion of movement
            return 5 * (d - 0.5) * Math.sin(30 * Math.PI * t + 50 * d) + yscalePlot(oscOffs + oscAmp * (Math.sin(Math.PI * t + 5 * (d - 0.5)) ** 2 - 0.5))
          }
          );
          return pointposNoClip(t)(d)
        }
      })
      .transition()
      .on("start", repeat)
  }
  )

let pole = {
  type: "FeatureCollection",
  features: [
    {
      type: "LineString",
      coordinates: [...Array(91).keys()].map(d => [4 * d, 87])
    },
    {
      type: "Point",
      coordinates: [0, 90]
    }
  ]
};

svg.append("g")
  .attr("id", "n-pole")
  .selectAll("path")
  .data(pole.features)
  .enter()
  .append("path")
  .attr("d", path4)
  .attr("fill", d => (d.type == "LineString" ? "none" : "#ebebeb"))
  .attr("stroke", "#ebebeb")
  .attr("stroke-width", 2)


svg.on('click', animate)

function animate() {
  d3.select("#n-pole")
    .selectAll("path")
    .transition()
    .duration(6000)
    .attrTween("d", function (d) {
      if (!animationstate) {
        return function (t) {
          projection3.rotate([projangle[0], projangle[1] - 60 * t, projangle[2]])
          projection4.rotate([projangle[0], projangle[1] - 60 * t, projangle[2]])
          oscAmp = 0.2 * t;
          oscOffs = 0.5 - 0.1 * t;
          precesLat = 50 + 20 * t;
          return path4(d)
        }
      }
      else {
        return function (t) {
          projection3.rotate([projangle[0], projangle[1] - 60 + 60 * t, projangle[2]])
          projection4.rotate([projangle[0], projangle[1] - 60 + 60 * t, projangle[2]])
          oscAmp = 0.2 * (1 - t);
          oscOffs = 0.4 + 0.1 * t;
          precesLat = 70 - 20 * t;
          return path4(d)
        }
      }
    })
    .on("end", d => ((d.type == "Point") && (animationstate = !animationstate)));
  // Only flip the animation state after one of the components has finished moving
}

function pointposNoClip(t) {
  return function (d) {
    return path3(convertPointToGeoJSON([d[0] - 360 * t, precesLat]))
  }
}

function pointposWithClip(t) {
  return function (d) {
    return path4(convertPointToGeoJSON([d[0] - 360 * t, precesLat]))
  }
}

function generateProjection(projangle) {
  let projection = d3.geoOrthographic().rotate(projangle)
    .translate([hposSphere, height / 2]);
  return projection.scale(width / 960 * projection.scale());
}

function drawGraticule(svg, pathGenerator, opacity) {
  let graticule = svg.append("path")
    .attr("d", pathGenerator(d3.geoGraticule().step([18, 18])()))
    .attr("stroke", "#d6d6d6")
    .attr("stroke-width", 0.5)
    .attr("opacity", opacity)
    .attr("fill", "none");
}

function drawAxes(svg) {
  let svgwidth = svg.attr("width");
  let svgheight = svg.attr("height");
  let padding = { left: 40, top: 10, right: 10, bottom: 10 };
  let axwidth = svgwidth * 0.4;
  let axheight = 300;

  let xscale = d3.scaleLinear()
    .domain([0, 1])
    .range([parseInt(svgwidth - axwidth + padding.left), svgwidth - padding.right]);
  let yscale = d3.scaleLinear()
    .domain([0, 1])
    .range([svgheight / 2 + axheight / 2 - padding.bottom, svgheight / 2 - axheight / 2 + padding.bottom]);

  let plotpoints = [...Array(100).keys()].map(d => 0. + 0.5 / 100 * d);

  svg.append("g")
    .attr("id", "x-axis")
    .call(d3.axisBottom(xscale).ticks(0).tickSize(0))
    .attr("color", "#ededed")
    .attr("transform", `translate(0, ${svgheight * 0.5 + axheight / 2 - padding.bottom})`)

  svg.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yscale).ticks(2))
    .attr("color", "#ededed")
    .attr("transform", `translate(${svgwidth - axwidth + padding.left}, 0)`)
    .selectChildren()
    .attr("font-size", 16)

  svg.append("g")
    .call(d3.axisRight(yscale).ticks(0).tickSize(0))
    .attr("transform", `translate(${svgwidth - padding.right}, 0)`)

  svg.append("g")
    .call(d3.axisTop(xscale).ticks(0).tickSize(0))
    .attr("transform", `translate(0, ${svgheight * 0.5 - axheight / 2 + padding.top})`)

  svg.append("g")
    .attr("id", "plotpoints")
    .selectAll("circle")
    .data(plotpoints)
    .enter()
    .append("circle")
    .attr("cx", d => xscale(d))
    .attr("cy", d => yscale(0.5))
    .attr("r", 4)
    .attr("fill", "#ededed")
    .attr("opacity", (d, i) => (i / plotpoints.length) ** 5)

  svg.append("text")
    .attr("x", svgwidth - axwidth / 2)
    .attr("y", svgheight * 0.5 + axheight / 2)
    .text("Time")
    .attr("fill", "#ededed")
    .attr("dominant-baseline", "hanging")
    .attr("text-anchor", "middle")
    .attr("font-size", "20")
    .attr("font-family", "sans-serif")

  svg.append("g")
    .attr("transform", `translate( ${svgwidth - axwidth - 35}, ${svgheight / 2 + 25} ) scale(0.6) rotate(-90)`)
    .append(() => MathJax.tex2svg(String.raw`\langle \hat{A} \rangle`).querySelector("svg"))
    .attr("color", "#ededed")
//    .append(() => MathJax.tex2svg(String.raw`\langle\circ\!\circ\!|\psi\rangle`).querySelector("svg"))


  return yscale
};

function convertPointToGeoJSON(point) {
  return { type: "Point", coordinates: [point[0], point[1]] }
}