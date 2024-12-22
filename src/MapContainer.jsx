import React, { useState } from "react";

import { Map } from "./Map";

export const MapContainer = ({ MapContext }) => {
  return (
    <MapContext.Provider value={{}}>
      <Map lng={-81.97} lat={33.47} zoom={11} />
    </MapContext.Provider>
  );
};
