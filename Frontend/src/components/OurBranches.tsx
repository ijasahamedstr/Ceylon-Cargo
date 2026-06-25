import React, { useState, useEffect, useRef } from "react";
import Rellax from "rellax";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

const OurBranches: React.FC = () => {
  const font = "'Montserrat', sans-serif";

  const branches = [
    { name: "Colombo Branch", location: "No. 123, Galle Road, Colombo 03", contact: "+94 11 234 5678", email: "colombo@ceyloncargo.lk", website: "/" },
    { name: "Gampaha Branch", location: "No. 45, Kandy Road, Gampaha", contact: "+94 33 222 1111", email: "gampaha@ceyloncargo.lk", website: "/" },
    { name: "Kurunegala Branch", location: "No. 88, Putlam Road, Kurunegala", contact: "+94 37 456 7890", email: "kurunegala@ceyloncargo.lk", website: "/" },
  ];

  const [currentPage] = useState(1);
  const branchesPerPage = 6;
  const currentBranches = branches.slice((currentPage - 1) * branchesPerPage, currentPage * branchesPerPage);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      const rellax = new Rellax(circleRef.current, { speed: -1, center: true });
      return () => rellax.destroy();
    }
  }, []);

  const styles = {
    sectionWrapper: { position: "relative" as const, overflow: "hidden", padding: "100px 0", backgroundColor: "#ffffff", fontFamily: font },
    bgElement: { position: "absolute" as const, top: "20%", left: "2%", fontSize: "12rem", fontWeight: 900, color: "#f1f5f9", zIndex: 0, userSelect: "none" as const },
    container: { position: "relative" as const, zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "0 5%" },
    header: { textAlign: "left" as const, marginBottom: "60px", borderLeft: "8px solid #0a5397", paddingLeft: "30px" },
    title: { fontSize: "3rem", fontWeight: 800, color: "#1e293b", margin: 0, textTransform: "uppercase" as const, fontFamily: font },
    subtitle: { fontSize: "1rem", color: "#64748b", marginTop: "5px", fontWeight: 500, fontFamily: font },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "50px" },
    card: { backgroundColor: "#fff", borderRadius: "0px", padding: "40px", border: "1px solid #e2e8f0", transition: "all 0.4s ease-in-out", display: "flex", flexDirection: "column" as const, position: "relative" as const },
    cardTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#0a5397", marginBottom: "30px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", fontFamily: font },
    detailList: { position: "relative" as const, paddingLeft: "35px", display: "flex", flexDirection: "column" as const, gap: "25px" },
    verticalLine: { position: "absolute" as const, left: 0, top: 0, bottom: 0, width: "2px", backgroundColor: "#e2e8f0" },
    item: { display: "flex", flexDirection: "column" as const, textDecoration: "none", color: "#475569", position: "relative" as const, textAlign: "left" as const },
    iconWrapper: { position: "absolute" as const, left: "-45px", backgroundColor: "#fff", padding: "5px 0", color: "#0a5397" },
    label: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: "4px", fontFamily: font },
    value: { fontSize: "0.95rem", fontWeight: 500, lineHeight: "1.4", fontFamily: font },
    cta: { marginTop: "40px", padding: "12px 0", backgroundColor: "transparent", color: "#0a5397", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", textTransform: "uppercase" as const, letterSpacing: "1px", borderBottom: "2px solid #0a5397", alignSelf: "flex-start" as const, transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "10px", fontFamily: font },
  };

  return (
    <section style={styles.sectionWrapper}>
      <div ref={circleRef} style={styles.bgElement}>BRANCHES</div>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Our Branches</h1>
          <p style={styles.subtitle}>Find us at our convenient locations across the region.</p>
        </div>
        <div style={styles.grid}>
          {currentBranches.map((branch, idx) => (
            <div key={idx} style={styles.card}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "15px 15px 0px #0a5397"; e.currentTarget.style.transform = "translate(-5px, -5px)"; e.currentTarget.style.borderColor = "#0a5397"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
              <h3 style={styles.cardTitle}>{branch.name}</h3>
              <div style={styles.detailList}>
                <div style={styles.verticalLine}></div>
                <div style={styles.item}>
                  <div style={styles.iconWrapper}><MapPin size={18} /></div>
                  <span style={styles.label}>Location</span>
                  <span style={styles.value}>{branch.location}</span>
                </div>
                <a href={`tel:${branch.contact}`} style={styles.item}>
                  <div style={styles.iconWrapper}><Phone size={18} /></div>
                  <span style={styles.label}>Telephone</span>
                  <span style={{ ...styles.value, fontWeight: 700 }}>{branch.contact}</span>
                </a>
                <a href={`mailto:${branch.email}`} style={styles.item}>
                  <div style={styles.iconWrapper}><Mail size={18} /></div>
                  <span style={styles.label}>Email</span>
                  <span style={styles.value}>{branch.email}</span>
                </a>
              </div>
              <a href={branch.website} target="_blank" rel="noreferrer" style={styles.cta}
                onMouseEnter={e => { e.currentTarget.style.paddingLeft = "10px"; e.currentTarget.style.color = "#1e293b"; }}
                onMouseLeave={e => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.color = "#0a5397"; }}>
                Visit Website <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurBranches;