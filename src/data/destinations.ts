export interface Destination {
  name: string;
  category: "ville" | "region" | "plage" | "lac" | "site_historique" | "musee" | "hotel" | "commerce" | "lieu_public";
  region: string;
  lat: number;
  lng: number;
}

export const destinations: Destination[] = [
  // === VILLES ===
  { name: "Dakar", category: "ville", region: "Dakar", lat: 14.6928, lng: -17.4467 },
  { name: "Saint-Louis", category: "ville", region: "Saint-Louis", lat: 16.0326, lng: -16.4896 },
  { name: "Thiès", category: "ville", region: "Thiès", lat: 14.7910, lng: -16.9261 },
  { name: "Ziguinchor", category: "ville", region: "Ziguinchor", lat: 12.5681, lng: -16.2719 },
  { name: "Kaolack", category: "ville", region: "Kaolack", lat: 14.1520, lng: -16.0726 },
  { name: "Mbour", category: "ville", region: "Thiès", lat: 14.4167, lng: -16.9667 },
  { name: "Touba", category: "ville", region: "Diourbel", lat: 14.8500, lng: -15.8833 },
  { name: "Tambacounda", category: "ville", region: "Tambacounda", lat: 13.7709, lng: -13.6673 },
  { name: "Kolda", category: "ville", region: "Kolda", lat: 12.8837, lng: -14.9500 },
  { name: "Fatick", category: "ville", region: "Fatick", lat: 14.3342, lng: -16.4044 },
  { name: "Louga", category: "ville", region: "Louga", lat: 15.6148, lng: -16.2227 },
  { name: "Matam", category: "ville", region: "Matam", lat: 15.6559, lng: -13.2554 },
  { name: "Kédougou", category: "ville", region: "Kédougou", lat: 12.5605, lng: -12.1747 },
  { name: "Sédhiou", category: "ville", region: "Sédhiou", lat: 12.7081, lng: -15.5569 },
  { name: "Kaffrine", category: "ville", region: "Kaffrine", lat: 14.1059, lng: -15.5508 },
  { name: "Richard-Toll", category: "ville", region: "Saint-Louis", lat: 16.4622, lng: -15.7000 },
  { name: "Rufisque", category: "ville", region: "Dakar", lat: 14.7167, lng: -17.2667 },
  { name: "Pikine", category: "ville", region: "Dakar", lat: 14.7645, lng: -17.3907 },
  { name: "Guédiawaye", category: "ville", region: "Dakar", lat: 14.7833, lng: -17.3833 },
  { name: "Saly", category: "ville", region: "Thiès", lat: 14.4474, lng: -17.0174 },
  { name: "Somone", category: "ville", region: "Thiès", lat: 14.4860, lng: -17.0768 },
  { name: "Joal-Fadiouth", category: "ville", region: "Thiès", lat: 14.1667, lng: -16.8333 },
  { name: "Popenguine", category: "ville", region: "Thiès", lat: 14.5500, lng: -17.1167 },

  // === RÉGIONS ===
  { name: "Région de Dakar", category: "region", region: "Dakar", lat: 14.7167, lng: -17.4677 },
  { name: "Région de Thiès", category: "region", region: "Thiès", lat: 14.7910, lng: -16.9261 },
  { name: "Région de Saint-Louis", category: "region", region: "Saint-Louis", lat: 16.0326, lng: -16.4896 },
  { name: "Région de Ziguinchor", category: "region", region: "Ziguinchor", lat: 12.5681, lng: -16.2719 },
  { name: "Région de Casamance", category: "region", region: "Ziguinchor", lat: 12.8000, lng: -15.5000 },
  { name: "Petite Côte", category: "region", region: "Thiès", lat: 14.4500, lng: -17.0500 },
  { name: "Sine-Saloum", category: "region", region: "Fatick", lat: 13.7500, lng: -16.5000 },
  { name: "Région de Tambacounda", category: "region", region: "Tambacounda", lat: 13.7709, lng: -13.6673 },
  { name: "Région de Kédougou", category: "region", region: "Kédougou", lat: 12.5605, lng: -12.1747 },
  { name: "Pays Bassari", category: "region", region: "Kédougou", lat: 12.6000, lng: -12.3000 },

  // === PLAGES ===
  { name: "Plage de Ngor", category: "plage", region: "Dakar", lat: 14.7487, lng: -17.5167 },
  { name: "Plage des Almadies", category: "plage", region: "Dakar", lat: 14.7456, lng: -17.5139 },
  { name: "Plage de Yoff", category: "plage", region: "Dakar", lat: 14.7564, lng: -17.4847 },
  { name: "Plage de Saly", category: "plage", region: "Thiès", lat: 14.4450, lng: -17.0200 },
  { name: "Plage de Cap Skirring", category: "plage", region: "Ziguinchor", lat: 12.3933, lng: -16.7461 },
  { name: "Plage de la Somone", category: "plage", region: "Thiès", lat: 14.4860, lng: -17.0800 },
  { name: "Plage de Popenguine", category: "plage", region: "Thiès", lat: 14.5500, lng: -17.1200 },
  { name: "Plage de Toubab Dialaw", category: "plage", region: "Dakar", lat: 14.5833, lng: -17.1333 },
  { name: "Plage de Nianing", category: "plage", region: "Thiès", lat: 14.3833, lng: -16.9667 },
  { name: "Plage de la Langue de Barbarie", category: "plage", region: "Saint-Louis", lat: 15.9500, lng: -16.5100 },
  { name: "Plage de Kafountine", category: "plage", region: "Ziguinchor", lat: 12.9333, lng: -16.7500 },
  { name: "Plage de Diembéring", category: "plage", region: "Ziguinchor", lat: 12.4167, lng: -16.7833 },

  // === LACS ===
  { name: "Lac Rose (Lac Retba)", category: "lac", region: "Dakar", lat: 14.8400, lng: -17.2333 },
  { name: "Lac de Guiers", category: "lac", region: "Saint-Louis", lat: 16.2000, lng: -15.8500 },
  { name: "Lac Mbaouane", category: "lac", region: "Thiès", lat: 14.8000, lng: -17.0500 },

  // === SITES HISTORIQUES ===
  { name: "Île de Gorée", category: "site_historique", region: "Dakar", lat: 14.6672, lng: -17.3986 },
  { name: "Maison des Esclaves", category: "site_historique", region: "Dakar", lat: 14.6670, lng: -17.3988 },
  { name: "Pont Faidherbe", category: "site_historique", region: "Saint-Louis", lat: 16.0260, lng: -16.4900 },
  { name: "Quartier colonial de Saint-Louis", category: "site_historique", region: "Saint-Louis", lat: 16.0230, lng: -16.4930 },
  { name: "Grande Mosquée de Touba", category: "site_historique", region: "Diourbel", lat: 14.8500, lng: -15.8833 },
  { name: "Mégalithes de Sénégambie (Sine Ngayène)", category: "site_historique", region: "Kaolack", lat: 13.6900, lng: -15.5300 },
  { name: "Île à Morphil", category: "site_historique", region: "Saint-Louis", lat: 15.8000, lng: -14.5000 },
  { name: "Fadiouth (Île aux coquillages)", category: "site_historique", region: "Thiès", lat: 14.1600, lng: -16.8300 },
  { name: "Fort de Podor", category: "site_historique", region: "Saint-Louis", lat: 16.6500, lng: -14.9667 },
  { name: "Thiès – Camp Thiaroye", category: "site_historique", region: "Dakar", lat: 14.7500, lng: -17.3500 },

  // === MUSÉES ===
  { name: "Musée des Civilisations Noires", category: "musee", region: "Dakar", lat: 14.6850, lng: -17.4400 },
  { name: "Musée Théodore Monod (IFAN)", category: "musee", region: "Dakar", lat: 14.6750, lng: -17.4420 },
  { name: "Musée de la Femme Henriette-Bathily", category: "musee", region: "Dakar", lat: 14.6680, lng: -17.3990 },
  { name: "Musée de la Mer (Gorée)", category: "musee", region: "Dakar", lat: 14.6670, lng: -17.3985 },
  { name: "Musée de Saint-Louis", category: "musee", region: "Saint-Louis", lat: 16.0270, lng: -16.4920 },
  { name: "Musée de la Photographie de Saint-Louis", category: "musee", region: "Saint-Louis", lat: 16.0250, lng: -16.4910 },
  { name: "Village des Arts de Dakar", category: "musee", region: "Dakar", lat: 14.6930, lng: -17.4500 },
  { name: "Musée Boribana", category: "musee", region: "Dakar", lat: 14.7200, lng: -17.4700 },

  // === HÔTELS CÉLÈBRES ===
  { name: "Hôtel Terrou-Bi", category: "hotel", region: "Dakar", lat: 14.7190, lng: -17.4720 },
  { name: "Radisson Blu Dakar", category: "hotel", region: "Dakar", lat: 14.7230, lng: -17.4650 },
  { name: "King Fahd Palace", category: "hotel", region: "Dakar", lat: 14.7350, lng: -17.4950 },
  { name: "Hôtel de la Poste (Saint-Louis)", category: "hotel", region: "Saint-Louis", lat: 16.0230, lng: -16.4920 },
  { name: "Les Bougainvillées (Saly)", category: "hotel", region: "Thiès", lat: 14.4480, lng: -17.0180 },
  { name: "Lamantin Beach Hôtel (Saly)", category: "hotel", region: "Thiès", lat: 14.4460, lng: -17.0160 },
  { name: "Club Med Cap Skirring", category: "hotel", region: "Ziguinchor", lat: 12.3930, lng: -16.7460 },
  { name: "Hôtel Djoloff (Dakar)", category: "hotel", region: "Dakar", lat: 14.7000, lng: -17.4600 },
  { name: "Résidence de l'Océan (Ngor)", category: "hotel", region: "Dakar", lat: 14.7490, lng: -17.5170 },
  { name: "Lodge des Collines de Niassam", category: "hotel", region: "Ziguinchor", lat: 12.5500, lng: -16.3000 },

  // === COMMERCES / MARCHÉS ===
  { name: "Marché Sandaga", category: "commerce", region: "Dakar", lat: 14.6730, lng: -17.4380 },
  { name: "Marché Kermel", category: "commerce", region: "Dakar", lat: 14.6710, lng: -17.4350 },
  { name: "Marché HLM", category: "commerce", region: "Dakar", lat: 14.7000, lng: -17.4400 },
  { name: "Marché Tilène", category: "commerce", region: "Dakar", lat: 14.6900, lng: -17.4500 },
  { name: "Village Artisanal de Soumbédioune", category: "commerce", region: "Dakar", lat: 14.7100, lng: -17.4700 },
  { name: "Marché de Thiès", category: "commerce", region: "Thiès", lat: 14.7920, lng: -16.9260 },
  { name: "Marché Saint-Louis (Ndar)", category: "commerce", region: "Saint-Louis", lat: 16.0200, lng: -16.4950 },
  { name: "Marché de Ziguinchor", category: "commerce", region: "Ziguinchor", lat: 12.5700, lng: -16.2700 },
  { name: "Centre Commercial Sea Plaza", category: "commerce", region: "Dakar", lat: 14.7160, lng: -17.4670 },

  // === LIEUX PUBLICS / PARCS / RÉSERVES ===
  { name: "Monument de la Renaissance Africaine", category: "lieu_public", region: "Dakar", lat: 14.7228, lng: -17.4931 },
  { name: "Place de l'Indépendance", category: "lieu_public", region: "Dakar", lat: 14.6730, lng: -17.4380 },
  { name: "Parc de Hann", category: "lieu_public", region: "Dakar", lat: 14.7200, lng: -17.4100 },
  { name: "Parc National des Oiseaux du Djoudj", category: "lieu_public", region: "Saint-Louis", lat: 16.4500, lng: -16.2167 },
  { name: "Parc National du Niokolo-Koba", category: "lieu_public", region: "Tambacounda", lat: 13.0667, lng: -13.0667 },
  { name: "Réserve de Bandia", category: "lieu_public", region: "Thiès", lat: 14.5833, lng: -17.0167 },
  { name: "Delta du Saloum", category: "lieu_public", region: "Fatick", lat: 13.6500, lng: -16.7000 },
  { name: "Réserve naturelle de Popenguine", category: "lieu_public", region: "Thiès", lat: 14.5500, lng: -17.1000 },
  { name: "Parc Forestier de Casamance", category: "lieu_public", region: "Ziguinchor", lat: 12.6000, lng: -16.0000 },
  { name: "Corniche de Dakar", category: "lieu_public", region: "Dakar", lat: 14.7100, lng: -17.4800 },
  { name: "Phare des Mamelles", category: "lieu_public", region: "Dakar", lat: 14.7250, lng: -17.5050 },
  { name: "Île de la Madeleine", category: "lieu_public", region: "Dakar", lat: 14.6600, lng: -17.4700 },
  { name: "Stade Abdoulaye Wade", category: "lieu_public", region: "Dakar", lat: 14.8000, lng: -17.2000 },
];

export const destinationCategories: { value: Destination["category"]; label: string }[] = [
  { value: "ville", label: "Villes" },
  { value: "region", label: "Régions" },
  { value: "plage", label: "Plages" },
  { value: "lac", label: "Lacs" },
  { value: "site_historique", label: "Sites historiques" },
  { value: "musee", label: "Musées" },
  { value: "hotel", label: "Hôtels" },
  { value: "commerce", label: "Commerces & Marchés" },
  { value: "lieu_public", label: "Lieux publics & Parcs" },
];
