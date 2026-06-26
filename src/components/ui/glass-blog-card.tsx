"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";

interface GlassBlogCardProps {
  title?: string;
  excerpt?: string;
  image?: string;
  author?: { name: string; avatar: string };
  date?: string;
  readTime?: string;
  tags?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function GlassBlogCard({
  title = "The Future of UI Design",
  excerpt = "Exploring the latest trends in glassmorphism, 3D elements, and micro-interactions.",
  image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  author = { name: "StudyAI", avatar: "" },
  date = "",
  readTime = "",
  tags = [],
  ctaLabel = "Leer más",
  ctaHref,
  className,
}: GlassBlogCardProps) {
  const showMeta = !!date || !!readTime;

  const ctaButton = (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer"
    >
      <BookOpen className="h-4 w-4" />
      {ctaLabel}
    </motion.span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full", className)}
    >
      <Card className="group relative h-full overflow-hidden rounded-2xl border-border/50 bg-card/30 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
              {tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-background/50 backdrop-blur-sm hover:bg-background/80">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Hover overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {ctaHref ? (
              <Link href={ctaHref}>{ctaButton}</Link>
            ) : (
              ctaButton
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
          </div>

          {showMeta && (
            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-border/50">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-xs">
                  <span className="font-medium text-foreground">{author.name}</span>
                  {date && <span className="text-muted-foreground">{date}</span>}
                </div>
              </div>
              {readTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{readTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
