export interface IPoint {
  id: number;
  label: string;
  notes: string[];
}

export interface ICycle {
  id: number;
  label: string;
  points: IPoint[];
}

export interface IPointData extends IPoint {
  position: DOMPoint;
}

export interface ICycleData extends ICycle {
  position: DOMPoint;
}
