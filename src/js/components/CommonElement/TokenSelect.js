import React from "react"

const TokenSelect = (props) => {
  var handleOnClick = (e) => {
    if (props.inactive) {
      e.preventDefault();
    } else {
      props.onClick(e, props.symbol, props.address, props.type)
    }
  }
  return (
    <div class="column gutter-15">
      <a className={"token-stamp " + (props.inactive ? "empty" : (props.selected ? "selected" : ""))} onClick={(e) => { handleOnClick(e) }}>
        <img src={props.icon} /><span class="name">{props.name}</span>
        <div class="balance" title={props.balance.value}>{props.balance.roundingValue}</div>
      </a>
    </div>
  )
}

export default TokenSelect
