
import { TX_TYPES } from "../constants";
import BLOCKCHAIN_INFO from "../../../../env";
import { sumOfTwoNumber, subOfTwoNumber, multiplyOfTwoNumber, toT, convertTimestampToTime } from "../../utils/converter";
import { validateResultObject, returnResponseObject, validateTransferTx, validateSwapTx} from "../portfolioService"

import {getResolutionForTimeRange, getFromTimeForTimeRange, parseTxsToTimeFrame,
     mappingBalanceChange, mappingTotalBalance, getArrayTradedTokenSymbols, timelineLabels,
     CHART_RANGE_IN_SECOND, TIME_EPSILON} from "./portfolioChartUtils"



export async function getLastestBalance(ethereum, userAddr, supportTokens) {
    const lastestBlock = await ethereum.call("getLatestBlock", userAddr, supportTokens)
    const balances = await ethereum.call("getAllBalancesTokenAtSpecificBlock", userAddr, supportTokens, lastestBlock)

    return balances
}

function getTokenByAddress(tokens){
    return Object.values(tokens).reduce((result, token) => {
        Object.assign(result, {[token.address]: token.symbol});
        return result
      }, {});
}


export async function render(ethereum, address, tokens, rangeType) {
    const now = Math.floor(new Date().getTime() / 1000) - TIME_EPSILON
    const innitTime = now - CHART_RANGE_IN_SECOND[rangeType]

    const addrTxs = await getBalanceTransactionHistoryByTime(address, innitTime, now)
    

    if (addrTxs.isError || addrTxs.inQueue) {
        // todo handle history no txs
        return { isError: addrTxs.isError, inQueue: addrTxs.inQueue}
    }

    const txs = addrTxs.data
    if (!txs) return {isError: true}

    const balanceTokens = await getLastestBalance(ethereum, address, tokens)
    const tokenByAddress = getTokenByAddress(tokens)
  

    const chartResolution = getResolutionForTimeRange(rangeType)
    const chartFromTime = getFromTimeForTimeRange(rangeType, now)

    const txByResolution = parseTxsToTimeFrame(txs, chartResolution, chartFromTime, now)
    const arrayTradedTokenSymbols = getArrayTradedTokenSymbols(txs, tokenByAddress, balanceTokens)
    const balanceChange = mappingBalanceChange(txByResolution, balanceTokens, tokenByAddress, tokens)
    const priceInResolution = await fetchTradedTokenPrice(chartFromTime, now, chartResolution, arrayTradedTokenSymbols)
    const totalBalance = mappingTotalBalance(balanceChange, priceInResolution)

    const labelSeries = timelineLabels(chartFromTime, now, chartResolution)
    return {
        ...totalBalance,
        label: labelSeries
    }
}


export async function getBalanceTransactionHistoryByTime(address, from, to) {
    const response = await fetch(`${BLOCKCHAIN_INFO.portfolio_api}/transactions?address=${address}&startTime=${from}&endTime=${to}`);
    const result = await response.json();
  
    const isValidResult = validateResultObject(result);
    
    if (!isValidResult) return returnResponseObject([], 0, false, true);
    let txs = [];
    
    for (let i = 0; i < result.data.length; i++) {
      const tx = result.data[i];
      let isValidTx = false;
      
      if (tx.type === TX_TYPES.send || tx.type === TX_TYPES.receive) {
        isValidTx = validateTransferTx(tx);
      } else if (tx.type === TX_TYPES.swap) {
        isValidTx = validateSwapTx(tx);
      }
      if (isValidTx) {
        tx.time = convertTimestampToTime(+tx.timeStamp);
        txs.push(tx);
      }
    }
    
    return returnResponseObject(txs, result.count, result.in_queue);
  }
  

  export async function fetchTradedTokenPrice(fromTime, toTime, resolution, arrayTradedTokensSymbol){  
    const arraySymbolParams = arrayTradedTokensSymbol.map(symbol => "&symbol=" + symbol).join("")
    const response = await fetch(`${BLOCKCHAIN_INFO.tracker}/internal/history_prices?from=${fromTime}&to=${toTime}&resolution=${resolution}&` + arraySymbolParams);
    const result = await response.json();
    if(result.error){
      return {inQueue: true}
    }
  
    return result.data
  
  } 