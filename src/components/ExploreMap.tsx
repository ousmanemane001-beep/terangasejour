import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/data/properties";

interface ExploreMapProps {
  properties: Property[];
  hoveredProperty: number | null;
}

const ExploreMap = ({ properties, hoveredProperty }: ExploreMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [14.6928, -17.4467],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (properties.length === 0) return;

    properties.forEach((property) => {
      const icon = createPriceIcon(property.price, false);
      const marker = L.marker([property.lat, property.lng], { icon }).addTo(map);

      const popupContent = `
        <a href="/property/${property.id}" style="display:block;width:220px;text-decoration:none;color:inherit;">
          <img src="${property.image}" alt="${property.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;font-family:'DM Sans',sans-serif;">${property.title}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">📍 ${property.location}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;font-size:13px;">${property.price.toLocaleString("fr-FR")} F<span style="font-size:11px;font-weight:400;color:#6b7280"> /nuit</span></span>
            <span style="font-size:11px;">⭐ ${property.rating}</span>
          </div>
        </a>
      `;

      marker.bindPopup(popupContent, { closeButton: false, maxWidth: 240 });
      markersRef.current.set(property.id, marker);
    });

    // Fit bounds
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [properties]);

  // Update hovered marker
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const property = properties.find((p) => p.id === id);
      if (property) {
        marker.setIcon(createPriceIcon(property.price, hoveredProperty === id));
        if (hoveredProperty === id) {
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
        }
      }
    });
  }, [hoveredProperty, properties]);

  return <div ref={mapRef} className="w-full h-full" />;
};

function createPriceIcon(price: number, isHovered: boolean) {
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
      cursor: pointer;
    ">${(price / 1000).toFixed(0)}K F</div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 15],
  });
}

export default ExploreMap;
