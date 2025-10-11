import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { UserPlus, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminCreate() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "team"
  });

  // Check user permission on component mount
  useEffect(() => {
    const currentUserRole = localStorage.getItem('adminRole') || 'team';
    const canCreateAdmin = currentUserRole === 'superadmin' || currentUserRole === 'admin';
    setHasPermission(canCreateAdmin);
    
    if (!canCreateAdmin) {
      toast({
        title: t("accessDenied") || "Access Denied",
        description: t("insufficientPermissions") || "You don't have permission to perform this action",
        variant: "destructive",
      });
    }
  }, [t, toast]);

  const createAdminMutation = useMutation({
    mutationFn: async (adminData: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      role: string;
    }) => {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create admin");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("success") || "Success",
        description: t("adminCreatedSuccessfully") || "Admin created successfully",
      });
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "team"
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseFillAllFields") || "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("error") || "Error",
        description: t("passwordsDoNotMatch") || "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t("error") || "Error",
        description: t("passwordMustBeAtLeast6Characters") || "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Create admin
    createAdminMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role
    });
  };

  // Show access denied message if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('accessDenied') || 'Access Denied'}
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                {t('insufficientPermissions') || 'You don\'t have permission to perform this action'}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {t('adminCreateAccessNote') || 'Only Super Admin and Admin roles can create new administrators.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              {t('adminCreate') || 'Create Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-muted-foreground">
                    {t('username') || 'Username'} *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder={t('enterUsername') || 'Enter username'}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-muted-foreground">
                    {t('email') || 'Email'} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('enterEmail') || 'Enter email'}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fullName" className="text-muted-foreground">
                  {t('fullName') || 'Full Name'} *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder={t('enterFullName') || 'Enter full name'}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-muted-foreground">
                  {t('role') || 'Role'} *
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('selectRole') || 'Select Role'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">{t('superadmin') || 'Super Admin'}</SelectItem>
                    <SelectItem value="admin">{t('admin') || 'Admin'}</SelectItem>
                    <SelectItem value="team">{t('team') || 'Team'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-muted-foreground">
                    {t('password') || 'Password'} *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder={t('enterPassword') || 'Enter password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-muted-foreground">
                    {t('confirmPassword') || 'Confirm Password'} *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder={t('confirmPassword') || 'Confirm password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="px-8"
                  disabled={createAdminMutation.isPending}
                >
                  {createAdminMutation.isPending ? (t('creating') || 'Creating...') : (t('createAdmin') || 'Create Admin')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
