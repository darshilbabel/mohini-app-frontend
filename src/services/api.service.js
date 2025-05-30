import axiosInstance from "../utils/axios";


const postWithoutAuth = async (body, endpoint) => {
	const headers = {
		"Content-Type": "application/json",
	};
	return await axiosInstance
		.post(`/api/${endpoint}`, body, { headers })
		.then((response) => {
			if (response && response.data) {
				return response.data;
			}
		})
		.catch((error) => {
			return error?.response?.data;
		});
};

const getWithoutAuth = async (endpoint) => {
	const headers = {
		"Content-Type": "application/json",
	};
	return await axiosInstance
		.get(`/api/${endpoint}`, { headers })
		.then((response) => {
			if (response && response.data) {
				return response.data;
			}
		})
		.catch((error) => {
			return error?.response?.data;
		});
};

export const getProfileDetails = async (body) => {
	const headers = {
		"Content-Type": "application/json",
	};
	return await axiosInstance
		.post(`/api/profile/`, body, { headers })
		.then((response) => {
			if (response && response.data) {
				return response.data;
			}
		})
		.catch((error) => {
			return error?.response?.data;
		});
};

export const getSessionDetails = async () => {
	const endpoint = `generate-session/`;
	return await getWithoutAuth(endpoint);
};

export const submitFeedBack = async (body) => {
	const endpoint = `feedback/`;
	return await postWithoutAuth(body, endpoint);
};
  
export const getIpLocation = async () => {
	const endpoint = `get-ip-location/`;
	return await getWithoutAuth(endpoint);
};

export const readElevateProfile = async (accessToken) => {
	const headers = {
		"Content-Type": "application/json",
		"X-auth-token": accessToken
	};
	return await axiosInstance
		.get(`api/read-elevate-profile/`, { headers })
		.then((response) => {
			if (response && response.data) {
				return response.data;
			}
		})
		.catch((error) => {
			return error?.response?.data;
		});
};