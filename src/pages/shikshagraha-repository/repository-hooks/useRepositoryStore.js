// repository-store.js
import { create } from "zustand";
import {
  listMedia,
  getMediaById,
  searchSimilarMedia,
  getMasterList,
} from "./../repository-api/index";

/**
 * Zustand store for Media Repository
 * Manages media list, single media detail, filters, pagination, loading states.
 */
export const useRepositoryStore = create((set, get) => ({
  // State
  mediaList: [],
  mediaCount: 0,
  mediaNext: null,
  mediaPrevious: null,
  selectedMedia: null,
  masterList: null,
  loadingList: false,
  loadingDetail: false,
  loadingMaster: false,
  filters: {}, // current filters object (media_type, priority, tag, etc.)
  q: "",
  searchInput: "", // current value in search textarea (not submitted yet)
  pagination: {
    limit: 12,
    offset: 0,
  },
  sortBy: "-created_at",

  // Actions
  /**
   * Fetch media list with current filters, pagination, sorting
   * @param {Object} params - Optional override parameters
   */
  fetchMediaList: async (params = {}) => {
    set({ loadingList: true });
    try {
      const { filters, pagination, sortBy, q } = get();
      const transformedFilters = get().getTransformedFilters(filters);
      const queryParams = {
        q: q || null,
        ...transformedFilters,
        ...pagination,
        ordering: sortBy,
        ...params,
      };
      const data = await listMedia(queryParams);
      set({
        mediaList: data.results,
        mediaCount: data.count,
        mediaNext: data.next,
        mediaPrevious: data.previous,
      });
    } catch (error) {
      console.error("Error fetching media list:", error);
    } finally {
      set({ loadingList: false });
    }
  },

  /**
   * Fetch single media details by ID
   * @param {number|string} id - Media ID
   */
  fetchMediaDetail: async (id) => {
    if (!id) return;
    set({ loadingDetail: true });
    try {
      const media = await getMediaById(id);
      set({ selectedMedia: media });
    } catch (error) {
      console.error("Error fetching media detail:", error);
    } finally {
      set({ loadingDetail: false });
    }
  },

  /**
   * Search media via similarity search API
   * @param {Object} params - Similarity search params (q, limit, etc.)
   */
  searchMediaSimilar: async (params = {}) => {
    set({ loadingList: true });
    try {
      const { filters, pagination, sortBy } = get();
      const queryParams = {
        ...filters,
        ...pagination,
        ordering: sortBy,
        ...params,
      };
      const data = await searchSimilarMedia(queryParams);
      set({
        mediaList: data.results,
        mediaCount: data.count,
        mediaNext: data.next,
        mediaPrevious: data.previous,
      });
    } catch (error) {
      console.error("Error searching similar media:", error);
    } finally {
      set({ loadingList: false });
    }
  },

  /**
   * Fetch master list data for filters
   */
  fetchMasterList: async () => {
    set({ loadingMaster: true });
    try {
      const master = await getMasterList();

      const dropdown_meta = [
        {
          key: "organizations",
          label: "Organization",
          options: master?.organizations?.map((x) => ({ value: x?.slug, display: x?.name })),
        },
        {
          key: "tags",
          label: "Categories",
          options: master?.tags?.map((x) => ({
            value: x?.name,
            display: x?.name,
          })),
        },
        {
          key: "resource_types",
          label: "Resource Type",
          options: master?.resource_types?.map((x) => ({
            value: x?.value,
            display: x?.display,
          })),
        },
        {
          key: "media_types",
          label: "File Type",
          options: master?.media_types?.map((x) => ({
            value: x?.value,
            display: x?.display,
          })),
        },
      ];

      set({ masterList: dropdown_meta });
    } catch (error) {
      console.error("Error fetching master list:", error);
    } finally {
      set({ loadingMaster: false });
    }
  },

  /**
   * Update filters and optionally reset pagination
   * @param {Object} newFilters - Filter updates to merge
   * @param {boolean} resetPagination - Whether to reset offset to 0 (default true)
   */
  setFilters: (newFilters, resetPagination = true) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: resetPagination
        ? { ...state.pagination, offset: 0 }
        : state.pagination,
    }));
    get().fetchMediaList();
  },
  /**
   * Reset filters to empty object
   */
  resetFilters: () => {
    set({ filters: {} });
    get().fetchMediaList();
  },
  /**
   * Update search input value (textarea value, not submitted yet)
   * @param {string} newSearchInput - Current textarea value
   */
  setSearchInput: (newSearchInput) => {
    set({ searchInput: newSearchInput });
  },
  /**
   * Update filters and optionally reset pagination
   * @param {Object} newFilters - Filter updates to merge
   * @param {boolean} resetPagination - Whether to reset offset to 0 (default true)
   */
  setSearch: (newSearch, resetPagination = true) => {
    set((state) => ({
      ...state,
      q: newSearch,
      searchInput: newSearch, // sync searchInput with submitted search
      pagination: resetPagination
        ? { ...state.pagination, offset: 0 }
        : state.pagination,
    }));
    get().fetchMediaList();
  },
  /**
   * Set pagination parameters
   * @param {Object} newPagination - e.g. { offset: 20, limit: 10 }
   */
  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
    get().fetchMediaList();
  },
  /**
   * Set sort order string
   * @param {string} newSortBy - e.g. '-created_at'
   */
  setSortBy: (newSortBy) => {
    set({ sortBy: newSortBy });
    get().fetchMediaList();
  },
  getTransformedFilters: (filters) => {
    const transformedFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        acc[key] = value.map((x) => x.value).join(",");
        return acc;
      },
      {}
    );
    return transformedFilters;
  },
}));
