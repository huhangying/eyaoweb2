
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
  // success
  trade_time: string; // 0
  out_trade_no: string; // 5
  // transaction_id: string; // 6
  user: string; // 7 用户标识
  status: string; // 9
  fee_type: string; // 11
  total_fee: string; // 12
  coupon_fee: string; // 13

  // refund_id: string; // 14
  out_refund_no: string; // 15
  refund_fee: string; // 16
  refund_coupon_fee: string; // 17
  refund_status: string; // 19
  body: string; // 20 商品名称


}
