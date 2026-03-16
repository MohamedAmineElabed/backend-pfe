import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ClipboardList, FileCheck, PenLine, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Siderbar from "../components/siderbar";

/* ── Mock data (replace with your import) ─────────────────────── */
const mockEvaluations = [
  { id: 1, organisme: "Organisme Alpha",  dateCreation: "2025-03-01", status: "soumise",   progress: 100, preuves: 8 },
  { id: 2, organisme: "Organisme Beta",   dateCreation: "2025-03-05", status: "en_cours",  progress: 62,  preuves: 4 },
  { id: 3, organisme: "Organisme Gamma",  dateCreation: "2025-03-10", status: "brouillon", progress: 20,  preuves: 1 },
  { id: 4, organisme: "Organisme Delta",  dateCreation: "2025-03-12", status: "en_cours",  progress: 45,  preuves: 3 },
  { id: 5, organisme: "Organisme Epsilon",dateCreation: "2025-03-14", status: "soumise",   progress: 100, preuves: 6 },
];

/* ── Status config ─────────────────────────────────────────────── */
const STATUS = {
  brouillon: {
    label: "Brouillon",
    dot: "#94a3b8",
    text: "#475569",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.3)",
  },
  en_cours: {
    label: "En cours",
    dot: "#f59e0b",
    text: "#92400e",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  soumise: {
    label: "Soumise",
    dot: "#10b981",
    text: "#065f46",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
  },
};

/* ── Progress bar fill colour ──────────────────────────────────── */
function progressColor(pct) {
  if (pct === 100) return "#10b981";
  if (pct >= 60)  return "#3b82f6";
  if (pct >= 30)  return "#f59e0b";
  return "#f87171";
}

/* ── Stagger preset ────────────────────────────────────────────── */
const stagger = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
});

