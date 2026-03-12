import { API_ENDPOINTS } from "constants/urls"
import { apiClient } from "../client"

type TgetStoryByIdParams = {
  token: string
  data: { id: string }
}

export const getStoryById = async ({ token, data = { id: "" } }: TgetStoryByIdParams): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Authorization token is required!")
    }

    if (!data.id) {
      throw new Error("Story ID is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const response = await apiClient.get(`${API_ENDPOINTS.STORY}${data.id}/`, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error fetching story by ID:", error)
    throw error
  }
}

type TgetStoryAllMediaParams = {
  token: string
  data: { story: string }
  signal: AbortSignal | undefined
}

export const getStoryAllMedia = async ({ token, data = { story: "" }, signal = undefined }: TgetStoryAllMediaParams) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
      params: data,
      signal,
    }

    const response = await apiClient.get(API_ENDPOINTS.STORY_MEDIA, config)
    return response?.data || {}
  } catch (error) {
    console.error("Error fetching story media:", error)
    throw error
  }
}

type TcreateStoryMediaParams = {
  token: string
  data: {
    story: string
    name: string
    file: any[]
    file_url: string
    media_type: string
  }
}

export const createStoryMediaApi = async ({
  token,
  data = {
    story: "",
    name: "",
    file: [],
    file_url: "",
    media_type: "",
  },
}: TcreateStoryMediaParams) => {
  try {
    const config = {
      headers: {
        Authorization: token,
      },
    }

    const response = await apiClient.post(API_ENDPOINTS.STORY_MEDIA, data, config)

    return response?.data || {}
  } catch (error) {
    console.error("Error creating story media:", error)
    throw error
  }
}

type TpartialUpdateStoryByIdParams = {
  token: string
  data: {
    access_token?: string
    formatted_content?: Record<string, any>
    session?: string
    flow?: string
    other_params?: Record<string, any>
  }
  storyId: string
  partialUpdate?: boolean
}

export const partialUpdateStoryById = async ({ token, data, storyId, partialUpdate = true }: TpartialUpdateStoryByIdParams) => {
  try {
    if (!storyId) {
      throw new Error("Story ID is required!")
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    const requestData = {
      formatted_content: data?.formatted_content ? JSON.stringify(data.formatted_content) : data?.formatted_content,
      access_token: data?.access_token,
      session: data?.session,
      flow: data?.flow,
      other_params: data?.other_params,
    }

    let response = null

    if (partialUpdate) {
      response = await apiClient.patch(`${API_ENDPOINTS.STORY}${storyId}/`, requestData, config)
    } else {
      response = await apiClient.put(`${API_ENDPOINTS.STORY}${storyId}/`, requestData, config)
    }

    return response?.data || {}
  } catch (error) {
    console.error("Error updating story:", error)
    throw error
  }
}

type TupdateStoryMediaParams = {
  token: string
  data: {
    include_in_story: boolean
    flow: string
    access_token: string
    session: string
  }
  mediaId: string
  partialUpdate?: boolean
}

export const updateStoryMediaApi = async ({ token, data, mediaId, partialUpdate = false }: TupdateStoryMediaParams) => {
  try {
    if (!mediaId) {
      throw new Error("Media ID is required!")
    }

    const formData = new FormData()

    for (const key of Object.keys(data)) {
      formData.append(key, (data as Record<string, any>)[key])
    }

    const config = {
      headers: {
        Authorization: token,
      },
    }

    let response = null

    if (partialUpdate) {
      response = await apiClient.patch(`${API_ENDPOINTS.STORY_MEDIA}${mediaId}/`, formData, config)
    } else {
      response = await apiClient.put(`${API_ENDPOINTS.STORY_MEDIA}${mediaId}/`, formData, config)
    }

    return response?.data || {}
  } catch (error) {
    console.error("Error updating story media:", error)
    throw error
  }
}

type TendStoryV2Params = {
  token?: string
  data: {
    session: string
    profile_id: number
    stage: string
    flow: string
    language: string
  }
}

export const endStoryV2Api = async ({ token, data }: TendStoryV2Params) => {
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  }

  const response = await apiClient.post(API_ENDPOINTS.END_STORY_V2, data, config)

  return response.data
}


type TendStoryParams = {
  token?: string
  data: {
    session: string
    profile_id: number
    stage: string
    flow: string
    language: string
    access_token?: string
  }
}

export const endStoryApi = async ({ token, data }: TendStoryParams) => {
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  }

  if (token){
    data = { ...data, access_token: token }
  }

  const response = await apiClient.post(API_ENDPOINTS.END_STORY, data, config)

  return response.data
}
