import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function CreateCustomer() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    admin: "",
    loginUserName: "",
    customerName: "",
    recommendBy: "",
    password: "",
    phoneNumber: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password
    }));
  };

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      console.log("🚀 Sending customer data to MongoDB:", customerData);
      const response = await apiRequest("POST", "/api/frontend/users", customerData);
      console.log("✅ Response from MongoDB:", response);
      return response;
    },
    onSuccess: (response: any) => {
      console.log("✅ Customer created successfully in MongoDB:", response);
      
      // Extract customer data from response
      const customerData = response?.data || response;
      const customerName = customerData?.name || formData.customerName;
      const membershipId = customerData?.membershipId || "N/A";
      
      console.log("📊 Customer data:", { customerName, membershipId, fullResponse: response });
      
      // Invalidate and refetch queries to refresh customer list
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/frontend/users"] });
      
      toast({
        title: "✅ Success!",
        description: `Customer "${customerName}" created successfully in MongoDB with ID: ${membershipId}`,
        duration: 5000,
      });
      
      // Wait a bit before redirecting to show the success message and ensure data is refreshed
      setTimeout(async () => {
        // Force one more refetch before navigation
        await queryClient.refetchQueries({ queryKey: ["/api/frontend/users"] });
        setLocation("/customer-management");
      }, 2000);
    },
    onError: (error: any) => {
      console.error("❌ Error creating customer:", error);
      
      const errorMessage = error?.message || error?.error || "Failed to create customer in MongoDB";
      
      toast({
        title: "❌ Error!",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📋 Form data:", formData);
    
    // Validate required fields
    if (!formData.loginUserName || !formData.customerName || !formData.password) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please fill in Login User Name, Customer Name, and Password (all required fields marked with *)",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Prepare data for MongoDB
    const customerData = {
      name: formData.customerName,
      email: formData.loginUserName.includes('@') 
        ? formData.loginUserName 
        : formData.loginUserName + "@customer.com", // Generate email from username
      password: formData.password,
      phoneNumber: formData.phoneNumber || "",
      referralCode: formData.recommendBy || undefined,
      level: 'Bronze'
    };

    console.log("📤 Submitting customer data to MongoDB:", customerData);
    createCustomerMutation.mutate(customerData);
  };

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
          <h2 className="text-xl font-semibold">{t('createCustomer')}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">* {t('admin')} :</Label>
                <Select value={formData.admin} onValueChange={(value) => handleInputChange("admin", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('pleaseSelectAdmin')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">TEAM 1 - RUPEE</SelectItem>
                    <SelectItem value="team2">TEAM 2 - ADMIN</SelectItem>
                    <SelectItem value="team3">TEAM 3 - MANAGER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground">* {t('loginUserName')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.loginUserName}
                  onChange={(e) => handleInputChange("loginUserName", e.target.value)}
                  placeholder={t('enterLoginUsername')}
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">* {t('customerName')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder={t('enterCustomerName')}
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">{t('recommendBy')} :</Label>
                <Input
                  className="mt-1"
                  value={formData.recommendBy}
                  onChange={(e) => handleInputChange("recommendBy", e.target.value)}
                  placeholder={t('enterReferralCode')}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">* {t('password')} :</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={t('enterPassword')}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    onClick={generatePassword}
                    className="px-4"
                  >
                    {t('autoGenerate')}
                  </Button>
                </div>
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
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              className="px-8"
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? t('creating') : t('confirmCreateCustomer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