/* ════════════════════════════════════════════════════════════════
   METRIC CARD
════════════════════════════════════════════════════════════════ */
function Metric({ title, value, sub, icon, accent, index }) {
  return (
    <motion.div {...stagger(index)} style={styles.metricCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={styles.metricTitle}>{title}</span>
        <div style={{ ...styles.metricIcon, background: accent + "18", color: accent }}>
          {icon}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{ ...styles.metricValue, color: accent }}>{value}</span>
        {sub && <span style={styles.metricSub}>{sub}</span>}
      </div>
      {/* decorative bottom line */}
      <div style={{ ...styles.metricBar, background: accent + "30" }}>
        <div style={{ ...styles.metricBarFill, background: accent, width: `${Math.min(100, value * 12)}%` }} />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const Evaluation = () => {
  const totalEvals   = mockEvaluations.length;
  const soumises     = mockEvaluations.filter((e) => e.status === "soumise").length;
  const enCours      = mockEvaluations.filter((e) => e.status === "en_cours").length;
  const totalPreuves = mockEvaluations.reduce((s, e) => s + e.preuves, 0);

  return (
    <>
    <Siderbar/>
    <div style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={styles.header}
      >
        <div>
          <div style={styles.headerEyebrow}>Sprint 3 · RSE 2025</div>
          <h1 style={styles.headerTitle}>Évaluations</h1>
          <p style={styles.headerSub}>Suivi des évaluations et des preuves justificatives</p>
        </div>

        <Link to="/evaluationForm" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={styles.newBtn}
          >
            <Plus size={15} strokeWidth={2.5} />
            Nouvelle évaluation
          </motion.button>
        </Link>
      </motion.header>

      <div style={styles.body}>
        {/* ── Metrics ──────────────────────────────────────────── */}
        <div style={styles.metricsGrid}>
          <Metric index={0} title="Total évaluations"  value={totalEvals}   icon={<ClipboardList size={16}/>} accent="#6366f1" />
          <Metric index={1} title="Soumises"            value={soumises}     icon={<FileCheck size={16}/>}     accent="#10b981" sub="évaluations validées" />
          <Metric index={2} title="En cours"            value={enCours}      icon={<PenLine size={16}/>}       accent="#f59e0b" sub="en attente de soumission" />
          <Metric index={3} title="Preuves jointes"     value={totalPreuves} icon={<TrendingUp size={16}/>}    accent="#3b82f6" sub="fichiers téléversés" />
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <motion.section {...stagger(4)} style={styles.tableSection}>
          <div style={styles.tableTitleRow}>
            <h2 style={styles.tableTitle}>Évaluations récentes</h2>
            <span style={styles.tableCount}>{totalEvals} entrées</span>
          </div>

          <div style={styles.tableWrap}>
            {/* thead */}
            <div style={styles.thead}>
              {["Organisme", "Date de création", "Statut", "Progression", "Preuves", ""].map((col, i) => (
                <span key={i} style={{ ...styles.th, textAlign: i >= 4 ? "center" : "left" }}>
                  {col}
                </span>
              ))}
            </div>

            {/* rows */}
            {mockEvaluations.map((ev, idx) => {
              const cfg   = STATUS[ev.status];
              const color = progressColor(ev.progress);
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={styles.row}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Organisme */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ ...styles.orgAvatar, background: `hsl(${ev.id * 47 + 200},60%,92%)`, color: `hsl(${ev.id * 47 + 200},55%,35%)` }}>
                      {ev.organisme[0]}
                    </div>
                    <span style={styles.orgName}>{ev.organisme}</span>
                  </div>

                  {/* Date */}
                  <span style={styles.dateCell}>{ev.dateCreation}</span>

                  {/* Status badge */}
                  <div>
                    <span style={{
                      ...styles.badge,
                      color: cfg.text,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      <span style={{ ...styles.badgeDot, background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={styles.progressTrack}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ev.progress}%` }}
                        transition={{ delay: 0.5 + idx * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        style={{ ...styles.progressFill, background: color }}
                      />
                    </div>
                    <span style={{ ...styles.progressPct, color }}>{ev.progress}%</span>
                  </div>

                  {/* Preuves */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={styles.preuvesBadge}>{ev.preuves}</span>
                  </div>

                  {/* Arrow */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link to="/evaluation/new">
                      <motion.div
                        whileHover={{ x: 2, y: -2 }}
                        style={styles.arrowBtn}
                      >
                        <ArrowUpRight size={14} strokeWidth={2} />
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════════ */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fc",
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    paddingLeft: 200,   // espace entre le sidebar et le contenu
    //paddingRight: 24,
    //paddingTop: 0,
  },

  /* Header */
  header: {
    background: "#0f172a",
    padding: "32px 40px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6366f1",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    margin: "0 0 6px",
  },
  headerSub: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
    fontWeight: 400,
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 4px 14px rgba(99,102,241,0.3)",
  },

  body: {
    padding: "36px 40px",
    maxWidth: 1200,
  },

  /* Metrics */
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 36,
  },
  metricCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 22px 16px",
    border: "1px solid #e8eaf0",
    position: "relative",
    overflow: "hidden",
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: "-1px",
    lineHeight: 1,
    display: "block",
  },
  metricSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 5,
    display: "block",
  },
  metricBar: {
    height: 3,
    borderRadius: 99,
    marginTop: 18,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.8s ease",
  },

  /* Table */
  tableSection: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e8eaf0",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  },
  tableTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  tableCount: {
    fontSize: 12,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  tableWrap: {
    overflowX: "auto",
  },
  thead: {
    display: "grid",
    gridTemplateColumns: "1.8fr 140px 120px 180px 80px 50px",
    gap: 0,
    padding: "10px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  th: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.8fr 140px 120px 180px 80px 50px",
    gap: 0,
    padding: "14px 24px",
    borderBottom: "1px solid #f8fafc",
    alignItems: "center",
    transition: "background 0.15s",
    cursor: "default",
  },

  /* Row cells */
  orgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  orgName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
  },
  dateCell: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "#f1f5f9",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "monospace",
    minWidth: 32,
    textAlign: "right",
  },
  preuvesBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6366f1",
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 20,
    padding: "2px 10px",
    fontFamily: "monospace",
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #e8eaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.15s",
  },
};

export default Evaluation;
