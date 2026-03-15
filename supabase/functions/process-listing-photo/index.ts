import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OUTPUT_WIDTH = 1500;
const OUTPUT_HEIGHT = 1000;
const JPEG_QUALITY = 80;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawPath } = await req.json();
    if (!rawPath || typeof rawPath !== "string") {
      throw new Error("Missing rawPath");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Download raw file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("listing-photos")
      .download(rawPath);

    if (downloadError || !fileData) {
      throw new Error(`Download failed: ${downloadError?.message || "no data"}`);
    }

    let imageBuffer = new Uint8Array(await fileData.arrayBuffer());
    const ext = rawPath.split(".").pop()?.toLowerCase() || "";

    // 2. Convert HEIC/HEIF to JPEG if needed
    if (ext === "heic" || ext === "heif") {
      try {
        const convert = (await import("npm:heic-convert@2.1.0")).default;
        const result = await convert({
          buffer: imageBuffer,
          format: "JPEG",
          quality: 0.85,
        });
        imageBuffer = new Uint8Array(result);
        console.log("[process-listing-photo] HEIC converted to JPEG");
      } catch (heicErr) {
        console.error("[process-listing-photo] HEIC conversion failed:", heicErr);
        // Fallback: store raw file as-is
      }
    }

    // 3. Resize and compress using ImageScript (pure TypeScript, no native deps)
    let processedBuffer = imageBuffer;
    try {
      const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
      const img = await Image.decode(imageBuffer);

      // Center-crop to 3:2 aspect ratio
      const targetRatio = 3 / 2;
      const srcRatio = img.width / img.height;
      let cropX = 0,
        cropY = 0,
        cropW = img.width,
        cropH = img.height;

      if (srcRatio > targetRatio) {
        cropW = Math.round(img.height * targetRatio);
        cropX = Math.round((img.width - cropW) / 2);
      } else if (srcRatio < targetRatio) {
        cropH = Math.round(img.width / targetRatio);
        cropY = Math.round((img.height - cropH) / 2);
      }

      img.crop(cropX, cropY, cropW, cropH);

      // Resize to output dimensions
      if (img.width > OUTPUT_WIDTH || img.height > OUTPUT_HEIGHT) {
        img.resize(OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }

      processedBuffer = await img.encodeJPEG(JPEG_QUALITY);
      console.log(`[process-listing-photo] Processed: ${img.width}x${img.height}`);
    } catch (processErr) {
      console.error("[process-listing-photo] ImageScript processing failed:", processErr);
      // Fallback: use the (possibly HEIC-converted) buffer as-is
    }

    // 4. Upload processed file to final location
    const processedPath = rawPath.replace(/^raw\//, "").replace(/\.\w+$/, ".jpg");

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(processedPath, processedBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Processed upload failed: ${uploadError.message}`);
    }

    // 5. Return public URL
    const { data: urlData } = supabase.storage
      .from("listing-photos")
      .getPublicUrl(processedPath);

    // 6. Clean up raw file (best effort)
    supabase.storage.from("listing-photos").remove([rawPath]).catch(() => {});

    return new Response(
      JSON.stringify({ url: urlData.publicUrl, processed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[process-listing-photo] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
