export async function Fetcher(url, dummyData, headers = {}) {
  try {
    const response = await fetch(url, {headers: headers});
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.reload();
      return dummyData;
    }
    if (!response.ok || response.status !== 200 || response.headers.get('content-type') !== 'application/json') {
      return dummyData;
    }
    return response;
  } catch (error) {
    console.log("errored, returning dummy data", error);
    return dummyData;
  }
}

export async function AdminFetcher(url, dummyData) {
  const token = JSON.parse(sessionStorage.getItem("token"));
  return Fetcher(url, dummyData, {Authorization: "Bearer " + token})
}