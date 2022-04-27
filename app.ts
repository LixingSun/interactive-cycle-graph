import * as d3 from "d3";
import {
  cycleLabelFontSize,
  cycleSize,
  elementFontSize,
  elementSpace,
  graphSize,
  graphTitle,
  numSpirals,
  pointLabelFontSize,
  pointLabelSpace,
  pointSize,
  spiralEnd,
  spiralStart,
  titleFontSize,
  titleSpace,
} from "./config";
import source from "./data.json";
import { ICycle, ICycleData, IPoint, IPointData } from "./types";

const sourceData: (IPoint | ICycle)[] = source.data;

// Setup Graph
const graphSVG = d3
  .select("svg#graph")
  .attr("width", graphSize)
  .attr("height", graphSize)
  .append("g")
  .attr("transform", "translate(" + graphSize / 2 + "," + graphSize / 2 + ")");

const informationSVG = d3.select("svg#info");

const activeLabel = informationSVG
  .append("text")
  .attr("x", 0)
  .attr("y", 0)
  .text(graphTitle)
  .style("font-size", titleFontSize)
  .style("font-weight", "bold")
  .style("alignment-baseline", "before-edge");

// Draw Spiral
const theta = (r: number) => {
  return numSpirals * Math.PI * r;
};

const r = graphSize / 2 - 40;

const radius = d3.scaleLinear().domain([spiralStart, spiralEnd]).range([40, r]);

const SpiralPoints: [number, number][] = d3
  .range(spiralStart, spiralEnd, (spiralEnd - spiralStart) / 1000)
  .map((d) => [theta(d), radius(d)]);

const spiral = d3.lineRadial().curve(d3.curveCardinal);

const path = graphSVG
  .append("path")
  .attr("id", "spiral")
  .attr("d", spiral(SpiralPoints))
  .style("fill", "none")
  .style("stroke", "#999")
  .style("stroke-dasharray", 10);

// Draw Points and Cycles
const points: IPointData[] = [];
const cycles: ICycleData[] = [];

const pathInterval = path.node()?.getTotalLength()! / (sourceData.length - 1);

sourceData.forEach((item, index) => {
  if (item.type == "point" && "elements" in item) {
    points.push({
      type: item.type,
      label: item.label,
      elements: item.elements,
      position: path.node()?.getPointAtLength(index * pathInterval)!,
    });
  } else if (item.type === "cycle" && "points" in item) {
    cycles.push({
      type: item.type,
      label: item.label,
      points: item.points,
      position: path.node()?.getPointAtLength(index * pathInterval)!,
    });
  }
});

// Points
const pointElements = graphSVG
  .selectAll("g.point")
  .data(points)
  .join("g")
  .attr("class", "point")
  .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`)
  .style("cursor", "pointer")
  .on("click", (_, d) => {
    activeLabel.text(d.label);
    updateElements(d.elements);
  });

pointElements
  .append("circle")
  .attr("r", pointSize)
  .style("fill", "#ffffff")
  .style(
    "stroke",
    (d, i) => d3.quantize(d3.interpolateRainbow, points.length + 1)[i]
  )
  .style("stroke-width", "4");

pointElements
  .append("text")
  .attr("y", pointSize + pointLabelSpace)
  .attr("font-size", pointLabelFontSize)
  .attr("text-anchor", "middle")
  .text((d) => d.label);

// Cycle
const cycleElements = graphSVG
  .selectAll("g.cycle")
  .data(cycles)
  .join("g")
  .attr("class", "cycle")
  .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`);

cycleElements
  .append("circle")
  .attr("r", cycleSize)
  .style("fill", "#ffffff")
  .style("stroke", "#999")
  .style("stroke-width", "2");

cycleElements
  .append("text")
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "central")
  .attr("font-size", cycleLabelFontSize)
  .text((d) => d.label);

const subPointElements = cycleElements
  .selectAll("g.sub-point")
  .data((cycleData) =>
    d3
      .range(0, 2 * Math.PI, (2 * Math.PI) / cycleData.points.length)
      .map((d, i) => ({
        position: d,
        label: cycleData.points[i].label,
        elements: cycleData.points[i].elements,
      }))
  )
  .join("g")
  .attr("class", "sub-point")
  .attr(
    "transform",
    (d) =>
      `translate(${cycleSize * Math.sin(d.position)}, ${
        -cycleSize * Math.cos(d.position)
      })`
  )
  .style("cursor", "pointer")
  .on("click", (_, d) => {
    activeLabel.text(d.label);
    updateElements(d.elements);
  });

subPointElements
  .append("circle")
  .attr("r", pointSize)
  .style("fill", "#ffffff")
  .style(
    "stroke",
    (d, i, arr) => d3.quantize(d3.interpolateRainbow, arr.length + 1)[i]
  )
  .style("stroke-width", "4");

subPointElements
  .append("text")
  .attr("y", pointSize + pointLabelSpace)
  .attr("font-size", pointLabelFontSize)
  .attr("text-anchor", "middle")
  .style("alignment-baseline", "central")
  .text((d) => d.label);

const updateElements = (elements: string[]) => {
  informationSVG
    .attr(
      "height",
      (elementFontSize + elementSpace) * elements.length +
        titleFontSize +
        titleSpace
    )
    .selectAll("text.element")
    .data(elements)
    .join("text")
    .text((text) => text)
    .attr("class", "element")
    .attr(
      "y",
      (_, index) =>
        index * (elementFontSize + elementSpace) + titleFontSize + titleSpace
    )
    .style("font-size", elementFontSize)
    .style("alignment-baseline", "hanging");
};
