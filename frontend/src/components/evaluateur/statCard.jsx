export default function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: "5px 7px",
        borderRadius: "12px",
        background: "#ffffff",
        //maxWidth: "200px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
      }}
    >
      <h4 style={{ margin: 0, fontSize: "16px", color: "#374151" }}>{title}</h4>
      <div style={{ margin: "8px 0 0 0", fontSize: "26px", fontWeight: "700", color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}