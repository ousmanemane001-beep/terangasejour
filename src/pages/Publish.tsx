import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Home, Camera, MapPin, DollarSign, Bed, Bath, Users, CheckCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const steps = [
  { icon: Home, title: "Décrivez votre logement", description: "Type de propriété, nombre de chambres, équipements disponibles" },
  { icon: Camera, title: "Ajoutez des photos", description: "Des photos de qualité attirent plus de voyageurs" },
  { icon: DollarSign, title: "Fixez votre prix", description: "Définissez un tarif compétitif par nuit" },
  { icon: CheckCircle, title: "Publiez et recevez", description: "Votre annonce est en ligne, les réservations arrivent !" },
];

const Publish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("villa");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - photoFiles.length;
    const newFiles = files.slice(0, remaining);
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Veuillez vous connecter pour publier un logement");
      navigate("/login");
      return;
    }
    if (!title || !price) {
      toast.error("Veuillez remplir le titre et le prix");
      return;
    }
    if (photoFiles.length < 5) {
      toast.error("Vous devez ajouter au moins 5 photos pour publier ce logement.");
      return;
    }

    setLoading(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      // Insert listing
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title,
        description,
        property_type: propertyType,
        location,
        bedrooms,
        bathrooms,
        capacity,
        price_per_night: parseInt(price),
        photos: photoUrls,
        status: "published",
      });

      if (error) throw error;
      toast.success("Logement publié avec succès !");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Publiez votre logement
          </motion.h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Mettez votre propriété en ligne en quelques étapes et commencez à recevoir des réservations rapidement.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">Comment ça marche</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-foreground text-sm font-bold">{i + 1}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-warm-gray">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">Informations sur votre logement</h2>
          <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Titre de l'annonce</label>
                <Input placeholder="Ex: Belle villa avec piscine à Saly" className="rounded-xl h-12" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <Textarea placeholder="Décrivez votre logement en détail..." rows={4} className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type de logement</label>
                  <select className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="villa">Villa</option>
                    <option value="appartement">Appartement</option>
                    <option value="maison">Maison d'hôtes</option>
                    <option value="lodge">Lodge</option>
                    <option value="loft">Loft</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Localisation
                  </label>
                  <Input placeholder="Ville, quartier" className="rounded-xl h-12" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bed className="w-3.5 h-3.5 inline mr-1" />Chambres
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Bath className="w-3.5 h-3.5 inline mr-1" />Salles de bain
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1" />Capacité
                  </label>
                  <Input type="number" min={1} className="rounded-xl h-12" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 inline mr-1" />Prix par nuit (FCFA)
                </label>
                <Input type="number" placeholder="Ex: 45000" className="rounded-xl h-12" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <Camera className="w-3.5 h-3.5 inline mr-1" />Photos
                </label>
                <input type="file" ref={fileInputRef} accept="image/jpeg,image/png" multiple className="hidden" onChange={handlePhotos} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Cliquez ou glissez vos photos ici</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG • Min 5, max 10 photos • 5 Mo par photo</p>
                  {photoFiles.length > 0 && photoFiles.length < 5 && (
                    <p className="text-xs text-destructive mt-2 font-medium">
                      Vous devez ajouter au moins 5 photos pour publier ce logement. ({photoFiles.length}/5)
                    </p>
                  )}
                </div>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-xl h-12 bg-primary text-primary-foreground font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier mon logement"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Publish;
