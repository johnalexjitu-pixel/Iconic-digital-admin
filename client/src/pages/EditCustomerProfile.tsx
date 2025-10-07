import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function EditCustomerProfile() {
  const { t } = useTranslation();
  const [, params] = useRoute("/customer/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const customerId = params?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    level: "Bronze",
    creditScore: 100,
    accountBalance: 0,
    totalEarnings: 0,
    campaignsCompleted: 0,
    membershipId: "",
    referralCode: "",
  });

  // Fetch customer details
  const { data: customerData, isLoading } = useQuery<any>({
    queryKey: ["/api/frontend/users", customerId],
    queryFn: async () => {
      console.log("📖 Fetching customer data for ID:", customerId);
      const response = await fetch(`/api/frontend/users/${customerId}`);
      const data = await response.json();
      console.log("📥 Customer data received:", data);
      return data;
    },
    enabled: !!customerId,
  });

  // Update form data when customer data is loaded
  useEffect(() => {
    if (customerData?.data) {
      const user = customerData.data;
      console.log("📝 Populating form with user data:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        level: user.level || "Bronze",
        creditScore: user.creditScore || 100,
        accountBalance: user.accountBalance || 0,
        totalEarnings: user.totalEarnings || 0,
        campaignsCompleted: user.campaignsCompleted || 0,
        membershipId: user.membershipId || "",
        referralCode: user.referralCode || "",
      });
    }
  }, [customerData]);

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("📤 Updating customer profile:", data);
      const response = await apiRequest("PATCH", `/api/frontend/users/${customerId}`, data);
      console.log("📥 Update response:", response);
      return response;
    },
    onSuccess: (data: any) => {
      console.log("✅ Customer profile updated:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/frontend/users"] });
      
      toast({
        title: "✅ Success!",
        description: "Customer profile updated successfully in MongoDB",
        duration: 5000,
      });
      
      setTimeout(() => {
        setLocation("/customer-management");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("❌ Error updating customer:", error);
      toast({
        title: "❌ Error!",
        description: error?.message || "Failed to update customer profile",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📋 Form data:", formData);
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      toast({
        title: "⚠️ Validation Error",
        description: "Name and Email are required fields",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    updateCustomerMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/customer-management")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Button>
          <h2 className="text-xl font-semibold">{t('editCustomerProfile')}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">* {t('customerName')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('enterCustomerName')}
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">* {t('email')} :</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t('enterEmail')}
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('phoneNumber')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder={t('enterPhoneNumber')}
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('membershipId')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.membershipId}
                  disabled
                  readOnly
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('referralCode')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.referralCode}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t('level')} :</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground">{t('creditScore')} :</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={formData.creditScore}
                  onChange={(e) => handleInputChange("creditScore", Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('accountBalance')} :</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={formData.accountBalance}
                  onChange={(e) => handleInputChange("accountBalance", Number(e.target.value))}
                  step="0.01"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('totalEarnings')} :</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={formData.totalEarnings}
                  onChange={(e) => handleInputChange("totalEarnings", Number(e.target.value))}
                  step="0.01"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('campaignsCompleted')} :</Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={formData.campaignsCompleted}
                  onChange={(e) => handleInputChange("campaignsCompleted", Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation("/customer-management")}
              disabled={updateCustomerMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              className="px-8"
              disabled={updateCustomerMutation.isPending}
            >
              {updateCustomerMutation.isPending ? t('updating') : t('updateCustomerProfile')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
