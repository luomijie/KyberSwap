import React from "react"
import ReactTooltip from 'react-tooltip'

const TransactionConfig = (props) => {
  function specifyGas(event) {
    props.gasHandler(event)
  }

  function specifyGasPrice(event) {
    props.gasPriceHandler(event)
  }
  var gasError = ""
  if (props.gasError && props.gasError != "") {
    gasError = (<div class="error">
      <i class="k-icon k-icon-error"></i>
      Specified gas limit is {props.gasError}
    </div>)
  }
  var gasPriceError = ""
  if (props.gasPriceError && props.gasPriceError != "") {
    gasPriceError = (<div class="error">
      <i class="k-icon k-icon-error"></i>
      Specified gas limit is {props.gasPriceError}
    </div>)
  }
  return (
    <div class="transaction-fee">
      <label class="title">Transaction Fee<span class="help has-tip top" data-tooltip title="Change gas limit or gas price affect the time to proccess transaction"></span></label>
      <div class="gas-limit">
        <input type="number" min="0" max="3000000" step="100" onKeyPress={props.onGasPress} value={props.gas} onChange={specifyGas.bind(this)} disabled/>
      </div>
      <div class="symbol">×</div>
      <div class="gas-price">
        <input type="number" min="0" max="99" step="0.1" onKeyPress={props.onGasPricePress} value={props.gasPrice} onChange={specifyGasPrice.bind(this)} />
      </div><span class="result">{props.totalGas} eth</span>
    </div>
  )

}
export default TransactionConfig