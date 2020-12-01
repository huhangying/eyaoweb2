
export interface WxRefundRequest {
  out_trade_no: string;    // 商户内部订单号
  out_refund_no: string;  // 商户内部退款单号
  total_fee: number;
  refund_fee: number;
}

export interface WxRefundResponse {
  return_code: string;
  return_msg?: string;
  // todo:
}

export interface WxDownloadBillResponse {
  return_code: string;
  return_msg?: string; // 错误码描述
  error_code?: string; // 错误码
  // success

}