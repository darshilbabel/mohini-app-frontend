import { bot_routes, FLOW_TYPES } from "../../../configure";
import { sessionFlowName } from "../../../constants/session";

export const getBotConfigForFlow = (flowType) => {
    switch (flowType) {
      case FLOW_TYPES.LFA:
        return { route: bot_routes.lfa_bot, flow_name: sessionFlowName.LFA };
      case FLOW_TYPES.LCF:
        return { route: bot_routes.lcf_bot, flow_name: sessionFlowName.LCF };
      case FLOW_TYPES.FREE_FLOW:
        return { route: bot_routes.free_flow_bot, flow_name: sessionFlowName.FreeFlow };
      default:
        return { route: bot_routes.free_flow_bot, flow_name: sessionFlowName.FreeFlow };
    }
};


export const compareFlowTypesEquality = (flowType1, flowType2) => {
    return flowType1?.toLowerCase() === flowType2?.toLowerCase();
}