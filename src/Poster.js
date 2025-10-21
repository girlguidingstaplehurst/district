export async function Poster(url, body, headers = {}) {
  try {
    const jsonBody = JSON.stringify(body);
    headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
      headers: headers,
      body: jsonBody,
      method: 'POST'
    });
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.reload();
      return;
    }

    return response;
  } catch (error) {
    console.log("errored", error);
  }
}

export async function AdminPoster(url, body) {
  const token = JSON.parse(sessionStorage.getItem("token"));
  return Poster(url, body, {Authorization: "Bearer " + token})
}