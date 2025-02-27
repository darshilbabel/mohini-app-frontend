import moment from "moment";

export function getDomainDetail() {
  try {
    let url = window.location.host;
    let splited_url = url.split(".");
    let subdomain = "";

    if (splited_url?.length === 3) {
      subdomain = splited_url[0];
    }

    let result = {
      url,
      subdomain,
      splited_url,
    };
    return result;
  } catch (error) {
    console.error({ error });
  }
}
