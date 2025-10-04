import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit, MdPerson, MdSecurity } from "react-icons/md";
import { RoleChangeModal } from "./RoleChangeModal";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
}

interface CurrentUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
}

interface UserManagementProps {
  currentUser: CurrentUser;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { execute: getUsers, isPending: isLoading } = useAstroAction(
    actions.adminUsers.getAll,
  );
  const { execute: removeUser, isPending: isRemoving } = useAstroAction(
    actions.adminUsers.remove,
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await getUsers({});
      if (result.data?.success && result.data.users) {
        setUsers(result.data.users);
      } else {
        console.error("Failed to load users:", result.data?.error);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleRoleChange = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRemoveUser = async (user: User) => {
    if (
      !confirm(`Are you sure you want to remove ${user.name || user.email}?`)
    ) {
      return;
    }

    try {
      const result = await removeUser({ userId: user.id });
      if (result.data?.success) {
        await loadUsers();
      } else {
        alert(result.data?.error || "Failed to remove user");
      }
    } catch (error) {
      console.error("Error removing user:", error);
      alert("An error occurred while removing the user");
    }
  };

  // Check if user is the current user
  const isCurrentUser = (user: User) => {
    return currentUser.id === user.id;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "ADMIN" ? "warning" : "default";
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? (
      <MdSecurity className="h-3 w-3" />
    ) : (
      <MdPerson className="h-3 w-3" />
    );
  };

  // Generate actions for each user
  const getUserActions = (user: User) => [
    {
      label: "Change Role",
      icon: <MdEdit className="h-4 w-4" />,
      onClick: () => handleRoleChange(user),
    },
    {
      label: isRemoving ? "Removing..." : "Remove User",
      icon: <MdDelete className="h-4 w-4" />,
      onClick: () => handleRemoveUser(user),
      disabled: isRemoving,
      variant: "danger" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full">
            <MdPerson className="text-primary h-6 w-6" />
          </div>
          <p className="text-text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-base font-Secondary text-2xl font-bold">
            User Management
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Manage user roles and permissions for your bakery
          </p>
          {/* Show current admin info */}
          <p className="text-text-subtle mt-2 text-xs">
            Logged in as:{" "}
            <span className="font-medium">
              {currentUser.name || currentUser.email}
            </span>
          </p>
        </div>
        <div className="text-text-subtle flex items-center gap-2 text-sm">
          <span>Total Users:</span>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 font-semibold">
            {users.length}
          </span>
        </div>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="flex">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isCurrent = isCurrentUser(user);

                return (
                  <TableRow key={user.id}>
                    {/* User - Left aligned */}
                    <TableCell align="left">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                          {user.name ? (
                            user.name
                              .split(" ")
                              .map((n) => n.charAt(0))
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          ) : (
                            <MdPerson className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-text-base font-medium">
                              {user.name || "Unknown User"}
                            </p>
                            {isCurrent && (
                              <span className="bg-primary-light/30 text-primary-dark border-primary-light/50 dark:bg-primary/20 dark:text-primary-light dark:border-primary/30 rounded-full border px-2 py-1 text-xs font-medium">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell align="center">
                      <code className="text-text-muted bg-bg rounded px-2 py-1 text-xs">
                        {user.email}
                      </code>
                    </TableCell>

                    {/* Role */}
                    <TableCell align="center">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        <span className="flex items-center justify-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </Badge>
                    </TableCell>

                    {/* Joined */}
                    <TableCell align="center">
                      <span className="text-text-subtle text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>

                    {/* Actions - Right aligned */}
                    <TableCell align="right">
                      {isCurrent ? (
                        <div className="flex justify-end">
                          <span className="text-text-subtle text-xs italic">
                            Cannot modify self
                          </span>
                        </div>
                      ) : (
                        <ActionsDropdown
                          actions={getUserActions(user)}
                          isLoading={isRemoving}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-bg-alt border-border/20 rounded-lg border p-12 text-center">
          <MdPerson className="text-text-subtle mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text-base mb-2 font-medium">No Users Found</h3>
          <p className="text-text-muted text-sm">
            No registered users to display at the moment.
          </p>
        </div>
      )}

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={selectedUser}
        onRoleChanged={loadUsers}
      />
    </div>
  );
}
