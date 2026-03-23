import { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MobileSearchPill from "@/components/MobileSearchPill";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import { useListings, type DBListing } from "@/hooks/useListings";
import { useListingsRatings } from "@/hooks/useReviews";
import {
  Loader2, Home, Shield, ArrowRight, Building2, Hotel, TreePalm
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const COASTAL_CITIES = ["saly", "somone", "mbour", "cap skirring", "gorée", "saint-louis", "ziguinchor"];
const REGION_CITIES = ["ziguinchor", "tambacounda", "kaolack", "thiès", "kédougou", "fatick", "kolda"];

const Index = () => {
  const { data: dbListings, isLoading } = useListings();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <div className="sticky top-[56px] z-30 bg-background border-b border-border">
        <div className="md:hidden px-4 pt-3 pb-2">
          <MobileSearchPill />
        </div>
        <div className="hidden md:block py-4">
          <div className="max-w-[1200px] mx-auto px-6">
            <SearchBar />
          </div>
        </div>
      </div>




      <section className="flex-1 py-6 md:py-10 space-y-8 md:space-y-12">
        <CategorySection title={t("home.popularListings")} listings={dbListings} filterFn={() => true} isLoading={isLoading} />
        <CategorySection title={t("home.dakarApts")} listings={dbListings} filterFn={(l) => { const city = (l.city || l.location || "").toLowerCase(); const type = l.property_type.toLowerCase(); return city.includes("dakar") && (type.includes("appartement") || type.includes("studio") || type.includes("appart")); }} isLoading={isLoading} />
        <CategorySection title={t("home.seaside")} listings={dbListings} filterFn={(l) => { const city = (l.city || l.location || "").toLowerCase(); const type = l.property_type.toLowerCase(); return COASTAL_CITIES.some((c) => city.includes(c)) || type.includes("plage") || type.includes("villa"); }} isLoading={isLoading} />
        <CategorySection title={t("home.hotelsResidences")} listings={dbListings} filterFn={(l) => { const type = l.property_type.toLowerCase(); return type.includes("hotel") || type.includes("hôtel") || type.includes("résidence") || type.includes("residence") || type.includes("villa") || type.includes("loft"); }} isLoading={isLoading} />
        <CategorySection title={t("home.mbourListings")} listings={dbListings} filterFn={(l) => { const city = (l.city || l.location || "").toLowerCase(); return city.includes("mbour"); }} isLoading={isLoading} />
        <CategorySection title={t("home.saloumListings")} listings={dbListings} filterFn={() => true} isLoading={isLoading} />
        <CategorySection title={t("home.stLouisListings")} listings={dbListings} filterFn={() => true} isLoading={isLoading} />
        <CategorySection title={t("home.regionListings")} listings={dbListings} filterFn={(l) => { const city = (l.city || l.location || "").toLowerCase(); return REGION_CITIES.some((c) => city.includes(c)); }} isLoading={isLoading} />
      </section>

      {/* CTA Devenir hôte */}
      <section className="py-12 md:py-16 bg-foreground text-background">
        <div className="max-w-[1200px] mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3">{t("home.becomeHost")}</h2>
          <p className="text-background/70 text-sm md:text-base mb-6">{t("home.earnMoney")}</p>
          <Link to="/become-host">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
              <Home className="w-4 h-4" />
              {t("home.becomeHost")}
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Publier logement */}
      <section className="py-10 md:py-12 bg-card">
        <div className="max-w-[1200px] mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-2">{t("home.publishListing")}</h2>
          <p className="text-muted-foreground text-sm mb-5">Publiez votre logement en quelques minutes.</p>
          <Link to="/create-listing">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2">
              <Shield className="w-4 h-4" />
              {t("home.publishListing")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const CategorySection = ({
  title,
  listings,
  filterFn,
  isLoading,
}: {
  title: string;
  listings: DBListing[] | undefined;
  filterFn: (l: DBListing) => boolean;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const filtered = useMemo(() => (listings ?? []).filter(filterFn), [listings, filterFn]);
  const { data: ratingsMap } = useListingsRatings(filtered.map((l) => l.id));

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="shimmer h-6 w-48 rounded-lg mb-4" />
        <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[46%]">
              <div className="shimmer aspect-[4/3] rounded-2xl" />
              <div className="mt-2 space-y-2">
                <div className="shimmer h-4 w-3/4 rounded-lg" />
                <div className="shimmer h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="shimmer aspect-[4/3] rounded-2xl" />
              <div className="shimmer h-4 w-3/4 rounded-lg" />
              <div className="shimmer h-3 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (filtered.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
        <Link to="/explore">
          <Button variant="ghost" size="sm" className="rounded-full text-sm text-muted-foreground hover:text-foreground gap-1">
            {t("home.viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {filtered.map((listing) => (
          <div key={listing.id} className="shrink-0 w-[46%]">
            <ListingCard listing={listing} rating={ratingsMap?.[listing.id]} />
          </div>
        ))}
      </div>
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} rating={ratingsMap?.[listing.id]} />
        ))}
      </div>
    </div>
  );
};

export default Index;
