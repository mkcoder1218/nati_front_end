"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Edit,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchAllUsers, deleteUser, updateUserRole } from "@/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translation-context";
import { toast } from "sonner";
import { format } from "date-fns";
import { User as UserType, UpdateRoleData } from "@/services/user.service";

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<{
    userId: string;
    currentRole: string;
    newRole: string;
  } | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteUser(userToDelete)).unwrap();
      toast.success(t("user_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(t("failed_to_delete_user"));
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!userToChangeRole) return;

    setIsChangingRole(true);
    try {
      const data: UpdateRoleData = {
        role: userToChangeRole.newRole as "citizen" | "official" | "admin",
      };
      await dispatch(
        updateUserRole({ userId: userToChangeRole.userId, data })
      ).unwrap();
      toast.success(t("user_role_updated_successfully"));
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error(t("failed_to_update_user_role"));
    } finally {
      setIsChangingRole(false);
      setUserToChangeRole(null);
    }
  };

  // Get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "official":
        return "default";
      case "citizen":
      default:
        return "secondary";
    }
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin":
        return t("admin");
      case "official":
        return t("government_official");
      case "citizen":
        return t("citizen");
      default:
        return role;
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("manage_users")}</h2>
          <p className="text-muted-foreground">
            {t("manage_users_description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("add_new_user")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search_users")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterRole}
          onValueChange={setFilterRole}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("filter_by_role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_roles")}</SelectItem>
            <SelectItem value="admin">{t("admin")}</SelectItem>
            <SelectItem value="official">{t("government_official")}</SelectItem>
            <SelectItem value="citizen">{t("citizen")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              {t("error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchAllUsers())}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-center text-muted-foreground">
              {searchTerm || filterRole !== "all"
                ? t("no_matching_users")
                : t("no_users_yet")}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              asChild
            >
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("add_first_user")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("contact")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("joined")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.user_id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {user.phone_number || t("not_provided")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplay(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? format(new Date(user.created_at), "MMM d, yyyy")
                        : t("unknown")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.user_id}`}>
                              <User className="mr-2 h-4 w-4" />
                              {t("view_profile")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.user_id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit_user")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setUserToChangeRole({
                                userId: user.user_id,
                                currentRole: user.role,
                                newRole: user.role,
                              })
                            }
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {t("change_role")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setUserToDelete(user.user_id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("delete_user")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_user")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_user_warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("delete")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog
        open={!!userToChangeRole}
        onOpenChange={(open) => !open && setUserToChangeRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("change_user_role")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("change_role_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={userToChangeRole?.newRole || ""}
              onValueChange={(value) =>
                setUserToChangeRole(
                  userToChangeRole
                    ? { ...userToChangeRole, newRole: value }
                    : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("select_new_role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("admin")}</SelectItem>
                <SelectItem value="official">{t("government_official")}</SelectItem>
                <SelectItem value="citizen">{t("citizen")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRole}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              disabled={
                isChangingRole ||
                !userToChangeRole ||
                userToChangeRole.currentRole === userToChangeRole.newRole
              }
            >
              {isChangingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("confirm")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
