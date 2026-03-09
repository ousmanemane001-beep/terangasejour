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
      supabase.from("listings").select("id, title, city, location, price_per_night, bedrooms, bathrooms, capacity, latitude, longitude, property_type, photos").eq("status", "published").limit(100),
    ]);

    const destinationsContext = (destinations || []).map(d => 
      `- ${d.name} (${d.category}, ${d.region || "Sénégal"})${d.description ? `: ${d.description}` : ""} [${d.latitude},${d.longitude}]`
    ).join("\n");

    const listingsContext = (listings || []).map(l =>
      `- ID:${l.id} "${l.title}" à ${l.city || l.location || "Sénégal"} | ${l.price_per_night} FCFA/nuit | ${l.bedrooms} ch. | ${l.capacity} pers. | ${l.property_type} | photo:${l.photos?.[0] || ""} [${l.latitude},${l.longitude}]`
    ).join("\n");

    const systemPrompt = `Tu es Ousmane, un guide touristique local du Sénégal. Tu travailles pour Teranga Séjour.

RÈGLE N°1 — STYLE "3 SECONDES" :
- Maximum 1-2 phrases + une liste de 3 suggestions max + 1 question finale.
- JAMAIS de longs paragraphes. Sois bref, chaleureux, naturel.
- Parle comme un ami guide, pas comme un robot ou un article Wikipedia.
- Utilise 1-2 emojis max par message.

RÈGLE N°2 — LANGUE :
Réponds TOUJOURS dans la langue du message de l'utilisateur (français, anglais, espagnol, italien, allemand).

RÈGLE N°3 — DESTINATIONS AVEC IMAGES :
Quand tu recommandes des destinations, utilise OBLIGATOIREMENT ce format spécial pour chaque lieu :
[DEST_CARD:nom_destination|catégorie|région|latitude|longitude]

Exemple :
Voici mes coups de cœur 🌊 :
[DEST_CARD:Lac Rose|lac|Dakar|14.8422|-17.2331]
[DEST_CARD:Île de Gorée|ile|Dakar|14.6667|-17.3997]
[DEST_CARD:Saly|plage|Petite Côte|14.4489|-17.0217]

Tu préfères la plage ou la nature ? 😊

RÈGLE N°4 — LOGEMENTS :
Quand tu recommandes un logement, utilise ce format :
[LISTING:titre|prix|ville|id_si_connu]

RÈGLE N°5 — PLANIFICATION :
Pour planifier un séjour, pose UNE question à la fois :
1. Combien de jours ?
2. Quelle région ?
3. Budget par nuit ? (économique/moyen/confort)
4. Type de logement ?
Puis génère un itinéraire court : 1 ligne par jour max.

DESTINATIONS :
${destinationsContext}

LOGEMENTS :
${listingsContext}

Rappel : sois COURT, CHALEUREUX, UTILE. Finis TOUJOURS par une question.`;

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
