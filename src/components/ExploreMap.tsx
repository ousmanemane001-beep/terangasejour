import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/data/properties";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createPriceIcon = (price: number, isHovered: boolean) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div style="
      background: ${isHovered ? "hsl(220, 42%, 20%)" : "hsl(0, 0%, 100%)"};
      color: ${isHovered ? "hsl(0, 0%, 100%)" : "hsl(220, 26%, 14%)"};
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'DM Sans', sans-serif;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border: 1.5px solid ${isHovered ? "hsl(37, 91%, 55%)" : "hsl(220, 13%, 91%)"};
      transform: ${isHovered ? "scale(1.15)" : "scale(1)"};
      transition: all 0.2s ease;
    ">${(price / 1000).toFixed(0)}K F</div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 15],
  });
};

interface ExploreMapProps {
  properties: Property[];
  hoveredProperty: number | null;
}

const FitBounds = ({ properties }: { properties: Property[] }) => {
  const map = useMap();
  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [properties, map]);
  return null;
};

const ExploreMap = ({ properties, hoveredProperty }: ExploreMapProps) => {
  const center: [number, number] = [14.6928, -17.4467];

  return (
    <MapContainer
      center={center}
      zoom={7}
      className="w-full h-full"
      zoomControl={true}
      style={{ background: "hsl(40, 10%, 96%)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={properties} />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createPriceIcon(property.price, hoveredProperty === property.id)}
        >
          <Popup closeButton={false} className="custom-popup">
            <Link to={`/property/${property.id}`} className="block w-56">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold text-sm text-foreground leading-tight mb-1">
                {property.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                {property.location}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{property.price.toLocaleString("fr-FR")} F<span className="text-xs font-normal text-muted-foreground"> /nuit</span></span>
                <span className="flex items-center gap-0.5 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {property.rating}
                </span>
              </div>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ExploreMap;
