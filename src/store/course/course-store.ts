import { create } from "zustand";

type CourseView = "grid" | "table";

type CourseUIState = {
  selectedCourseId: string | null;
  isCreateDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  search: string;
  activeOnly: boolean;
  view: CourseView;

  setSelectedCourseId: (id: string | null) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setSearch: (search: string) => void;
  setActiveOnly: (activeOnly: boolean) => void;
  setView: (view: CourseView) => void;
  resetFilters: () => void;
};

export const useCourseUIStore = create<CourseUIState>()((set) => ({
  selectedCourseId: null,
  isCreateDialogOpen: false,
  isDeleteDialogOpen: false,
  search: "",
  activeOnly: true,
  view: "grid",

  setSelectedCourseId: (id) => set({ selectedCourseId: id }),

  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),

  setDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

  setSearch: (search) => set({ search }),

  setActiveOnly: (activeOnly) => set({ activeOnly }),

  setView: (view) => set({ view }),

  resetFilters: () =>
    set({
      search: "",
      activeOnly: true,
    }),
}));
