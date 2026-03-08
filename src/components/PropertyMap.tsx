import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ExternalLink, Navigation, UtensilsCrossed, Waves, Plane, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  city?: string;
}

const nearbyLandmarks = [
  { icon: Waves, label: "Plage", distance: "À proximité" },
  { icon: UtensilsCrossed, label: "Restaurants", distance: "5 min à pied" },
  { icon: Plane, label: "Aéroport", distance: "Variable" },
  { icon: Building2, label: "Centre-ville", distance: "Variable" },
];

const PropertyMap = ({ latitude, longitude, title, address, city }: PropertyMapProps) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">Localisation</h2>

      {(address || city) && (
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />
          {[address, city].filter(Boolean).join(", ")}
        </p>
      )}

      <div className="rounded-2xl overflow-hidden border border-border mb-4" style={{ height: "350px" }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} icon={defaultIcon}>
            <Popup>
              <strong>{title}</strong>
              {address && <br />}
              {address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Nearby landmarks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {nearbyLandmarks.map((landmark, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-sm">
            <landmark.icon className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">{landmark.label}</p>
              <p className="text-muted-foreground text-xs">{landmark.distance}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl gap-2 text-sm">
            <ExternalLink className="w-4 h-4" />
            Ouvrir dans Google Maps
          </Button>
        </a>
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl gap-2 text-sm">
            <Navigation className="w-4 h-4" />
            Itinéraire
          </Button>
        </a>
      </div>
    </div>
  );
};

export default PropertyMap;
