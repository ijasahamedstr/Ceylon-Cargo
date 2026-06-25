import { useEffect, useRef, useState } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";

const BLUE = "#0B5FFF";

const stats = [
  { value: 15, suffix: "+", label: "Years Experience", desc: "Trusted logistics" },
  { value: 12000, suffix: "+", label: "Packages Shipped", desc: "Safely delivered" },
  { value: 12, suffix: "", label: "Countries Served", desc: "Global reach" },
  { value: 99, suffix: "%", label: "On-Time Delivery", desc: "Consistent reliability" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

interface StatCardProps {
  value: number;
  suffix: string;
  label: string;
  desc: string;
  delay: number;
}

function StatCard({ value, suffix, label, desc, delay }: StatCardProps) {
  const font = "'Montserrat', sans-serif";
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1800, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { 
      if (entry.isIntersecting) setVisible(true); 
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <Box ref={ref} sx={{
      textAlign: "center", p: { xs: 3, md: 4 },
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <Typography sx={{ fontFamily: font, fontWeight: 900, fontSize: { xs: "2.5rem", md: "3.2rem" }, color: BLUE, lineHeight: 1, letterSpacing: "-0.03em" }}>
        {count.toLocaleString()}{suffix}
      </Typography>
      <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "1rem", color: "#fff", mt: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: font, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
        {desc}
      </Typography>
    </Box>
  );
}

export default function StatsSection() {
  const font = "'Montserrat', sans-serif";

  return (
    <Box sx={{ background: "linear-gradient(135deg, #0F172A 0%, #1a2744 100%)", py: { xs: 8, md: 10 }, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", bgcolor: "rgba(11,95,255,0.08)", top: -100, right: -100, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(11,95,255,0.06)", bottom: -80, left: -80, pointerEvents: "none" }} />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: 3, textTransform: "uppercase", mb: 1.5 }}>
            By The Numbers
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: font, fontWeight: 900, color: "#fff", fontSize: { xs: "1.8rem", md: "2.4rem" }, letterSpacing: "-0.03em" }}>
            Our Proven Track Record
          </Typography>
        </Box>
        
        <Grid container>
          {stats.map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Box sx={{ borderRight: { md: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }, borderBottom: { xs: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none", md: "none" } }}>
                <StatCard {...s} delay={i * 120} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}