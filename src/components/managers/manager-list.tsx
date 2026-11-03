"use client";

import { useMemo, useState } from "react";

import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Mail,
  Phone,
  Hash,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";

import {
  useGetAllManagers,
  useDeleteManagerProfile,
} from "@/hooks/academic/use-managers";

import ManagerForm from "./manager-form";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type Manager = {
  managerProfileId: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneNumber?: string | null;
  employeeCode: string;
  image?: string | null;
  avatarFileId?: string | null;
};

// ==================================================
// LOADING SKELETON
// ==================================================

function ManagerListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading managers" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

// ==================================================
// EMPTY STATE
// ==================================================

function ManagerEmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Users className="size-7 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          {isSearching ? "No matching managers" : "No managers yet"}
        </h3>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different name, email or employee code."
            : "Manager profiles will appear here when they are available."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// ERROR STATE
// ==================================================

function ManagerErrorState({
  onRetry,
  isFetching,
  message,
}: {
  onRetry: () => void;
  isFetching: boolean;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="size-7 text-destructive" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          Failed to load managers
        </h3>

        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Button variant="outline" onClick={onRetry} disabled={isFetching}>
        <RefreshCw
          className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
        />

        {isFetching ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}

// ==================================================
// DELETE CONFIRMATION
// ==================================================

function DeleteManagerDialog({
  manager,
  isDeleting,
  onClose,
  onConfirm,
}: {
  manager: Manager | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={Boolean(manager)}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>

          <AlertDialogTitle>Delete Manager?</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {manager?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Delete Manager
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ==================================================
// MANAGER LIST
// ==================================================

export default function ManagerList() {
  // --------------------------------------------------
  // Queries
  // --------------------------------------------------

  const {
    data: managers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllManagers();

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  const deleteManagerMutation = useDeleteManagerProfile();

  const isDeleting = deleteManagerMutation.isPending;

  // --------------------------------------------------
  // States
  // --------------------------------------------------

  const [search, setSearch] = useState("");

  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  // --------------------------------------------------
  // Search & Filter
  // --------------------------------------------------

  const filteredManagers = useMemo(() => {
    const list = (managers ?? []) as Manager[];

    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((manager) =>
      [
        manager.name,
        manager.email,
        manager.phone,
        manager.phoneNumber,
        manager.employeeCode,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [managers, search]);

  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------

  function handleRefresh() {
    void refetch();
  }

  // --------------------------------------------------
  // Delete Manager
  // --------------------------------------------------

  async function handleDeleteManager() {
    if (!managerToDelete || isDeleting) return;

    try {
      await deleteManagerMutation.mutateAsync(managerToDelete.managerProfileId);

      toast.success("Manager deleted successfully.");

      setManagerToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete manager. Please try again.",
      );
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <>
      <Card className="rounded-card border-border/70 bg-card shadow-sm">
        {/* Header */}

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              Managers
            </CardTitle>

            <CardDescription>
              Manage manager profiles and their associated information.
            </CardDescription>
          </div>

          {/* Search */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search managers..."
              className="h-10 rounded-input bg-background pl-9"
              aria-label="Search managers"
            />
          </div>
        </CardHeader>

        {/* Content */}

        <CardContent>
          {/* Loading */}

          {isLoading ? (
            <ManagerListSkeleton />
          ) : isError ? (
            <ManagerErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching managers."
              }
              onRetry={handleRefresh}
              isFetching={isFetching}
            />
          ) : (
            <>
              {/* Results Toolbar */}

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    {filteredManagers.length}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {filteredManagers.length === 1
                      ? "Manager found"
                      : "Managers found"}
                  </span>

                  {isFetching && (
                    <span
                      className="text-xs text-muted-foreground"
                      aria-live="polite"
                    >
                      Updating...
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFetching}
                  onClick={handleRefresh}
                  className="w-fit rounded-button"
                >
                  <RefreshCw
                    className={`mr-2 size-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Empty State */}

              {filteredManagers.length === 0 ? (
                <ManagerEmptyState isSearching={Boolean(search.trim())} />
              ) : (
                /* Managers Table */

                <div className="relative w-full max-w-full max-h-[500px] overflow-auto rounded-section border border-border">
                  <Table className="min-w-[800px] w-full">
                    <TableHeader className="sticky top-0 z-10 border-separate border-spacing-0 bg-muted shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-40 whitespace-nowrap font-semibold">
                          Manager
                        </TableHead>

                        <TableHead className="min-w-56 whitespace-nowrap font-semibold">
                          Email
                        </TableHead>

                        <TableHead className="min-w-36 whitespace-nowrap font-semibold">
                          Phone
                        </TableHead>

                        <TableHead className="min-w-36 whitespace-nowrap font-semibold">
                          Employee ID
                        </TableHead>

                        <TableHead className="w-16 whitespace-nowrap text-right font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredManagers.map((manager) => (
                        <TableRow
                          key={manager.managerProfileId}
                          className="transition-colors hover:bg-accent/40"
                        >
                          {/* Manager Name */}

                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary">
                                {manager.name?.charAt(0)?.toUpperCase() || "M"}
                              </div>

                              <span className="font-medium text-foreground">
                                {manager.name || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Email */}

                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="size-4 shrink-0" />

                              <span>{manager.email || "—"}</span>
                            </div>
                          </TableCell>

                          {/* Phone */}

                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-foreground">
                              <Phone className="size-4 shrink-0 text-muted-foreground" />

                              {manager.phoneNumber ?? manager.phone ?? "—"}
                            </div>
                          </TableCell>

                          {/* Employee Code */}

                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className="gap-1 border-0 bg-accent text-accent-foreground"
                            >
                              <Hash className="size-3" />

                              {manager.employeeCode || "—"}
                            </Badge>
                          </TableCell>

                          {/* Actions */}

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={`Actions for ${manager.name}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                }
                              />

                              <DropdownMenuContent align="end">
                                {/* Edit */}

                                <DropdownMenuItem
                                  onClick={() => setSelectedManager(manager)}
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </DropdownMenuItem>

                                {/* Delete */}

                                <DropdownMenuItem
                                  onClick={() => setManagerToDelete(manager)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ==========================================
          EDIT MANAGER
      ========================================== */}

      {selectedManager && (
        <ManagerForm
          key={selectedManager.managerProfileId}
          openOnMount
          hideTrigger
          initialData={{
            id: selectedManager.managerProfileId,
            name: selectedManager.name,
            email: selectedManager.email,
            phoneNumber:
              selectedManager.phoneNumber ?? selectedManager.phone ?? "",
            employeeCode: selectedManager.employeeCode,
            image: selectedManager.image ?? null,
            avatarFileId: selectedManager.avatarFileId ?? null,
          }}
          onSuccessCallback={() => {
            setSelectedManager(null);
          }}
          onCloseCallback={() => {
            setSelectedManager(null);
          }}
        />
      )}

      {/* ==========================================
          DELETE MANAGER
      ========================================== */}

      <DeleteManagerDialog
        manager={managerToDelete}
        isDeleting={isDeleting}
        onClose={() => setManagerToDelete(null)}
        onConfirm={handleDeleteManager}
      />
    </>
  );
}
