"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Diamond } from "lucide-react";

interface PricingCardProps {
  title: string;
  price?: string;
  priceDescription?: string;
  description: string;
  features?: string[];
  buttonText: string;
  imageSrc?: string;
  imageAlt?: string;
  isHighlighted?: boolean;
  highlightLabel?: string;
  highlightColor?: string;
  onButtonClick?: () => void;
  className?: string;
}

const cardVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0px 15px 30px -5px rgba(79,70,229,0.15)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const imageVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: -5,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      title,
      price,
      priceDescription,
      description,
      features,
      buttonText,
      imageSrc,
      imageAlt,
      isHighlighted = false,
      highlightLabel,
      highlightColor = "var(--primary)",
      onButtonClick,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        className={cn(
          "relative flex flex-col justify-between rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-300",
          isHighlighted && "border-2",
          className
        )}
        style={isHighlighted ? { borderColor: highlightColor } : undefined}
      >
        {highlightLabel && (
          <div
            className="absolute -top-3.5 left-5 text-white text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: highlightColor }}
          >
            {highlightLabel}
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              {price && (
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{price}</span>
                  {priceDescription && (
                    <p className="text-sm text-muted">{priceDescription}</p>
                  )}
                </div>
              )}
            </div>
            {imageSrc && (
              <motion.img
                src={imageSrc}
                alt={imageAlt || title}
                width={80}
                height={80}
                className="select-none rounded-lg"
                variants={imageVariants}
              />
            )}
          </div>

          <p className="text-sm text-muted">{description}</p>

          {features && (
            <ul className="space-y-2.5 pt-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Diamond
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: highlightColor }}
                  />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Button
            className="w-full font-semibold"
            style={
              isHighlighted
                ? { background: highlightColor, borderColor: highlightColor }
                : undefined
            }
            variant={isHighlighted ? "default" : "outline"}
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      </motion.div>
    );
  }
);
PricingCard.displayName = "PricingCard";
