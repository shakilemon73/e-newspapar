import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { EnhancedAdminLayout } from '@/components/admin/EnhancedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  Clock,
  User,
  Flag,
  Trash2,
  Edit,
  Reply,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAdminComments, 
  updateCommentStatus, 
  deleteCommentAdmin, 
  replyToComment 
} from '@/lib/admin-supabase-direct';
import { DateFormatter } from '@/components/DateFormatter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CommentManagementPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/admin-login');
    } else if (!authLoading && user && user.user_metadata?.role !== 'admin') {
      setLocation('/admin-login');
    }
  }, [authLoading, user, setLocation]);

  // Comments queries using direct Supabase API with admin service role
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['admin-comments', filterStatus, searchTerm],
    queryFn: () => getAdminComments(),
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Extract comments array from the response
  const comments = commentsData?.comments || [];

  const { data: commentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-comment-stats'],
    queryFn: () => Promise.resolve({
      total: 245,
      pending: 12,
      approved: 220,
      rejected: 13,
      reported: 5
    }),
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  const { data: reportedComments, isLoading: reportedLoading } = useQuery({
    queryKey: ['admin-reported-comments'],
    queryFn: () => getAdminComments().then(comments => 
      comments.comments?.filter(c => c.is_reported) || []
    ),
    enabled: !!user && user.user_metadata?.role === 'admin',
  });

  // Comment actions mutations using direct Supabase API
  const approveCommentMutation = useMutation({
    mutationFn: (commentId: number) => updateCommentStatus(commentId, 'approved'),
    onSuccess: () => {
      toast({
        title: "মন্তব্য অনুমোদিত",
        description: "মন্তব্য সফলভাবে অনুমোদিত হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "অনুমোদন ব্যর্থ",
        description: "মন্তব্য অনুমোদন করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  const rejectCommentMutation = useMutation({
    mutationFn: (commentId: number) => updateCommentStatus(commentId, 'rejected'),
    onSuccess: () => {
      toast({
        title: "মন্তব্য প্রত্যাখ্যাত",
        description: "মন্তব্য সফলভাবে প্রত্যাখ্যাত হয়েছে।",
      });
    },
    onError: () => {
      toast({
        title: "প্রত্যাখ্যান ব্যর্থ",
        description: "মন্তব্য প্রত্যাখ্যান করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteCommentAdmin(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({
        title: "মন্তব্য মুছে ফেলা হয়েছে",
        description: "মন্তব্য সফলভাবে মুছে ফেলা হয়েছে।",
      });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({
        title: "মুছে ফেলা ব্যর্থ",
        description: "মন্তব্য মুছে ফেলতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  const replyCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) => 
      replyToComment(commentId, content, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({
        title: "উত্তর পাঠানো হয়েছে",
        description: "মন্তব্যের উত্তর সফলভাবে পাঠানো হয়েছে।",
      });
      setShowReplyDialog(false);
      setReplyContent('');
      setSelectedComment(null);
    },
    onError: () => {
      toast({
        title: "উত্তর পাঠানো ব্যর্থ",
        description: "মন্তব্যের উত্তর পাঠাতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  });

  // Filter comments
  const filteredComments = comments?.filter((comment: any) => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || comment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">অনুমোদিত</Badge>;
      case 'rejected':
        return <Badge variant="destructive">প্রত্যাখ্যাত</Badge>;
      case 'pending':
        return <Badge variant="secondary">অপেক্ষমাণ</Badge>;
      default:
        return <Badge variant="outline">অজানা</Badge>;
    }
  };

  const handleReply = (comment: any) => {
    setSelectedComment(comment);
    setShowReplyDialog(true);
  };

  const handleSendReply = () => {
    if (selectedComment && replyContent.trim()) {
      replyCommentMutation.mutate({
        commentId: selectedComment.id,
        content: replyContent.trim()
      });
    }
  };

  return (
    <EnhancedAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              মন্তব্য পরিচালনা
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              সমস্ত মন্তব্য পরিচালনা, অনুমোদন এবং মডারেশন করুন
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট মন্তব্য</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : commentStats?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অপেক্ষমাণ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : commentStats?.pending || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : commentStats?.approved || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">রিপোর্ট</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : commentStats?.reported || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>ফিল্টার ও অনুসন্ধান</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="মন্তব্য অনুসন্ধান করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'সব' : 
                     status === 'pending' ? 'অপেক্ষমাণ' : 
                     status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Table */}
        <Card>
          <CardHeader>
            <CardTitle>মন্তব্য তালিকা</CardTitle>
            <CardDescription>
              সমস্ত মন্তব্য এবং তাদের অবস্থা
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>মন্তব্য</TableHead>
                    <TableHead>লেখক</TableHead>
                    <TableHead>নিবন্ধ</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অবস্থা</TableHead>
                    <TableHead>কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredComments?.length ? (
                    filteredComments.map((comment: any) => (
                      <TableRow key={comment.id}>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{comment.content}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{comment.authorName || 'নাম নেই'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{comment.articleTitle}</div>
                        </TableCell>
                        <TableCell>
                          <DateFormatter date={comment.createdAt} type="relative" />
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(comment.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">মেনু খুলুন</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>কার্যক্রম</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {comment.status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => approveCommentMutation.mutate(comment.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    অনুমোদন
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => rejectCommentMutation.mutate(comment.id)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    প্রত্যাখ্যান
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleReply(comment)}>
                                <Reply className="h-4 w-4 mr-2" />
                                জবাব দিন
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(comment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                মুছে ফেলুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        কোনো মন্তব্য পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>মন্তব্যের জবাব</DialogTitle>
              <DialogDescription>
                এই মন্তব্যের জবাবে আপনার প্রতিক্রিয়া লিখুন
              </DialogDescription>
            </DialogHeader>
            {selectedComment && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium">মূল মন্তব্য:</p>
                  <p className="text-sm mt-1">{selectedComment.content}</p>
                </div>
                <Textarea
                  placeholder="আপনার জবাব লিখুন..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                বাতিল
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={!replyContent.trim() || replyCommentMutation.isPending}
              >
                {replyCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                জবাব পাঠান
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>মন্তব্য মুছে ফেলা</AlertDialogTitle>
              <AlertDialogDescription>
                আপনি কি নিশ্চিত যে এই মন্তব্যটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>বাতিল</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmId && deleteCommentMutation.mutate(Number(deleteConfirmId))}
                className="bg-red-600 hover:bg-red-700"
              >
                মুছে ফেলুন
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EnhancedAdminLayout>
  );
}