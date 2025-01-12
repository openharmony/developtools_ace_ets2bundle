import { 
  ERROR_DESCRIPTION, 
  HvigorErrorInfo, 
  HvigorLogInfo 
} from "./hvigor_error_info";

const DIAGNOSTIC_CODE_MAP: Map<string, Omit<HvigorLogInfo, 'cause' | 'position'>> = new Map([
  ['28000', { code: '10905128' }],
  ['28001', { code: '10905239' }],
  ['28002', { code: '10905238' }],
  ['28003', { code: '10905127' }],
  ['28004', { code: '10905353' }],
  ['28006', { code: '10905237' }],
  ['28015', { code: '10905236' }],
]);

export function buildErrorInfoFromDiagnostic(
  code: number,
  positionMessage: string,
  message: string
): HvigorErrorInfo | undefined {
  const info: Omit<HvigorLogInfo, 'cause' | 'position'> = DIAGNOSTIC_CODE_MAP.get(code.toString());
  if (!info || !info.code) {
    return undefined;
  }
  return new HvigorErrorInfo()
    .setCode(info.code)
    .setDescription(info.description ?? ERROR_DESCRIPTION)
    .setCause(message)
    .setPosition(positionMessage)
    .setSolutions(info.solutions ?? []);
}