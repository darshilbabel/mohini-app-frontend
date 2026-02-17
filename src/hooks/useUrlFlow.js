import { URL_PARAMS } from "../constants/urls"
import { useSearchParams } from "react-router-dom"
import { useMemo } from "react"

export default function useUrlFlow() {
  const [searchParams, setSearchParams] = useSearchParams()

  const flow = useMemo(() => searchParams.get(URL_PARAMS.FLOW), [searchParams])

  function setFlow(flow) {
    setSearchParams(params => {
      params.set(URL_PARAMS.FLOW, flow)
      return params
    })
  }

  return { flow, setFlow }
}
