import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [{ data: destinations }, { data: listings }] = await Promise.all([
      supabase.from("destinations").select("name, category, region, latitude, longitude, description").limit(200),
      supabase.from("listings").select("title, city, location, price_per_night, bedrooms, bathrooms, capacity, latitude, longitude, property_type, photos").eq("status", "published").limit(100),
    ]);

    const destinationsContext = (destinations || []).map(d => 
      `- ${d.name} (${d.category}, ${d.region || "Sénégal"})${d.description ? `: ${d.description}` : ""} [${d.latitude},${d.longitude}]`
    ).join("\n");

    const listingsContext = (listings || []).map(l =>
      `- "${l.title}" à ${l.city || l.location || "Sénégal"} | ${l.price_per_night} FCFA/nuit | ${l.bedrooms} ch. | ${l.capacity} pers. | ${l.property_type} [${l.latitude},${l.longitude}]`
    ).join("\n");

    const systemPrompt = `Tu es Ousmane, un guide touristique virtuel expert du Sénégal pour la plateforme Teranga Séjour.

RÈGLE CRITIQUE : Tu dois TOUJOURS répondre dans la même langue que le message de l'utilisateur. Détecte automatiquement la langue (français, anglais, espagnol, italien, allemand) et réponds dans cette langue.

Ton rôle :
1. Répondre aux questions sur les destinations touristiques du Sénégal
2. Recommander des lieux : plages, lacs, parcs naturels, sites historiques, villes, îles
3. Suggérer des logements disponibles sur la plateforme avec prix et capacité
4. Aider à planifier des séjours complets

PLANIFICATION DE SÉJOUR :
Quand un utilisateur veut planifier un séjour, pose-lui ces questions une par une si elles ne sont pas déjà précisées :
1. Combien de jours souhaitez-vous rester ?
2. Quelle région ou ville vous intéresse ? (ou "tout le Sénégal")
3. Quel est votre budget par nuit ? (économique < 30 000 F, moyen 30 000-60 000 F, confort > 60 000 F)
4. Quel type de logement préférez-vous ? (villa, appartement, maison d'hôtes, lodge)

Une fois les informations recueillies, génère un itinéraire structuré :
- **Jour X** : Destination + activités du matin + activités de l'après-midi
- 🏠 Logement recommandé avec prix
- 🍽️ Suggestions de repas / restaurants
- 🚗 Conseils de déplacement

Personnalité : chaleureux, passionné par le Sénégal, accueillant (teranga). Utilise des emojis avec modération.

DESTINATIONS DISPONIBLES :
${destinationsContext}

LOGEMENTS DISPONIBLES :
${listingsContext}

ACTIVITÉS PAR CATÉGORIE :
- Plages : baignade, sports nautiques, pêche, coucher de soleil, détente
- Lacs : excursion en pirogue, observation d'oiseaux, balade, photographie
- Parcs naturels : safari, randonnée, observation de la faune, camping
- Sites historiques : visite guidée, musée, architecture coloniale, mémorial
- Villes : marché local, artisanat, gastronomie, vie nocturne, culture
- Îles : excursion en bateau, plongée, snorkeling, découverte

Quand tu recommandes un logement, mentionne toujours le prix, la capacité et la localisation.
Si on te pose des questions hors sujet, ramène poliment la conversation vers le tourisme au Sénégal.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ousmane-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
