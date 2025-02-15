import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr'

// useGetフックのパラメータの型を定義
interface UseGetData<T> {
  url: string
  fetcher?: (url: string) => Promise<T>
  config?: SWRConfiguration
}

// useGetフックを定義
export default function useGet<T = any>({ url, fetcher, config }: UseGetData<T>): SWRResponse<T, Error> {
  // デフォルトのフェッチャー関数
  const defaultFetcher = async (url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`)
    }
    return response.json()
  }

  const getData = {
    url: url,
    fetcher: fetcher || defaultFetcher,
    config: config || undefined
  }

  // SWRを使用してデータを取得
  const swrResponse = useSWR<T, Error>(getData)

  return swrResponse
}

// 使用例
// const url = "https://api.example.com/data"
// const fetcher = async(url) => {console.log(url)}
// const config = {revalidateInterval: 1000}
// const { data, error, isLoading } = useGet({ url, fetcher, config })
