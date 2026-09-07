import { AccountAggregatorService } from "./interface.js"
import { MockAAService } from "./mock-aa.js"
import { SetuAAService } from "./setu-aa.js"

const useMock = process.env.USE_MOCK_AA !== "false"

export const aaService: AccountAggregatorService = useMock
  ? new MockAAService()
  : new SetuAAService()

export * from "./interface.js"
