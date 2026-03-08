import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DestinationCardProps {
  name: string;
  image: string;
  count: number;
  index: number;
}

const DestinationCard = ({ name, image, count, index }: DestinationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="min-w-[200px] snap-start md:min-w-0 flex-shrink-0 md:flex-shrink"
    >
      <Link
        to={`/explore?destination=${encodeURIComponent(name)}`}
        className="group block rounded-2xl overflow-hidden relative aspect-[3/4] bg-muted"
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-display font-bold text-background text-base md:text-lg leading-tight truncate">
              {name}
            </h3>
          </div>
          <p className="text-background/75 text-sm">
            {count} {count > 1 ? "logements" : "logement"}
          </p>
          <Button
            size="sm"
            className="rounded-full bg-primary text-primary-foreground w-fit text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Explorer
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default DestinationCard;
