import "../styles/Map.css";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import geoJsonData from "../data/Gopherway_Routes_v1.json";
import nodeIcon from "../data/nodeIcon.png";

export default function Map() {
  //////////////////////////////////////////////////////////////
  //              SETTING UP ALL IMPORTANT REFS:              //
  //////////////////////////////////////////////////////////////
  const map = useRef(null);
  const routeNodes = useRef(L.layerGroup());
  const routeLines = useRef(L.layerGroup());
  const routeDistance = useRef(0);
  const allNodesLayer = useRef(L.layerGroup());
  const allLinesLayer = useRef(L.layerGroup());

  //////////////////////////////////////////////////////////////
  //              CODE FOR PAGE INTERACTABILITY:              //
  //////////////////////////////////////////////////////////////

  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);

  function handleClickStart(coords) {
    setStart(coords);
  }
  function handleClickEnd(coords) {
    setEnd(coords);
  }

  //////////////////////////////////////////////////////////////
  //             CODE FOR PATH FINDING ALGORITHM:             //
  //////////////////////////////////////////////////////////////

  // priority queue I made for use in pathFinder
  class PriorityQueue {
    constructor() {
      this.items = [];
    }

    enqueue(coord, distanceFromStart) {
      const currentNode = { coord, distanceFromStart };
      var added = false;
      for (let i = 0; i < this.items.length; i++) {
        if (currentNode.distanceFromStart < this.items[i].distanceFromStart) {
          this.items.splice(i, 0, currentNode);
          added = true;
          break;
        }
      }
      if (!added) {
        this.items.push(currentNode);
      }
    }

    dequeue() {
      return this.items.shift();
    }

    isEmpty() {
      return this.items.length === 0;
    }
  }

  // makes a graph of nodes, each node has its own coords and coords of all
  // neighbors. Just for clarity, this is NOT a graph like you see in math class
  // but rather a data structure that shows how different places are connected
  function graphMaker(geoData) {
    const graph = {};
    L.geoJSON(geoData, {
      onEachFeature: (feature, layer) => {
        const cur = feature.geometry.coordinates[0];
        for (let i = 0; i < cur.length - 1; i++) {
          const currentCoord = cur[i].join(",");
          const otherCoord = cur[i + 1].join(",");

          if (!graph[currentCoord]) {
            graph[currentCoord] = [];
          }
          if (!graph[otherCoord]) {
            graph[otherCoord] = [];
          }

          if (!graph[currentCoord].includes(otherCoord)) {
            graph[currentCoord].push(otherCoord);
          }
          if (!graph[otherCoord].includes(currentCoord)) {
            graph[otherCoord].push(currentCoord);
          }
        }
      },
    });
    return graph;
  }

  // pathfinder using Dijkstras algorithm. This was made using knowledge
  // learned from this video: https://www.youtube.com/watch?v=bZkzH5x0SKU
  function pathFinder(startCoords, destCoords, geoData) {
    // helper function to convert the coordinates to distance in miles
    function getHaversineDistance(coords1, coords2) {
      const R = 6371e3;
      const lat1 = coords1[1];
      const lon1 = coords1[0];
      const lat2 = coords2[1];
      const lon2 = coords2[0];

      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c;
      const miles = d * 0.000621371;
      return miles;
    }
    // initializing everything
    const startNode = startCoords.reverse().join(",");
    const destNode = destCoords.reverse().join(",");

    const graph = graphMaker(geoData);
    const distances = {};
    const nodePrevious = {};
    const visited = {};

    for (const key in graph) {
      distances[key] = Infinity;
      nodePrevious[key] = null;
    }
    distances[startNode] = 0;

    const pq = new PriorityQueue();
    pq.enqueue(startNode, 0);

    // algorithm
    while (!pq.isEmpty()) {
      const current = pq.dequeue().coord;

      // skip node if visited
      if (visited[current]) {
        continue;
      }
      visited[current] = true;

      // destination reached, pathfinding is finished
      if (current === destNode) {
        break;
      }

      // looping through neighbors
      for (const neighbor of graph[current]) {
        if (!visited[neighbor]) {
          // calculating distance, ADD ACTUAL DISTANCE LATER!!!
          const curCoordsNum = current.split(",").map(Number);
          const neighborCoordsNum = neighbor.split(",").map(Number);

          const newDistance =
            distances[current] +
            getHaversineDistance(curCoordsNum, neighborCoordsNum);

          // if new path is shorter, replace old one
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            nodePrevious[neighbor] = current;
            pq.enqueue(neighbor, newDistance);
          }
        }
      }
    }

    // outputting path
    const path = [];
    for (let cur = destNode; cur !== null; cur = nodePrevious[cur]) {
      path.push(cur.split(",").map(Number).reverse());
    }

    routeDistance.current = distances[destNode];
    return path.reverse();
  }

  //////////////////////////////////////////////////////////////
  //      COLLECTING GEOJSON DATA FOR LINES AND COORDS:       //
  //////////////////////////////////////////////////////////////

  const coordSet = new Set([]);

  allLinesLayer.current.addLayer(
    L.geoJSON(geoJsonData, {
      style: (feature) => {
        if (feature.properties.type === "u") {
          return { color: "blue" };
        } else if (feature.properties.type === "s") {
          return { color: "red" };
        }
      },
      onEachFeature: (feature, layer) => {
        for (let i = 0; i < feature.geometry.coordinates[0].length; i++) {
          coordSet.add(feature.geometry.coordinates[0][i].join(","));
        }
      },
    })
  );

  const allValidCoordinates = [];
  coordSet.forEach((cur) => {
    allValidCoordinates.push(cur.split(",").map(Number).reverse());
  });

  //////////////////////////////////////////////////////////////
  //               LIVE MAP EDITING FUNCTIONS:                //
  //////////////////////////////////////////////////////////////

  function layerNodeMaker(coords, targetLayer, interactable) {
    const myIcon = L.icon({
      iconUrl: nodeIcon,
      iconSize: [8, 8],
    });
    for (let i = 0; i < coords.length; i++) {
      const curMarker = L.marker(coords[i], { icon: myIcon });
      if (interactable) {
        curMarker.on("click", function (e) {
          const popupContent = document.createElement("div");
          const markerCoords = [e.latlng.lat, e.latlng.lng];
          popupContent.innerHTML = `<p>Coordinates: ${markerCoords}</p>
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button id="startButton" style="background-color: #b8b8b8ff">Set Start</button>
            <button id="destButton" style="background-color: #b8b8b8ff">Set Destination</button>
          </div>`;

          popupContent.querySelector("#startButton").onclick = () => {
            handleClickStart(markerCoords);
            map.current.closePopup();
          };

          popupContent.querySelector("#destButton").onclick = () => {
            handleClickEnd(markerCoords);
            map.current.closePopup();
          };

          L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map.current);
        });
      }
      targetLayer.addLayer(curMarker);
    }
  }

  // draws a route with only relevant nodes, and fades non used tunnels
  function drawRoute(path, color, interactable) {
    if (map.current) {
      map.current.removeLayer(allNodesLayer.current);
      routeLines.current.clearLayers();
      routeNodes.current.clearLayers();

      allLinesLayer.current.eachLayer(function (layer) {
        layer.setStyle({ opacity: 0.1 });
      });

      layerNodeMaker(path, routeNodes.current, interactable);
      routeNodes.current.addTo(map.current);
      routeLines.current.addLayer(L.polyline(path, { color: color }));
      routeLines.current.addTo(map.current);
    }
  }

  // brings things back to the initial state
  function reset() {
    if (map.current) {
      // Clear route layers using the ref
      routeLines.current.clearLayers();
      routeNodes.current.clearLayers();

      // Show all nodes and reset line opacity
      allNodesLayer.current.addTo(map.current);
      allLinesLayer.current.eachLayer(function (layer) {
        layer.setStyle({ opacity: 1 });
      });
    }
  }

  //////////////////////////////////////////////////////////////
  //                   ALL INITIAL MAP SETUP:                 //
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    const newMap = L.map("map").setView([44.973305, -93.238386], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(newMap);

    allLinesLayer.current.addTo(newMap);
    map.current = newMap;

    layerNodeMaker(allValidCoordinates, allNodesLayer.current, true);
    allNodesLayer.current.addTo(newMap);

    return () => {
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (start.length > 0 && end.length > 0) {
      const path = pathFinder(start, end, geoJsonData);
      drawRoute(path, "green", false);
      alert(`Total route distance: ${routeDistance.current.toFixed(2)} miles
      Outside walking distance: ${0} miles
      ETA: ${((routeDistance.current / 3) * 60).toFixed(1)} minutes`);
    }
  }, [start, end]);

  return <div id="map" />;
}
