import * as d3 from "d3";
import {
  cycleBgColor,
  elementFontSize,
  elementSpace,
  titleFontSize,
  titleSpace,
} from "./config";

import { data as sourceData } from "./data-import";
import {
  buildCycles,
  buildEntityData,
  buildLayout,
  buildPoints,
  drawSpiral,
} from "./graph-setup";

const { graphSVG, informationSVG, activeLabel } = buildLayout();

const { path } = drawSpiral(graphSVG);

const { points, cycles } = buildEntityData(sourceData, path);
let activeEntityId: number;

const activatePoint = (id: number) => {
  d3.select(`#point-${activeEntityId} circle`)
    .transition()
    .style("fill", cycleBgColor);

  const pointCircle = d3.select(`#point-${id} circle`);
  const newColor = pointCircle.style("stroke");
  pointCircle.transition().style("fill", newColor);

  activeEntityId = id;
};

const updateElements = async (label: string, elements: string[]) => {
  await Promise.all([
    activeLabel.transition().style("opacity", 0).end(),
    informationSVG
      .selectAll("text.element")
      .transition()
      .style("opacity", 0)
      .end(),
  ]);

  activeLabel.text(label).transition().style("opacity", 1);

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
    .style("alignment-baseline", "hanging")
    .style("opacity", 0)
    .transition()
    .style("opacity", 1);
};

buildPoints(graphSVG, points, (_, d) => {
  activatePoint(d.id);
  updateElements(d.label, d.elements);
});

buildCycles(graphSVG, cycles, (_, d) => {
  activatePoint(d.id);
  updateElements(d.label, d.elements);
});
