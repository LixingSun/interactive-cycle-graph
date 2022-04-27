export interface IPoint {
  type: string;
  label: string;
  elements: string[];
}

export interface ICycle {
  type: string;
  label: string;
  points: IPoint[];
}

export interface IPointData extends IPoint {
  position: DOMPoint;
}

export interface ICycleData extends ICycle {
  position: DOMPoint;
}
