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

    // Extract user's last message to find relevant knowledge
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const searchTerms = lastUserMsg.toLowerCase();

    // Fetch all data sources in parallel
    const [{ data: destinations }, { data: listings }, { data: knowledge }] = await Promise.all([
      supabase.from("destinations").select("name, category, region, latitude, longitude, description, image1, image2, image3, image4").limit(200),
      supabase.from("listings").select("id, title, city, location, price_per_night, bedrooms, bathrooms, capacity, latitude, longitude, property_type, photos").eq("status", "published").limit(100),
      supabase.from("knowledge_base").select("title, category, content, source, tags").limit(100),
    ]);

    const destinationsContext = (destinations || []).map(d => {
      const images = [d.image1, d.image2, d.image3, d.image4].filter(Boolean);
      const imgStr = images.length ? ` images:[${images.join(",")}]` : "";
      return `- ${d.name} (${d.category}, ${d.region || "Sénégal"})${d.description ? `: ${d.description}` : ""} [${d.latitude},${d.longitude}]${imgStr}`;
    }).join("\n");

    const listingsContext = (listings || []).map(l =>
      `- ID:${l.id} "${l.title}" à ${l.city || l.location || "Sénégal"} | ${l.price_per_night} FCFA/nuit | ${l.bedrooms} ch. | ${l.capacity} pers. | ${l.property_type} | photo:${l.photos?.[0] || ""} [${l.latitude},${l.longitude}]`
    ).join("\n");

    // Build knowledge base context - find relevant articles
    const allKnowledge = knowledge || [];
    const relevantKnowledge = allKnowledge.filter(k => {
      const combined = `${k.title} ${k.content} ${(k.tags || []).join(" ")} ${k.category}`.toLowerCase();
      const words = searchTerms.split(/\s+/).filter((w: string) => w.length > 2);
      return words.some((w: string) => combined.includes(w));
    });

    // If no specific match, include top articles by category diversity
    const knowledgeToUse = relevantKnowledge.length > 0
      ? relevantKnowledge.slice(0, 5)
      : allKnowledge.slice(0, 8);

    const knowledgeContext = knowledgeToUse.map(k =>
      `### ${k.title} [${k.category}]\n${k.content}\n(Source: ${k.source || "Base de connaissances Teranga Séjour"})`
    ).join("\n\n");

    const systemPrompt = `Tu es Ousmane, un guide touristique local du Sénégal. Tu travailles pour Teranga Séjour.

RÈGLE FONDAMENTALE — RECHERCHE AVANT RÉPONSE :
- Tu dois TOUJOURS baser tes réponses sur la BASE DE CONNAISSANCES ci-dessous.
- Ne réponds JAMAIS avec des informations inventées ou génériques.
- Si la réponse n'est pas dans ta base de connaissances, dis honnêtement : "Je n'ai pas cette info précise, mais je peux t'aider avec..."
- Cite les sources quand c'est pertinent (ex: "Selon l'UNESCO...", "D'après le Guide du Routard...").

RÈGLE N°1 — STYLE "3 SECONDES" :
- Maximum 1-2 phrases + une liste de 3 suggestions max + 1 question finale.
- JAMAIS de longs paragraphes. Sois bref, chaleureux, naturel.
- Parle comme un ami guide, pas comme un robot.
- Utilise 1-2 emojis max par message.

RÈGLE N°2 — LANGUE :
Réponds TOUJOURS dans la langue du message de l'utilisateur (français, anglais, espagnol, italien, allemand).

RÈGLE N°3 — DESTINATIONS AVEC IMAGES :
Quand tu recommandes des destinations, utilise ce format pour chaque lieu :
[DEST_CARD:nom_destination|catégorie|région|latitude|longitude]

RÈGLE N°4 — LOGEMENTS AVEC PHOTOS :
Quand tu recommandes des logements, utilise OBLIGATOIREMENT ce format :
[LISTING_CARD:id|titre|prix_par_nuit|ville|url_photo]

Utilise les ID et photos exactes des logements de la base de données ci-dessous.

RÈGLE N°5 — MODE "CARTE DE VOYAGE PERSONNALISÉE" 🗺️ :
Quand l'utilisateur dit "carte de voyage", "planifier mon séjour", "trip", "itinéraire" :
1. Pose ces questions UNE PAR UNE :
   - Combien de jours ?
   - Type de voyage ? (détente/aventure/culture/famille)
   - Ville principale ?
   - Budget logement par nuit ?
2. Après les réponses, génère :
   - Un itinéraire court (1 ligne par jour)
   - Des [DEST_CARD] pour chaque destination
   - Des [LISTING_CARD] pour les logements recommandés
   - Termine par : [TRAVEL_MAP:lat1,lng1|lat2,lng2|lat3,lng3] avec les coordonnées des étapes

RÈGLE N°6 — MODE "VOYAGEUR PRESSÉ" ⚡ :
Quand l'utilisateur dit "pressé", "rapide", "vite", "express", "trouver un logement" :
1. Pose 3 questions en UNE SEULE réponse
2. Dès que l'utilisateur répond, affiche DIRECTEMENT 3-5 logements correspondants avec [LISTING_CARD].

RÈGLE N°7 — CONTEXTE DE PAGE :
Si le message mentionne "L'utilisateur consulte..." ou "L'utilisateur est sur la page...", c'est un contexte automatique.
Réponds comme si tu accueillais le visiteur sur cette page. Sois bref : 1 phrase + 3 cartes max + 1 question.
Ne mentionne pas que tu as reçu un contexte système, parle naturellement.

===== BASE DE CONNAISSANCES =====
${knowledgeContext}

===== DESTINATIONS =====
${destinationsContext}

===== LOGEMENTS =====
${listingsContext}

Rappel : sois COURT, CHALEUREUX, UTILE. Base tes réponses sur les données ci-dessus. Finis TOUJOURS par une question.`;

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
