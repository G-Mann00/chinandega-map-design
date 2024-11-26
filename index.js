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
