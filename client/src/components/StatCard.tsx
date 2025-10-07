import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface StatCardProps {
  title: string;
  today: string | number | null;
  yesterday: string | number | null;
  total: string | number | null;
  bgColor: string;
  className?: string;
}

export default function StatCard({
  title,
  today,
  yesterday,
  total,
  bgColor,
  className,
}: StatCardProps) {
  const { t } = useTranslation();
  
  return (
    <div
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn("rounded-lg p-5 text-white", className)}
      style={{ backgroundColor: bgColor }}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">{t('today')}</span>
          <span data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-today`} className="text-lg font-semibold">
            {today ?? 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-90">{t('yesterday')}</span>
          <span data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-yesterday`} className="text-lg font-semibold">
            {yesterday ?? 0}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/20">
          <span className="text-sm font-medium">{t('total')}</span>
          <span data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-total`} className="text-xl font-bold">
            {total ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
