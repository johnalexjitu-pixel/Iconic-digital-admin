import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TasklistExpiration() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("2025-09-25");
  const [endDate, setEndDate] = useState("2025-10-09");

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">{t('tasklistExpiration')}</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*{t('expiredDate')}:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('loginUserName')}:</Label>
            <Input data-testid="input-username" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input data-testid="input-code" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('status')}:</Label>
            <Select defaultValue="Pending">
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">{t('pending')}</SelectItem>
                <SelectItem value="Expired">{t('expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button data-testid="button-filter" className="px-8">{t('filter')}</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-12">
        <div className="text-center">
          <div className="text-muted-foreground mb-4 flex justify-center">
            <Inbox className="w-24 h-24" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('noRecordsFound')}</h3>
          <p className="text-muted-foreground">
            {t('noExpiredTasklists')}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg mt-6">
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('rowsPerPage')}:</span>
            <Select defaultValue="100">
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">0-0 of 0</div>
        </div>
      </div>
    </div>
  );
}
