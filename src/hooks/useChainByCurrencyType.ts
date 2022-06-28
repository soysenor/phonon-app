import { CHAINS, DEFAULT_CHAIN } from "../constants/chains";

const useChainByCurrencyType = (currencyType: number) => {
  const chain = Object.entries(CHAINS).find(
    ([, chain]) => chain.CurrencyType === currencyType
  );
  if (!chain) {
    return DEFAULT_CHAIN;
  }
  return chain[1];
};

export default useChainByCurrencyType;
