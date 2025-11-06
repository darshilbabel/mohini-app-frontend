import axiosInstance from "../../utils/axios"

const getStoryByIdUrl = id => `/api/story/${id}/`
const get_all_story_media_url = "/api/storymedia/"
const create_story_media_url = "/api/storymedia/"

export async function createAuthRequest({ loader = () => {}, setter = () => {}, errorHandler = () => {}, token = "", data = {}, method = "", url = "", params = {} }) {
  try {
    if (!token && !url && !method) {
      throw new Error("Insufficient data!")
    }
    loader(true)
    const response = await axiosInstance({
      url: `${url}`,
      method,
      data,
      params,
      headers: {
        Authorization: token,
      },
    })
    setter(response?.data || {})
    loader(false)
  } catch (error) {
    console.error({ error })
    errorHandler({
      response: error?.request?.response,
      status: error?.request?.status,
    })
    loader(false)
  }
}

export const getStoryById = async ({
  loader,
  setter,
  token,
  data = {
    id: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      token,
      method: "GET",
      url: getStoryByIdUrl(data.id),
    })
  } catch (error) {
    console.error(error)
  }
}

export const getStoryAllMedia = async ({
  loader,
  setter,
  token,
  data = {
    story: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      token,
      params: data,
      method: "GET",
      url: get_all_story_media_url,
    })
  } catch (error) {
    console.error(error)
  }
}

export const createStoryMedia = async ({
  loader,
  setter,
  errorHandler,
  token,
  data = {
    story: "",
    name: "",
    file: [],
    file_url: "",
    media_type: "",
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      errorHandler,
      token,
      data,
      method: "POST",
      url: create_story_media_url,
    })
  } catch (error) {
    console.error(error)
  }
}

export const partialUpdateStoryById = async ({
  loader,
  setter,
  errorHandler,
  token,
  data = {
    id: "",
    formatted_content: "",
    access_token: "",
    session: "",
    flow: "",
    other_params: {},
  },
}) => {
  try {
    await createAuthRequest({
      loader,
      setter,
      errorHandler,
      token,
      data: {
        formatted_content: JSON.stringify(data?.formatted_content),
        access_token: data?.access_token,
        session: data?.session,
        flow: data?.flow,
        other_params: data?.other_params,
      },
      method: "PATCH",
      url: getStoryByIdUrl(data?.id),
    })
  } catch (error) {
    console.error(error)
  }
}
