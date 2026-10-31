import React, { useEffect, useRef } from 'react';
import continentData from './globeContinents.json';
import { Activity, ShieldCheck, Cpu, TrendingUp } from 'lucide-react';

/* ------------------------------------------------------------------
 * Orthographic Projection Math (NASA / GIS standard)
 * ------------------------------------------------------------------ */
function projectPoint(latDeg, lonDeg, centerLat, centerLon, radius, cx, cy) {
  const phi0 = (centerLat * Math.PI) / 180;
  const lambda0 = (centerLon * Math.PI) / 180;
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lonDeg * Math.PI) / 180;

  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);
  if (cosC < 0) return null; // Behind visible hemisphere

  const k = 1;
  const x = cx + radius * k * Math.cos(phi) * Math.sin(lambda - lambda0);
  const y = cy - radius * k * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0));

  return { x, y, cosC };
}

// Global Financial Hubs
const HUBS = [
  { name: 'India Core (FinWise)', lat: 20.59, lon: 78.96, color: '#00F2FE', isPrimary: true },
  { name: 'Mumbai Financial', lat: 19.07, lon: 72.87, color: '#FFFFFF', isPrimary: true },
  { name: 'Delhi NCR', lat: 28.61, lon: 77.20, color: '#38BDF8', isPrimary: false },
  { name: 'Bangalore Tech', lat: 12.97, lon: 77.59, color: '#00F2FE', isPrimary: false },
  { name: 'Singapore APAC', lat: 1.35, lon: 103.82, color: '#10B981', isSecondary: true },
  { name: 'Dubai Gateway', lat: 25.20, lon: 55.27, color: '#F59E0B', isPrimary: false },
  { name: 'Tokyo Exchange', lat: 35.67, lon: 139.65, color: '#38BDF8', isPrimary: false },
  { name: 'London Capital', lat: 51.50, lon: -0.12, color: '#818CF8', isPrimary: false },
  { name: 'Sydney Pacific', lat: -33.86, lon: 151.20, color: '#00F2FE', isPrimary: false },
];

// Pre-generate dense cyber-mesh dots covering major landmasses
function generateLandDots() {
  const dots = [];
  // Grid sampling: step in lat and lon
  for (let lat = -50; lat <= 70; lat += 3.5) {
    for (let lon = -180; lon <= 180; lon += 4) {
      // Rough land bounding boxes to concentrate glowing particles on continents
      const isAsia = lat >= 5 && lat <= 60 && lon >= 60 && lon <= 145;
      const isIndia = lat >= 6 && lat <= 35 && lon >= 68 && lon <= 92;
      const isEurope = lat >= 35 && lat <= 70 && lon >= -10 && lon <= 45;
      const isAfrica = lat >= -35 && lat <= 36 && lon >= -18 && lon <= 52;
      const isAustralia = lat >= -44 && lat <= -10 && lon >= 112 && lon <= 155;
      const isMidEast = lat >= 12 && lat <= 38 && lon >= 35 && lon <= 65;

      if (isIndia || isAsia || isEurope || isAfrica || isAustralia || isMidEast) {
        dots.push({
          lat: lat + (Math.random() - 0.5) * 1.5,
          lon: lon + (Math.random() - 0.5) * 1.5,
          size: isIndia ? 1.8 : (Math.random() > 0.6 ? 1.4 : 0.9),
          bright: isIndia || Math.random() > 0.5,
        });
      }
    }
  }
  return dots;
}

const LAND_DOTS = generateLandDots();

// Background floating bokeh light orbs
const BOKEH_PARTICLES = Array.from({ length: 22 }, () => ({
  x: Math.random() * 520,
  y: Math.random() * 520,
  r: Math.random() * 2.5 + 1,
  speed: Math.random() * 0.4 + 0.15,
  alpha: Math.random() * 0.6 + 0.2,
  color: Math.random() > 0.5 ? '#00F2FE' : '#F59E0B',
}));

