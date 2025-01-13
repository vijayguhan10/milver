import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const MiniMap = ({ data }) => {
  return (
    <MapContainer
      center={[13.054398115031136, 80.26375998957623]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data &&
        data.length > 0 &&
        data.map(
          (route, index) =>
            route.driver &&
            route.driver.coordinates && (
              <Marker
                key={index}
                position={route.driver.coordinates}
                icon={L.icon({
                  iconUrl: `http://www.example.com/customIcon.png`,
                  iconSize: [32, 32],
                })}
              >
                <Popup>{route.driver.name}</Popup>
              </Marker>
            )
        )}
    </MapContainer>
  );
};

export default MiniMap;
