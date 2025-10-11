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
  
  // Filter states
  const [filters, setFilters] = useState({
    username: "",
    code: "",
    status: "all"
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Mock data for demonstration (since this page shows no records)
  const mockData = [];
  
  // Apply pagination to mock data
  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayData = mockData.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Filter functions - TaskManagement style
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
    } else if (field === 'endDate') {
      setEndDate(value);
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleApplyFilter = () => {
    setIsFiltered(true);
    setCurrentPage(1); // Reset to first page when applying filters
    // You can add toast here if needed
  };

  const handleClearFilters = () => {
    setFilters({
      username: "",
      code: "",
      status: "all"
    });
    setStartDate("2025-09-25");
    setEndDate("2025-10-09");
    setIsFiltered(false);
    setCurrentPage(1); // Reset to first page when clearing filters
    // You can add toast here if needed
  };

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
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('loginUserName')}:</Label>
            <Input 
              data-testid="input-username" 
              className="mt-1" 
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input 
              data-testid="input-code" 
              className="mt-1" 
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="Enter code"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('status')}:</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="Pending">{t('pending')}</SelectItem>
                <SelectItem value="Expired">{t('expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button data-testid="button-filter" className="px-8" onClick={handleApplyFilter}>{t('filter')}</Button>
          <Button data-testid="button-clear-filter" variant="outline" className="px-8" onClick={handleClearFilters}>
            Clear Filters
          </Button>
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
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} 
              ({mockData.length} total records)
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
