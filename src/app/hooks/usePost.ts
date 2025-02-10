import useSWR, { type SWRConfiguration } from 'swr'

interface usePostData {
  url: string
  body: any
  config?: SWRConfiguration
}

export default function usePost(postData: usePostData) {
  const fetcher = (url: string) => fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData.body),
  }).then((res) => res.json()) as Promise<any>

  const post = {
    url: postData.url,
    fetcher: fetcher,
    config: postData?.config,
  }

  const { data, error, isLoading } = useSWR(post)
  return { data, error, isLoading }
}
