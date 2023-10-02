import { debounce } from "lodash";

export const uniqueId = (length = 16) => {
  return parseInt(
    Math.ceil(Math.random() * Date.now())
      .toPrecision(length)
      .toString()
      .replace('.', ''),
    10
  );
};

export const colorValues = [
  "#000BB3",
  "#0916BD",
  "#1220C7",
  "#1B2BCC",
  "#2435D6",
  "#2D40E0",
  "#364AEA",
  "#3F55EF",
  "#485FF9",
  "#516AFF",
  "#5A74FF",
  "#637EFF",
  "#6C89FF",
  "#7593FF",
  "#7E9EFF",
  "#87A8FF",
  "#90B3FF",
  "#99BDFF",
  "#A2C8FF",
  "#ABD2FF",
  "#B4DDFF",
  "#BEE7FF",
  "#CADDFF"
];

export const isPointInPoly = (polygon: any, point: any) => {
  let c = false;
  for (let i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
    ((polygon[i][1] <= point[1] && point[1] < polygon[j][1]) ||
      (polygon[j][1] <= point[1] && point[1] < polygon[i][1])) &&
      point[0] <
        ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1])) / (polygon[j][1] - polygon[i][1]) +
          polygon[i][0] &&
      (c = !c);
  }
  return c;
};

export const calculatePolygonVerticles = (lat: number, lng: number) => {
  const diff = 0.001;
  return [
    { lat: lat - diff, lng: lng + diff, id: uniqueId() },
    { lat: lat - diff, lng: lng - diff, id: uniqueId() },
    { lat: lat + diff, lng: lng - diff, id: uniqueId() },
    { lat: lat + diff, lng: lng + diff, id: uniqueId() },
  ];
};

const triggerWindowResize = () => {
  window.dispatchEvent(new Event('resize'))
};

export const debouncedResizeHandler =  debounce(triggerWindowResize, 500);