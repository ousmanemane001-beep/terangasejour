import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
      className="min-w-[160px] snap-start md:min-w-0 flex-shrink-0 md:flex-shrink"
    >
      <Link
        to={`/explore?destination=${encodeURIComponent(name)}`}
        className="block rounded-[14px] overflow-hidden bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-transform duration-[250ms]"
      >
        <img
          src={image}
          alt={name}
          className="w-full object-cover"
          style={{ height: 210 }}
          loading="lazy"
        />
        <div className="px-3 py-2.5">
          <h3 className="font-display font-semibold text-foreground text-sm md:text-base leading-tight truncate">
            {name}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {count} {count > 1 ? "logements" : "logement"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default DestinationCard;
