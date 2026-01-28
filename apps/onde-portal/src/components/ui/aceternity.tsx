"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";

// ==================== ANIMATED TEXT ====================
export function TextGenerateEffect({ words, className }: { words: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + words[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words]);

  return (
    <motion.span className={cn("", className)}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
      />
    </motion.span>
  );
}

// ==================== GRADIENT TEXT ====================
export function GradientText({ children, className, colors = ["#5B9AA0", "#D4AF37", "#26619C", "#5B9AA0"] }: {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}) {
  return (
    <motion.span
      className={cn("bg-clip-text text-transparent bg-[length:200%_auto]", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
      }}
      animate={{ backgroundPosition: ["0% center", "200% center"] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

// ==================== 3D CARD ====================
export function Card3D({ children, className, containerClassName }: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => setMousePosition({ x: 0, y: 0 });

  const rotateX = useSpring(mousePosition.y * -1, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(mousePosition.x, { stiffness: 150, damping: 20 });

  return (
    <div
      ref={ref}
      className={cn("perspective-1000", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("relative", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ==================== GLOWING CARD ====================
export function GlowingCard({ children, className, glowColor = "rgba(91, 154, 160, 0.4)" }: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("relative group rounded-2xl overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`,
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

// ==================== BENTO GRID ====================
export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({ 
  title, description, icon, className, header 
}: {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}) {
  return (
    <GlowingCard
      className={cn(
        "row-span-1 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between",
        className
      )}
    >
      {header && <div className="mb-4">{header}</div>}
      <div>
        {icon && <div className="mb-3">{icon}</div>}
        {title && (
          <h3 className="font-bold text-lg text-white mb-2 tracking-tight">{title}</h3>
        )}
        {description && (
          <p className="text-white/60 text-sm leading-relaxed">{description}</p>
        )}
      </div>
    </GlowingCard>
  );
}

// ==================== FLOATING DOCK ====================
export function FloatingDock({ items, className }: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) {
  return (
    <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50", className)}>
      <motion.div 
        className="flex items-center gap-3 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        {items.map((item, idx) => (
          <motion.a
            key={idx}
            href={item.href}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
            whileHover={{ scale: 1.2, y: -8 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">{item.icon}</span>
            <motion.span
              className="absolute -top-10 px-3 py-1 bg-white text-black text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              {item.title}
            </motion.span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}

// ==================== SPOTLIGHT BEAM ====================
export function SpotlightBeam({ className, fill = "white" }: { className?: string; fill?: string }) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute z-10", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <svg
        className="w-[1200px] h-[800px]"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spotlight-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={fill} stopOpacity="0.15" />
            <stop offset="100%" stopColor={fill} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="600"
          cy="0"
          rx="400"
          ry="600"
          fill="url(#spotlight-grad)"
          animate={{
            rx: [400, 450, 400],
            ry: [600, 650, 600],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
}

// ==================== MOVING BORDER ====================
export function MovingBorder({ children, className, containerClassName, duration = 3000 }: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
}) {
  return (
    <div className={cn("relative p-[2px] overflow-hidden rounded-2xl", containerClassName)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #5B9AA0, #D4AF37, #26619C, #5B9AA0)",
          backgroundSize: "300% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "300% 0%"] }}
        transition={{ duration: duration / 1000, repeat: Infinity, ease: "linear" }}
      />
      <div className={cn("relative bg-gray-900 rounded-2xl", className)}>
        {children}
      </div>
    </div>
  );
}

// ==================== LAMP EFFECT ====================
export function LampEffect({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center overflow-hidden", className)}>
      <div className="relative flex w-full flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto right-1/2 h-56 w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent"
          style={{ transform: "translateX(50%) rotate(180deg)" }}
        />
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500"
        />
        {/* Blur overlay */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 bg-gray-950 blur-2xl" />
        {/* Bottom glow */}
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 opacity-50 blur-3xl"
        />
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400"
        />
      </div>
      <div className="relative z-50">{children}</div>
    </div>
  );
}

// ==================== INFINITE MOVING CARDS ====================
export function InfiniteMovingCards({ items, direction = "left", speed = "normal", className }: {
  items: { quote: string; name: string; title: string }[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scrollerRef.current?.appendChild(duplicatedItem);
    });
  }, []);

  const getSpeed = () => {
    if (speed === "slow") return "60s";
    if (speed === "fast") return "20s";
    return "40s";
  };

  return (
    <div
      ref={containerRef}
      className={cn("scroller overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]", className)}
    >
      <motion.div
        ref={scrollerRef}
        className="flex min-w-full shrink-0 gap-4 py-4"
        animate={{ x: direction === "left" ? "-50%" : "0%" }}
        transition={{ duration: parseInt(getSpeed()), repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="w-[350px] max-w-full relative rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl px-8 py-6 flex-shrink-0"
          >
            <p className="text-white/80 text-sm leading-relaxed mb-4">"{item.quote}"</p>
            <div>
              <p className="text-white font-medium">{item.name}</p>
              <p className="text-white/50 text-sm">{item.title}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ==================== WAVY BACKGROUND ====================
export function WavyBackground({ children, className, containerClassName, colors, blur = 10 }: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  blur?: number;
}) {
  const defaultColors = ["#5B9AA0", "#7EB8C4", "#D4AF37", "#26619C"];
  const waveColors = colors ?? defaultColors;

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <svg className="absolute inset-0 w-full h-full" style={{ filter: `blur(${blur}px)` }}>
        <defs>
          {waveColors.map((color, i) => (
            <linearGradient key={i} id={`wave-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="0.3" />
            </linearGradient>
          ))}
        </defs>
        {waveColors.map((_, i) => (
          <motion.path
            key={i}
            d="M0,100 Q250,50 500,100 T1000,100 V200 H0 Z"
            fill={`url(#wave-grad-${i})`}
            initial={{ y: 100 + i * 30 }}
            animate={{ 
              y: [100 + i * 30, 120 + i * 30, 100 + i * 30],
              d: [
                "M0,100 Q250,50 500,100 T1000,100 V200 H0 Z",
                "M0,100 Q250,150 500,100 T1000,100 V200 H0 Z",
                "M0,100 Q250,50 500,100 T1000,100 V200 H0 Z",
              ]
            }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "center" }}
          />
        ))}
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
