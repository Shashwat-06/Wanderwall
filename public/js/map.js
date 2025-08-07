const reversedCords = listing.geometry.coordinates.reverse();
var redIcon = L.icon({
  iconUrl: "/js/mapmarker.svg",

  iconSize: [25, 41],

  popupAnchor: [1, -34],
});
var map = L.map("map").setView(reversedCords, 13);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {}
).addTo(map);

L.marker(reversedCords, { icon: redIcon })
  .addTo(map)
  .bindPopup(
    `<h4>${listing.title}</h4><p>Exact Location provided after booking</p>`
  );

var circle = L.circle(reversedCords, {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
})
  .addTo(map)
  .bindPopup(
    `<h4>${listing.title}</h4><p>Exact Location provided after booking</p>`
  );

console.log(coordinates);
