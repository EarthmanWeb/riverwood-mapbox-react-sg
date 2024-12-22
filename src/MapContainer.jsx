import React, { useState } from "react";

import { Map } from "./Map";

export const MapContainer = ({ MapContext }) => {
  return (
    <MapContext.Provider value={{}}>
      <Map lng={-84.388} lat={33.749} zoom={10} />
    </MapContext.Provider>
  );
};
