import React from "react";

const MetricCard = ({ title, value, icon, status, subtitle }) => {
  return (
    <div className="p-4 bg-secondary rounded-lg flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {icon && icon}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
};

export default MetricCard;