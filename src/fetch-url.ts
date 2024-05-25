export const fetchUrl = async (url: string | string[]) => {
  const results = await Promise.all(
    (Array.isArray(url) ? url : [url]).map(async (u) => {
      const response = await fetch(u)

      if (response.ok) return { url: u, content: await response.text() }

      return {
        url: u,
        content: `Failed to fetch, status code: ${response.status}`,
      }
    })
  )

  return results
}
