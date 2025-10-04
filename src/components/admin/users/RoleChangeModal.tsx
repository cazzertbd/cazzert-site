import { Modal } from "@/components/ui/Modal";
import { useAstroAction } from "@/hooks/useAstroAction";
import { actions } from "astro:actions";
import { useState } from "react";
import { MdPerson, MdSecurity } from "react-icons/md";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
}

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRoleChanged: () => void;
}

export function RoleChangeModal({
  isOpen,
  onClose,
  user,
  onRoleChanged,
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">(
    user?.role || "USER",
  );
  const { execute: changeRole, isPending } = useAstroAction(
    actions.adminUsers.changeRole,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("role", selectedRole);

      const result = await changeRole(formData);

      if (result.data?.success) {
        onRoleChanged();
        onClose();
      }
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setSelectedRole(user?.role || "USER");
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change User Role"
      size="md"
      closeOnOverlayClick={!isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="bg-bg border-border/20 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
              <MdPerson className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-text-base font-medium">
                {user.name || "Unknown User"}
              </h3>
              <p className="text-text-muted text-sm">{user.email}</p>
              <p className="text-text-subtle text-xs">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          <label className="text-text-base block text-sm font-semibold">
            Select New Role
          </label>

          <div className="space-y-3">
            {/* User Role */}
            <label className="border-border/20 hover:bg-bg/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
              <input
                type="radio"
                name="role"
                value="USER"
                checked={selectedRole === "USER"}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "USER" | "ADMIN")
                }
                className="text-primary focus:ring-primary/30 mt-1"
                disabled={isPending}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MdPerson className="text-text-muted h-4 w-4" />
                  <span className="text-text-base font-medium">User</span>
                </div>
                <p className="text-text-muted mt-1 text-sm">
                  Standard user with basic access to shop and place orders
                </p>
              </div>
            </label>

            {/* Admin Role */}
            <label className="border-border/20 hover:bg-bg/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors">
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={selectedRole === "ADMIN"}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "USER" | "ADMIN")
                }
                className="text-primary focus:ring-primary/30 mt-1"
                disabled={isPending}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MdSecurity className="text-primary h-4 w-4" />
                  <span className="text-text-base font-medium">
                    Administrator
                  </span>
                </div>
                <p className="text-text-muted mt-1 text-sm">
                  Full access to admin panel, user management, and system
                  settings
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Warning */}
        {selectedRole === "ADMIN" && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/20">
            <div className="flex items-start gap-2">
              <MdSecurity className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Admin Role Warning
                </p>
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  This user will have full administrative access to the system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="border-border/20 text-text-muted hover:bg-bg hover:text-text-base flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || selectedRole === user.role}
            className="bg-primary hover:bg-primary-dark flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Role"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
