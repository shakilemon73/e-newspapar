import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Key, 
  Users, 
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Activity,
  Settings,
  UserCheck,
  UserX,
  Clock,
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SecurityAccessControlPage() {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User roles query
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/admin/user-roles'],
  });

  // Security audit logs query
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['/api/admin/security-audit-logs'],
  });

  // Access control policies query
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['/api/admin/access-control-policies'],
  });

  // Security settings query
  const { data: securitySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/security-settings'],
  });

  // Available permissions query
  const { data: availablePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/admin/available-permissions'],
  });

  // Create/Update role mutation
  const roleMutation = useMutation({
    mutationFn: (data: any) => {
      if (selectedRole) {
        return apiRequest(`/api/admin/user-roles/${selectedRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
      return apiRequest('/api/admin/user-roles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "ভূমিকা সংরক্ষিত",
        description: "ইউজার ভূমিকা সফলভাবে সংরক্ষিত হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-roles'] });
      setSelectedRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
    },
  });

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/security-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "নিরাপত্তা সেটিংস আপডেট হয়েছে",
        description: "নিরাপত্তা সেটিংস সফলভাবে আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-settings'] });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/user-roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "ভূমিকা মুছে ফেলা হয়েছে",
        description: "ইউজার ভূমিকা সফলভাবে মুছে ফেলা হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-roles'] });
    },
  });

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    roleMutation.mutate(roleForm);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    });
  };

  const handlePermissionToggle = (permission: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getAuditLogIcon = (action: string) => {
    switch (action) {
      case 'login': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'logout': return <UserX className="h-4 w-4 text-gray-500" />;
      case 'permission_denied': return <Lock className="h-4 w-4 text-red-500" />;
      case 'role_changed': return <Settings className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">নিরাপত্তা ও অ্যাক্সেস নিয়ন্ত্রণ</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              ইউজার ভূমিকা, অনুমতি এবং নিরাপত্তা নীতি ব্যবস্থাপনা
            </p>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভূমিকা</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {roles?.filter((role: any) => role.active).length || 0} সক্রিয়
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">নিরাপত্তা লগ</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {auditLogs?.filter((log: any) => log.level === 'warning').length || 0} সতর্কতা
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অ্যাক্সেস নীতি</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{policies?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {policies?.filter((policy: any) => policy.active).length || 0} সক্রিয়
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">নিরাপত্তা স্কোর</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securitySettings?.security_score || 85}%</div>
              <p className="text-xs text-muted-foreground">
                উচ্চ নিরাপত্তা স্তর
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles">ভূমিকা</TabsTrigger>
            <TabsTrigger value="audit">অডিট লগ</TabsTrigger>
            <TabsTrigger value="policies">নীতি</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedRole ? 'ভূমিকা সম্পাদনা' : 'নতুন ভূমিকা'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="role-name">ভূমিকার নাম</Label>
                      <Input
                        id="role-name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-description">বিবরণ</Label>
                      <Input
                        id="role-description"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>অনুমতি</Label>
                      <div className="space-y-2 mt-2">
                        {availablePermissions?.map((permission: any) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`permission-${permission.id}`}
                              checked={roleForm.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={roleMutation.isPending}
                        className="flex-1"
                      >
                        {roleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {selectedRole ? 'আপডেট করুন' : 'তৈরি করুন'}
                      </Button>
                      {selectedRole && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setSelectedRole(null);
                            setRoleForm({ name: '', description: '', permissions: [] });
                          }}
                        >
                          বাতিল
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Role List */}
              <Card>
                <CardHeader>
                  <CardTitle>ভূমিকার তালিকা</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roles?.map((role: any) => (
                      <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{role.name}</h4>
                            <Badge variant={role.active ? 'default' : 'secondary'}>
                              {role.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{role.description}</p>
                          <p className="text-xs text-gray-500">
                            {role.permissions?.length || 0} টি অনুমতি • {role.user_count || 0} জন ইউজার
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRoleMutation.mutate(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>নিরাপত্তা অডিট লগ</CardTitle>
                <CardDescription>
                  সিস্টেম নিরাপত্তা এবং অ্যাক্সেস লগ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getAuditLogIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.action}</span>
                          <Badge variant={log.level === 'warning' ? 'destructive' : 'outline'}>
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{log.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{log.user_email}</span>
                          <span>•</span>
                          <span>{log.ip_address}</span>
                          <span>•</span>
                          <span>{new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>অ্যাক্সেস নিয়ন্ত্রণ নীতি</CardTitle>
                <CardDescription>
                  সিস্টেম অ্যাক্সেস নিয়ন্ত্রণ এবং নিরাপত্তা নীতি
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies?.map((policy: any) => (
                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{policy.name}</h4>
                          <Badge variant={policy.active ? 'default' : 'secondary'}>
                            {policy.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                        <div className="text-xs text-gray-500">
                          প্রভাব: {policy.affected_roles?.join(', ')} • সর্বশেষ আপডেট: {new Date(policy.updated_at).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={policy.active}
                          onCheckedChange={(checked) => {
                            // Update policy status
                          }}
                        />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>নিরাপত্তা সেটিংস</CardTitle>
                <CardDescription>
                  সিস্টেম নিরাপত্তা এবং অ্যাক্সেস নিয়ন্ত্রণ সেটিংস
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">দুই-ফ্যাক্টর অথেন্টিকেশন</Label>
                      <p className="text-sm text-gray-600">অ্যাডমিনদের জন্য 2FA বাধ্যতামূলক</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={securitySettings?.two_factor_required}
                      onCheckedChange={(checked) => 
                        updateSecurityMutation.mutate({
                          ...securitySettings,
                          two_factor_required: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-timeout">সেশন টাইমআউট</Label>
                      <p className="text-sm text-gray-600">নিষ্ক্রিয়তার পর স্বয়ংক্রিয় লগআউট</p>
                    </div>
                    <Switch
                      id="session-timeout"
                      checked={securitySettings?.session_timeout_enabled}
                      onCheckedChange={(checked) => 
                        updateSecurityMutation.mutate({
                          ...securitySettings,
                          session_timeout_enabled: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ip-whitelist">IP হোয়াইটলিস্ট</Label>
                      <p className="text-sm text-gray-600">শুধুমাত্র অনুমোদিত IP থেকে অ্যাক্সেস</p>
                    </div>
                    <Switch
                      id="ip-whitelist"
                      checked={securitySettings?.ip_whitelist_enabled}
                      onCheckedChange={(checked) => 
                        updateSecurityMutation.mutate({
                          ...securitySettings,
                          ip_whitelist_enabled: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit-logging">অডিট লগিং</Label>
                      <p className="text-sm text-gray-600">সকল অ্যাডমিন অ্যাকশন লগ রাখা</p>
                    </div>
                    <Switch
                      id="audit-logging"
                      checked={securitySettings?.audit_logging_enabled}
                      onCheckedChange={(checked) => 
                        updateSecurityMutation.mutate({
                          ...securitySettings,
                          audit_logging_enabled: checked
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session-duration">সেশন সময়সীমা (মিনিট)</Label>
                      <Input
                        id="session-duration"
                        type="number"
                        value={securitySettings?.session_duration || 60}
                        onChange={(e) => updateSecurityMutation.mutate({
                          ...securitySettings,
                          session_duration: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-login-attempts">সর্বোচ্চ লগইন চেষ্টা</Label>
                      <Input
                        id="max-login-attempts"
                        type="number"
                        value={securitySettings?.max_login_attempts || 5}
                        onChange={(e) => updateSecurityMutation.mutate({
                          ...securitySettings,
                          max_login_attempts: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}