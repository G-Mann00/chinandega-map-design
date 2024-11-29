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
// Definiendo variables para las capas
var coropletasLayer = L.layerGroup();
var simbolosLayer = L.layerGroup();

// Obteniendo color para las coropletas
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

// Determinando el radio de cada simbolo según el valor de población total
function getRadius(total) {
  return Math.sqrt(total) * 0.2;
}

// Estilo para las áreas (Coropletas)
function styleCoropletas(feature) {
  return {
    fillColor: getColor(feature.properties.Total),
    weight: 2,
    opacity: 1,
    color: "black",
    fillOpacity: 0.7,
  };
}

// Estilo para los símbolos (Simbolos Proporcionales)
function styleProporcional(feature) {
  return {
    radius: getRadius(feature.properties.Total), // Calcula el tamaño del círculo
    fillColor: "#ccdaed", // Color de relleno
    color: "#636363", // Color del borde
    weight: 1, // Grosor del borde
    opacity: 1, // Opacidad del borde
    fillOpacity: 0.7, // Opacidad del relleno
  };
}

// Eventos de interaccion (Coropletas)
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

// Eventos de interaccion (Simbolos Proporcionales)
function highlightProportionalFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 3,
    color: "#666",
    fillOpacity: 1,
  });
  layer.bringToFront();
}

function resetProportionalHighlight(e) {
  var layer = e.target;
  layer.setStyle({
    radius: getRadius(layer.feature.properties.Total), // Reaplicar el radio original
    fillColor: "#ccdaed",
    color: "#636363",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7,
  });
}

// Cargar el GeoJSON de Chinandega (Coropletas)
fetch("geojsons/chinandega-coropletas.geojson")
  .then((response) => response.json())
  .then((data) => {
    // Cargando el GeoJson y aplicando estilo
    geojson = L.geoJson(data, {
      style: styleCoropletas,
      onEachFeature: function (feature, layer) {
        // Agregando eventos
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature,
        });
        // Popup con la información de Municipio y Total
        layer.bindPopup(
          `<b>Municipio:</b> ${feature.properties.Municipio}<br><b>Poblacion Total:</b> ${feature.properties.Total}`
        );
      },
    }).addTo(coropletasLayer);
  })
  .catch((error) => console.error("Error al cargar el GeoJSON:", error));

// Cargar el GeoJSON de Chinandega (Simbolos Proporcionales)
fetch("geojsons/chinandega-simbolos.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, styleProporcional(feature));
      },
      onEachFeature: function (feature, layer) {
        layer.on({
          mouseover: highlightProportionalFeature,
          mouseout: resetProportionalHighlight,
        });
        layer.bindPopup(
          `<b>Municipio:</b> ${feature.properties.Municipio}<br><b>Total:</b> ${feature.properties.Total}`
        );
      },
    }).addTo(simbolosLayer);
  })
  .catch((error) =>
    console.error("Error al cargar el GeoJSON de centroides:", error)
  );

// Agregando las coropletas al mapa por defecto
coropletasLayer.addTo(map);

// Control de Capas
var baseLayers = {};
var overlayLayers = {
  Coropletas: coropletasLayer,
  Simbolos: simbolosLayer,
};

L.control.layers(baseLayers, overlayLayers).addTo(map);

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
