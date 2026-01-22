"use client";

import { motion } from "framer-motion";

export const MotionDiv = motion.div;

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl text-center space-y-6"
    >
      {children}
    </motion.div>
  );
}

export function FeaturesAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-auto mt-20 max-w-5xl"
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay }}
      className="relative overflow-hidden rounded-2xl border bg-card/50 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-500/30 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>
        <div className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
