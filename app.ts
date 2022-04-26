import * as d3 from "d3";
import source from "./data.json";

const list = source.data;

const title = "Title";
const graphSize = 800;
const circleSize = 60;
const elementFontSize = 32;
const elementSpace = 16;

const graphData = d3
  .range(0, 2 * Math.PI, (2 * Math.PI) / list.length)
  .map((d, i) => ({
    position: d,
    label: list[i].label,
    elements: list[i].elements,
  }));

// Graph
const graphSVG = d3
  .select("body")
  .select("svg#graph")
  .attr("width", graphSize)
  .attr("height", graphSize);

const itemElement = graphSVG
  .selectAll("g")
  .data(graphData)
  .enter()
  .append("g")
  .attr(
    "transform",
    (d) =>
      `translate(${
        graphSize * 0.5 + graphSize * 0.5 * 0.8 * Math.sin(d.position)
      }, ${graphSize * 0.5 - graphSize * 0.5 * 0.8 * Math.cos(d.position)})`
  )
  .style("cursor", "pointer")
  .on("click", (_, d) => {
    d3.select("#title").text(d.label);
    updateElements(d.elements);
  });

// List Items
itemElement
  .append("circle")
  .attr("r", circleSize)
  .style("fill", "#ffffff")
  .style(
    "stroke",
    (d, i) => d3.quantize(d3.interpolateRainbow, graphData.length + 1)[i]
  )
  .style("stroke-width", "4");

itemElement
  .append("text")
  .attr("text-anchor", "middle")
  .style("alignment-baseline", "central")
  .text((d) => d.label);

// Bg Circle
const bgElement = graphSVG.append("g").lower();

bgElement
  .append("circle")
  .attr("cx", graphSize * 0.5)
  .attr("cy", graphSize * 0.5)
  .attr("r", graphSize * 0.5 - circleSize - graphSize * 0.0275)
  .style("stroke", "#000000")
  .style("stroke-width", "4")
  .style("stroke-dasharray", 10)
  .style("fill", "#ffffff");

bgElement
  .append("text")
  .attr("id", "title")
  .attr("text-anchor", "middle")
  .attr("dx", graphSize * 0.5)
  .attr("dy", graphSize * 0.5)
  .text(title)
  .style("font-size", 64);

// circle
//   .transition()
//   .duration(5000)
//   .attr("cx", (d, i, arr) => 300 - Number(d3.select(arr[i]).attr("cx")))
//   .attr("cy", (d, i, arr) => 300 - Number(d3.select(arr[i]).attr("cy")))
//   .end();

const elementsSVG = d3.select("body").select("svg#elements");
//   .attr("width", graphSize)
//   .attr("height", graphSize);

const updateElements = (elements: string[]) => {
  elementsSVG
    .attr("height", (elementFontSize + elementSpace) * elements.length)
    .selectAll("text")
    .data(elements)
    .join("text")
    .text((text) => text)
    .attr("y", (_, index) => index * (elementFontSize + elementSpace))
    .style("font-size", elementFontSize)
    .style("alignment-baseline", "hanging");
};
