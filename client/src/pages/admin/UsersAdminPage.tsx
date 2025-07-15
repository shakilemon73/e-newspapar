import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck,
  AlertCircle,
  Mail,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DateFormatter } from '@/components/DateFormatter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const userColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { 
    key: 'email', 
    label: 'User', 
    sortable: true,
    render: (value: string, row: any) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.avatar_url} />
          <AvatarFallback>
            {row.name ? row.name.charAt(0).toUpperCase() : value.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.name || value}</div>
          <div className="text-sm text-muted-foreground">{value}</div>
        </div>
      </div>
    )
  },
  { 
    key: 'role', 
    label: 'Role', 
    sortable: true,
    render: (value: string) => (
      <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
        {value === 'admin' ? (
          <><ShieldCheck className="h-3 w-3 mr-1" /> Admin</>
        ) : (
          <><Users className="h-3 w-3 mr-1" /> User</>
        )}
      </Badge>
    )
  },
  { 
    key: 'created_at', 
    label: 'Joined', 
    sortable: true,
    render: (value: string) => <DateFormatter date={value} type="relative" />
  },
  { 
    key: 'last_sign_in_at', 
    label: 'Last Active', 
    sortable: true,
    render: (value: string) => value ? <DateFormatter date={value} type="relative" /> : 'Never'
  },
];

export default function UsersAdminPage() {
  const { toast } = useToast();
  const [roleChangeDialog, setRoleChangeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<string>('');

  // Fetch users from Supabase auth
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Get user statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/users/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats');
      if (!response.ok) {
        // Calculate stats from users data
        const totalUsers = Array.isArray(users) ? users.length : 0;
        const adminUsers = Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0;
        const activeUsers = Array.isArray(users) ? users.filter(u => {
          const lastSignIn = new Date(u.last_sign_in_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastSignIn > thirtyDaysAgo;
        }).length : 0;
        const newUsers = Array.isArray(users) ? users.filter(u => {
          const createdAt = new Date(u.created_at);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return createdAt > sevenDaysAgo;
        }).length : 0;
        
        return { totalUsers, adminUsers, activeUsers, newUsers };
      }
      return response.json();
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
      if (!res.ok) throw new Error('Failed to update user role');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User role updated',
        description: 'The user role has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setRoleChangeDialog(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleChangeRole = (user: any, role: string) => {
    setSelectedUser(user);
    setNewRole(role);
    setRoleChangeDialog(true);
  };

  const handleDeleteUser = (user: any) => {
    if (confirm(`Are you sure you want to delete user "${user.email}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const UserActions = ({ user }: { user: any }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
          Copy email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleChangeRole(user, user.role === 'admin' ? 'user' : 'admin')}
        >
          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleDeleteUser(user)}
          className="text-red-600"
        >
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Enhanced columns with actions
  const enhancedColumns = [
    ...userColumns,
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => <UserActions user={row} />
    }
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Users
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while loading users'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.adminUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Admin privileges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Joined this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users || []}
              columns={enhancedColumns}
              searchPlaceholder="Search users..."
              loading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Role Change Confirmation Dialog */}
        <AlertDialog open={roleChangeDialog} onOpenChange={setRoleChangeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change User Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the role of "{selectedUser?.email}" to "{newRole}"?
                This will {newRole === 'admin' ? 'grant admin privileges' : 'remove admin privileges'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && updateRoleMutation.mutate({ 
                  userId: selectedUser.id, 
                  role: newRole 
                })}
              >
                Change Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}