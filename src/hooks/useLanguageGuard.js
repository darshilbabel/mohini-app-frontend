import { Navigate, useSearchParams } from "react-router-dom"
import { useSiteDataSessionStore } from "store"
import { sessionFlowName } from "../constants/session"
import { URL_PARAMS } from "../constants/urls"
import ROUTES from "../url"

const DEDICATED_LANDING_PAGES = {
  [sessionFlowName.megaPTM]: ROUTES.SHIKSHALOKAM_PTM_HOME_PAGE,
  [sessionFlowName.YLC]: ROUTES.SHIKSHALOKAM_YLC_HOME_PAGE,
}

const FLOW_SELECTION_FLOWS = [
  sessionFlowName.GuestDiscussion,
  sessionFlowName.GuestMiStory,
]

function getLandingPath(flow) {
  if (DEDICATED_LANDING_PAGES[flow]) return DEDICATED_LANDING_PAGES[flow]
  if (FLOW_SELECTION_FLOWS.includes(flow)) return ROUTES.SHIKSHALOKAM_HOME_PAGE
  if (flow) return `${ROUTES.SHIKSHALOKAM_HOME_PAGE}?${new URLSearchParams({ [URL_PARAMS.FLOW]: flow })}`
  return ROUTES.SHIKSHALOKAM_HOME_PAGE
}

export default function LanguageGuard({ flow, children }) {
  const hasSelectedLanguage = useSiteDataSessionStore(state => state.hasSelectedLanguage)
  const [searchParams] = useSearchParams()
  const resolvedFlow = flow || searchParams.get(URL_PARAMS.FLOW)

  if (!hasSelectedLanguage) {
    return <Navigate to={getLandingPath(resolvedFlow)} replace />
  }

  return children
}
