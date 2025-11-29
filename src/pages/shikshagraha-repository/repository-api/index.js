// repository-api.js
import axios from "axios"
import env from "../../../utils/env"

const API_BASE_URL = `${env.LOCAL_PROXY()}/api/v1/media`

const API_BASE_URL_V2 = `${env.LOCAL_PROXY()}/api/v2/media`

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

const apiClientV2 = axios.create({
  baseURL: API_BASE_URL_V2,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

/**
 * Fetch paginated list of media documents with optional filtering and sorting.
 *
 * @param {Object} params - Query parameters for filtering, pagination, sorting.
 * @param {number} [params.limit=100] - Number of items per page.
 * @param {number} [params.offset=0] - Number of items to skip for pagination.
 * @param {string} [params.media_type] - Filter by file type (e.g., 'application/pdf').
 * @param {string} [params.priority] - Filter by priority level (e.g., 'P1').
 * @param {string} [params.tag] - Filter by tag name (partial match).
 * @param {string} [params.key] - Filter by key-value key.
 * @param {string} [params.value] - Filter by key-value value.
 * @param {string} [params.key_value] - Filter by key:value pair (e.g., 'DOCUMENT TYPE:template').
 * @param {number} [params.company_bot] - Filter by company bot ID.
 * @param {number} [params.parent_id] - Filter by parent media ID.
 * @param {boolean} [params.has_parent] - Media having parent (true/false).
 * @param {boolean} [params.has_children] - Media having children (true/false).
 * @param {string} [params.created_after] - Filter by creation date after (ISO datetime).
 * @param {string} [params.created_before] - Filter by creation date before (ISO datetime).
 * @param {string} [params.ordering] - Sort by field (e.g., '-created_at', 'name').
 * @returns {Promise<Object>} Response with { count, next, previous, results }.
 */
const listMedia = async (params = {}) => {
  const response = await apiClientV2.get("/", { params })
  return response.data
}

/**
 * Retrieve detailed information about a single media document by ID.
 *
 * @param {number|string} id - Media document ID.
 * @returns {Promise<Object>} Media detail object.
 * @throws {Error} Throws if ID is not provided.
 */
const getMediaById = async id => {
  if (!id) throw new Error("Media ID is required")
  const response = await apiClient.get(`/${id}/`)
  return response.data
}

/**
 * Search for media documents similar to the given text with filters.
 *
 * @param {Object} params - Query parameters for similarity search.
 * @param {string} params.q - Text query (min 3 characters).
 * @param {number} [params.similarity_threshold=0.3] - Minimum similarity score (0.0 - 1.0).
 * @param {string} [params.tags] - Comma-separated tag names for filtering.
 * @param {string} [params.key_values] - Comma-separated key:value pairs.
 * @param {string} [params.organization] - Organization name filter.
 * @param {string} [params.media_type] - Media type filter (e.g., 'application/pdf').
 * @param {string} [params.priority] - Priority level filter (e.g., 'P1').
 * @param {number} [params.limit=20] - Maximum number of results to return.
 * @returns {Promise<Object>} Search results with similarity scores.
 */
const searchSimilarMedia = async (params = {}) => {
  const response = await apiClient.get("/search_similar/", { params })
  return response.data
}

/**
 * Get master data for filter dropdown options with counts.
 *
 * @returns {Promise<Object>} Master list including organizations, media_types, priorities, tags, etc.
 */
const getMasterList = async () => {
  const response = await apiClient.get("/master_list/")
  return response.data
}

export { listMedia, getMediaById, searchSimilarMedia, getMasterList }
