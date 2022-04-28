import * as d3 from "d3";
import {
  numSpirals,
  minGraphSize,
  spiralStart,
  spiralEnd,
  graphTitle,
  titleFontSize,
  spiralStrokeColor,
  pointBgColor,
  pointLabelFontSize,
  pointLabelSpace,
  pointSize,
  cycleBgColor,
  cycleLabelFontSize,
  cycleSize,
  cycleStrokeColor,
} from "./config";
import { IPoint, ICycle, IPointData, ICycleData } from "./types";

let graphSize: number;

export const buildLayout = () => {
  graphSize = Number(
    d3.max([
      minGraphSize,
      Number(d3.min([window.innerHeight, window.innerWidth])) * 0.9,
    ])
  );

  const graphSVG = d3
    .select("svg#graph")
    .attr("width", graphSize)
    .attr("height", graphSize)
    .append("g")
    .attr(
      "transform",
      "translate(" + graphSize / 2 + "," + graphSize / 2 + ")"
    );

  const informationSVG = d3.select("svg#info");

  const activeLabel = informationSVG
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .text(graphTitle)
    .style("font-size", titleFontSize)
    .style("font-weight", "bold")
    .style("alignment-baseline", "before-edge");

  return {
    graphSVG,
    informationSVG,
    activeLabel,
  };
};

export const buildEntityData = (
  sourceData: (IPoint | ICycle)[],
  path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>
) => {
  const points: IPointData[] = [];
  const cycles: ICycleData[] = [];

  const pathInterval = path.node()?.getTotalLength()! / (sourceData.length - 1);

  sourceData.forEach((item, index) => {
    if ("notes" in item) {
      points.push({
        id: item.id,
        label: item.label,
        notes: item.notes,
        position: path.node()?.getPointAtLength(index * pathInterval)!,
      });
    } else if ("points" in item) {
      cycles.push({
        id: item.id,
        label: item.label,
        points: item.points,
        position: path.node()?.getPointAtLength(index * pathInterval)!,
      });
    }
  });

  return {
    points,
    cycles,
  };
};

export const drawSpiral = (
  graph: d3.Selection<SVGGElement, unknown, HTMLElement, any>
) => {
  const theta = (r: number) => {
    return numSpirals * Math.PI * r;
  };

  const r = graphSize / 2 - 40;

  const radius = d3
    .scaleLinear()
    .domain([spiralStart, spiralEnd])
    .range([40, r]);

  const SpiralPoints: [number, number][] = d3
    .range(spiralStart, spiralEnd, (spiralEnd - spiralStart) / 1000)
    .map((d) => [theta(d), radius(d)]);

  const spiral = d3.lineRadial().curve(d3.curveCardinal);

  return {
    path: graph
      .append("path")
      .attr("id", "spiral")
      .attr("d", spiral(SpiralPoints))
      .style("fill", "none")
      .style("stroke", spiralStrokeColor)
      .style("stroke-dasharray", 10),
  };
};

export const buildPoints = (
  graphSVG: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  points: IPointData[],
  onClick: (_: any, d: IPointData) => void
) => {
  const pointNotes = graphSVG
    .selectAll("g.point")
    .data(points)
    .join("g")
    .attr("id", (d) => "point-" + d.id)
    .attr("class", "point")
    .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`)
    .style("cursor", "pointer")
    .on("click", onClick);

  pointNotes
    .append("circle")
    .attr("r", pointSize)
    .style("fill", pointBgColor)
    .style(
      "stroke",
      (d, i) => d3.quantize(d3.interpolateRainbow, points.length + 1)[i]
    )
    .style("stroke-width", "4");

  pointNotes
    .append("text")
    .attr("y", pointSize + pointLabelSpace)
    .attr("font-size", pointLabelFontSize)
    .attr("text-anchor", "middle")
    .text((d) => d.label);
};

export const buildCycles = (
  graphSVG: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  cycles: ICycleData[],
  onClick: (_: any, d: IPointData) => void
) => {
  const cycleNotes = graphSVG
    .selectAll("g.cycle")
    .data(cycles)
    .join("g")
    .attr("class", "cycle")
    .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`);

  cycleNotes
    .append("circle")
    .attr("r", cycleSize)
    .style("fill", cycleBgColor)
    .style("stroke", cycleStrokeColor)
    .style("stroke-width", "2");

  cycleNotes
    .append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("font-size", cycleLabelFontSize)
    .text((d) => d.label);

  const subPointNotes = cycleNotes
    .selectAll("g.sub-point")
    .data((cycleData) =>
      d3.range(0, 2 * Math.PI, (2 * Math.PI) / cycleData.points.length).map(
        (d, i) =>
          ({
            position: new DOMPoint(
              cycleSize * Math.sin(d),
              -cycleSize * Math.cos(d)
            ),
            id: cycleData.points[i].id,
            label: cycleData.points[i].label,
            notes: cycleData.points[i].notes,
          } as IPointData)
      )
    )
    .join("g")
    .attr("id", (d) => "point-" + d.id)
    .attr("class", "sub-point")
    .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`)
    .style("cursor", "pointer")
    .on("click", onClick);

  subPointNotes
    .append("circle")
    .attr("r", pointSize)
    .style("fill", pointBgColor)
    .style(
      "stroke",
      (d, i, arr) => d3.quantize(d3.interpolateRainbow, arr.length + 1)[i]
    )
    .style("stroke-width", "4");

  subPointNotes
    .append("text")
    .attr("y", pointSize + pointLabelSpace)
    .attr("font-size", pointLabelFontSize)
    .attr("text-anchor", "middle")
    .style("alignment-baseline", "central")
    .text((d) => d.label);
};