export default function HolographicEarthGlobe() {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ lon: 78, lat: 22 });
  const animFrameRef = useRef(null);
  const pulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 520;
    const height = 520;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const radius = 180;
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      // Smooth precession centered around India
      rotationRef.current.lon = 78 + Math.sin(Date.now() * 0.00035) * 18;
      pulseRef.current = (pulseRef.current + 0.02) % (Math.PI * 2);

      ctx.clearRect(0, 0, width, height);

      const centerLon = rotationRef.current.lon;
      const centerLat = rotationRef.current.lat;
      const now = Date.now();

      // -------------------------------------------------------------
      // 1. ROTATING VOLUMETRIC LIGHT RAYS (Aura / Sunburst Behind Globe)
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);
      const rayAngle = now * 0.00018;
      ctx.rotate(rayAngle);

      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        const rayGrad = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius * 1.55);
        rayGrad.addColorStop(0, 'rgba(0, 242, 254, 0.16)');
        rayGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)');
        rayGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius * 1.55, a - 0.07, a + 0.07);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // 2. OUTER ATMOSPHERIC NEON HALO & CORONA BLOOM
      // -------------------------------------------------------------
      const outerHalo = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.45);
      outerHalo.addColorStop(0, 'rgba(0, 242, 254, 0.32)');
      outerHalo.addColorStop(0.35, 'rgba(37, 99, 235, 0.20)');
      outerHalo.addColorStop(0.7, 'rgba(124, 58, 237, 0.10)');
      outerHalo.addColorStop(1, 'transparent');

      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 3. BASE 3D OCEAN SPHERE (Rich Navy Spherical Shading)
      // -------------------------------------------------------------
      const oceanGrad = ctx.createRadialGradient(
        cx - radius * 0.38,
        cy - radius * 0.38,
        radius * 0.05,
        cx,
        cy,
        radius
      );
      oceanGrad.addColorStop(0, '#0F3057');
      oceanGrad.addColorStop(0.35, '#0A1E3F');
      oceanGrad.addColorStop(0.7, '#040C1E');
      oceanGrad.addColorStop(1, '#01050F');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();
      ctx.clip(); // Clip all inner elements inside globe sphere

      // -------------------------------------------------------------
      // 4. RADIANT SUPERNOVA CORE LIGHT (Golden-Cyan Sunburst from Center)
      // -------------------------------------------------------------
      const coreGrad = ctx.createRadialGradient(
        cx - radius * 0.15,
        cy - radius * 0.1,
        0,
        cx,
        cy,
        radius * 0.95
      );
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      coreGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.40)');
      coreGrad.addColorStop(0.28, 'rgba(245, 158, 11, 0.25)');
      coreGrad.addColorStop(0.55, 'rgba(0, 242, 254, 0.22)');
      coreGrad.addColorStop(0.85, 'rgba(37, 99, 235, 0.10)');
      coreGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 5. GRATICULE LINES (Latitude & Longitude Wireframe Grid)
      // -------------------------------------------------------------
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.16)';

      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let l = -180; l <= 180; l += 4) {
          const pt = projectPoint(lat, l, centerLat, centerLon, radius, cx, cy);
          if (pt) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      });

      for (let l = -180; l < 180; l += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 4) {
          const pt = projectPoint(lat, l, centerLat, centerLon, radius, cx, cy);
          if (pt) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 6. CONTINENT POLYGONS WITH GLOWING CYAN COASTLINES
      // -------------------------------------------------------------
      ctx.fillStyle = 'rgba(12, 42, 84, 0.75)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 12;

      Object.entries(continentData).forEach(([key, coords]) => {
        ctx.beginPath();
        let started = false;
        coords.forEach(([lat, lon]) => {
          const pt = projectPoint(lat, lon, centerLat, centerLon, radius, cx, cy);
          if (pt) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        });
        if (started) {
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0; // Reset shadow

      // -------------------------------------------------------------
      // 7. LUMINOUS CYBER-PARTICLE DOT MATRIX (Shimmering Landmass)
      // -------------------------------------------------------------
      LAND_DOTS.forEach((dot) => {
        const pt = projectPoint(dot.lat, dot.lon, centerLat, centerLon, radius, cx, cy);
        if (pt) {
          const alpha = 0.45 + 0.55 * pt.cosC;
          ctx.fillStyle = dot.bright
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(0, 242, 254, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dot.size * (0.8 + 0.3 * pt.cosC), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // -------------------------------------------------------------
      // 8. FINANCIAL CONSTELLATION MESH (Connected Hub Vectors)
      // -------------------------------------------------------------
      const hubPoints = HUBS.map((h) => ({
        ...h,
        pt: projectPoint(h.lat, h.lon, centerLat, centerLon, radius, cx, cy),
      })).filter((h) => h.pt !== null);

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.28)';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < hubPoints.length; i++) {
        for (let j = i + 1; j < hubPoints.length; j++) {
          const p1 = hubPoints[i].pt;
          const p2 = hubPoints[j].pt;
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // -------------------------------------------------------------
      // 9. HIGH-ALTITUDE SUB-ORBITAL FLIGHT & CAPITAL ARCS
      // -------------------------------------------------------------
      const indiaPt = projectPoint(20.59, 78.96, centerLat, centerLon, radius, cx, cy);
      const mumbaiPt = projectPoint(19.07, 72.87, centerLat, centerLon, radius, cx, cy);
      const singaporePt = projectPoint(1.35, 103.82, centerLat, centerLon, radius, cx, cy);
      const dubaiPt = projectPoint(25.20, 55.27, centerLat, centerLon, radius, cx, cy);
      const tokyoPt = projectPoint(35.67, 139.65, centerLat, centerLon, radius, cx, cy);

      const drawFlightArc = (p1, p2, color, curveOffset = 30) => {
        if (!p1 || !p2) return;
        const midX = (p1.x + p2.x) / 2 + (p1.y - p2.y) * 0.15;
        const midY = (p1.y + p2.y) / 2 - curveOffset;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated traveling photon light packet
        const t = (now * 0.00075) % 1;
        const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
        const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(qx, qy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      drawFlightArc(mumbaiPt, singaporePt, 'rgba(0, 242, 254, 0.75)', 38);
      drawFlightArc(mumbaiPt, dubaiPt, 'rgba(245, 158, 11, 0.65)', 25);
      if (singaporePt && tokyoPt) {
        drawFlightArc(singaporePt, tokyoPt, 'rgba(56, 189, 248, 0.55)', 32);
      }

      // -------------------------------------------------------------
      // 10. CONCENTRIC PULSING RADAR PINGS (Matching ARC Reference)
      // -------------------------------------------------------------
      if (indiaPt) {
        const ping1 = ((pulseRef.current * 16) % 32) + 4;
        const alpha1 = Math.max(0, 1 - ping1 / 34);
        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha1})`;
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(indiaPt.x, indiaPt.y, ping1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Solid luminous center point on India
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00F2FE';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(indiaPt.x, indiaPt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (singaporePt) {
        const ping2 = ((pulseRef.current * 13) % 24) + 3;
        const alpha2 = Math.max(0, 1 - ping2 / 26);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha2})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(singaporePt.x, singaporePt.y, ping2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(singaporePt.x, singaporePt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // END GLOBE CLIPPING

      // -------------------------------------------------------------
      // 11. INTENSE ELECTRIC NEON ATMOSPHERIC RIM RING (ARC Look)
      // -------------------------------------------------------------
      ctx.save();
      // Primary Sharp Electric Rim
      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary Soft Outer Ambient Glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 45;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // -------------------------------------------------------------
      // 12. ROTATING 3D GYROSCOPIC ORBITAL NEON RINGS
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      // Ring 1: Tilted Cyan Ellipse
      ctx.rotate(-0.35 + Math.sin(now * 0.0003) * 0.05);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.35, radius * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Cyan Satellite Bead
      const orbAngle1 = now * 0.0009;
      const ox1 = Math.cos(orbAngle1) * radius * 1.35;
      const oy1 = Math.sin(orbAngle1) * radius * 0.48;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ox1, oy1, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ring 2: Counter-Tilted Electric Violet Ellipse
      ctx.rotate(0.7);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.45, radius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbiting Violet Satellite Bead
      const orbAngle2 = -now * 0.0007;
      const ox2 = Math.cos(orbAngle2) * radius * 1.45;
      const oy2 = Math.sin(orbAngle2) * radius * 0.42;
      ctx.fillStyle = '#A855F7';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ox2, oy2, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // -------------------------------------------------------------
      // 13. ANAMORPHIC LENS FLARE AT TOP-LEFT LIMB
      // -------------------------------------------------------------
      const flareX = cx - radius * 0.72;
      const flareY = cy - radius * 0.70;

      ctx.save();
      // Horizontal Anamorphic Streak
      const streakGrad = ctx.createLinearGradient(flareX - 90, flareY, flareX + 90, flareY);
      streakGrad.addColorStop(0, 'transparent');
      streakGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.85)');
      streakGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = streakGrad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(flareX - 90, flareY);
      ctx.lineTo(flareX + 90, flareY);
      ctx.stroke();

      // Bright Core Glint
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // -------------------------------------------------------------
      // 14. FLOATING BOKEH LIGHT PARTICLES
      // -------------------------------------------------------------
      BOKEH_PARTICLES.forEach((b) => {
        b.y -= b.speed;
        if (b.y < 0) {
          b.y = height;
          b.x = Math.random() * width;
        }
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.alpha * (0.6 + 0.4 * Math.sin(now * 0.002 + b.x));
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="cs-arc-stage-container">
      {/* Real-Time Holographic Earth Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '520px',
          height: '520px',
          display: 'block',
          margin: '0 auto',
        }}
      />

      {/* -------------------------------------------------------------
       * HUD TELEMETRY CARDS (Positioned around the Globe like ARC)
       * ------------------------------------------------------------- */}

      {/* HUD 1: Top of Globe (Capital Flow / Global Traffic) */}
      <div className="cs-hud-card cs-hud-top">
        <div className="cs-hud-header">
          <span className="cs-hud-led cs-led-cyan" />
          <span className="cs-hud-title">GLOBAL SURVEILLANCE</span>
        </div>
        <div className="cs-hud-value">
          ₹4.8M ops/sec <span className="cs-hud-badge-green">+12%</span>
        </div>
      </div>

      {/* HUD 2: Top Right of Globe (Financial Health Score) */}
      <div className="cs-hud-card cs-hud-top-right">
        <div className="cs-hud-header">
          <Activity size={13} color="#10B981" />
          <span className="cs-hud-title">FINANCIAL HEALTH</span>
        </div>
        <div className="cs-hud-value">
          84 / 100 <span className="cs-hud-badge-green">Strong</span>
        </div>
      </div>

      {/* HUD 3: Upper Left of Globe (Active Pace Alert / Incidents) */}
      <div className="cs-hud-card cs-hud-mid-left">
        <div className="cs-hud-header">
          <span className="cs-hud-led cs-led-red" />
          <span className="cs-hud-title">ACTIVE PACE ALERT</span>
        </div>
        <div className="cs-hud-value" style={{ color: '#FCA5A5' }}>
          1 Shortfall <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>(Thar Goal)</span>
        </div>
      </div>

      {/* HUD 4: Mid Right of Globe (Telemetry / SEBI Guardrail) */}
      <div className="cs-hud-card cs-hud-mid-right">
        <div className="cs-hud-header">
          <ShieldCheck size={13} color="#00F2FE" />
          <span className="cs-hud-title">SEBI SURVEILLANCE</span>
        </div>
        <div className="cs-hud-value">
          100% Deterministic <span className="cs-hud-badge-cyan">Active</span>
        </div>
      </div>

      {/* HUD 5: Bottom Left of Globe (50/30/20 Network) */}
      <div className="cs-hud-card cs-hud-bottom-left">
        <div className="cs-hud-header">
          <Cpu size={13} color="#A78BFA" />
          <span className="cs-hud-title">50/30/20 INTELLIGENCE</span>
        </div>
        <div className="cs-hud-value">
          Wants: 28% <span className="cs-hud-badge-violet">₹10.8K Saved</span>
        </div>
      </div>
    </div>
  );
}
