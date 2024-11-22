// Centro y Zoom a Chinandega
var map = L.map("map").setView([12.6231, -87.1278], 10);

// Capa base de OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Elaborado por Luswi Danilo Torres Pomarez',
}).addTo(map);
