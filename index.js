// Centro y Zoom a Chinandega
var map = L.map("map").setView([12.6231, -87.1278], 9);

// Capa base de OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Proyecto Elaborado por: Luswi Danilo Torres Pomarez',
}).addTo(map);

// Funcion para reubicar el zoom del mapa a chinandega
function reubicar() {
  map.setView([12.6231, -87.1278], 9);
}

// Agregando el control de escala
L.control
  .scale({
    imperial: false,
    metric: true,
    position: "bottomright",
    maxWidth: 100,
  })
  .addTo(map);

// Funcionalidad del Modal
const btnInfo = document.getElementById("information-button");
const modalInfo = document.getElementById("info-modal");
const btnCerrarModal = document.getElementById("close-modal");

btnInfo.addEventListener("click", () => {
  modalInfo.showModal();
});

btnCerrarModal.addEventListener("click", () => {
  modalInfo.close();
});

// Capa del Minimapa
var miniMapLayer = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    minZoom: 5,
    maxZoom: 13,
  }
);

// Agregando el minimapa al contenedor del mapa principal
new L.Control.MiniMap(miniMapLayer, {
  toggleDisplay: true,
  minimized: false,
  position: "bottomright",
}).addTo(map);

// -- Agregando GeoJSON de Chinandega (Coropletas) --
// NOTA (26/11/24): NO ESTA APLICANDO BIEN LOS COLORES DE LA COROPLETA, REVISAR LOGICA DE RANGOS DE COLORES Y RESOLVER ERROR
function getColor(total) {
  return total >= 117037
    ? "#def5e5"
    : total >= 63625
    ? "#4bc2ad"
    : total >= 20275
    ? "#357ba3"
    : total >= 17177
    ? "#3e2e8b"
    : "#30275d"; // Para valores entre 0 y 7060
}

// Estilo para las áreas del GeoJSON
function style(feature) {
  return {
    fillColor: getColor(feature.properties.Total),
    weight: 2,
    opacity: 1,
    color: "black",
    fillOpacity: 0.7,
  };
}

// Eventos de interaccion con los municipios
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#666",
    fillOpacity: 0.7,
  });

  layer.bringToFront();
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

// Cargar el GeoJSON de Chinandega
fetch("geojsons/chinandega-coropletas.geojson")
  .then((response) => response.json())
  .then((data) => {
    // Agregando el GeoJSON al mapa
    geojson = L.geoJson(data, {
      style: style,
      onEachFeature: function (feature, layer) {
        // Agregando eventos
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature,
        });
        // Popup con la información de Municipio y Total
        layer.bindPopup(
          `<b>Municipio:</b> ${feature.properties.Municipio}<br><b>Total:</b> ${feature.properties.Total}`
        );
      },
    }).addTo(map);
  })
  .catch((error) => console.error("Error al cargar el GeoJSON:", error));

// Agregando la leyenda
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");

  // arreglo de objetos con los rangos y los colores correspondientes
  var ranges = [
    { min: 0, max: 7060, color: "#30275d" },
    { min: 7061, max: 17176, color: "#3e2e8b" },
    { min: 17177, max: 20274, color: "#357ba3" },
    { min: 20275, max: 63624, color: "#4bc2ad" },
    { min: 63625, max: 117037, color: "#def5e5" },
  ];

  // Bucle para crear las etiquetas y colores de la leyenda
  for (var i = 0; i < ranges.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      ranges[i].color +
      '"></i> ' +
      ranges[i].min +
      " - " +
      ranges[i].max +
      "<br>";
  }

  return div;
};

legend.addTo(map);
