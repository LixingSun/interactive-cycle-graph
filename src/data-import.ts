import source from "./data.json";
import { ICycle, IPoint } from "./types";

let currentId = 0;
let sourceData: (IPoint | ICycle)[] = [];

source.data.forEach((entity) => {
  if ("elements" in entity) {
    sourceData.push({
      id: currentId,
      label: entity.label,
      elements: entity.elements!,
    });
    currentId++;
  } else if ("points" in entity) {
    let points: IPoint[] = [];

    entity.points?.forEach((point) => {
      points.push({
        id: currentId,
        label: point.label,
        elements: point.elements,
      });
      currentId++;
    });

    sourceData.push({
      id: currentId,
      label: entity.label,
      points,
    });
  }
});

export const data = sourceData;
