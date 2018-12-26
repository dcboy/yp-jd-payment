const moment = require('moment');
const JDpay = require('../lib/jd-pay');
const config = require('../config');

const jpay = new JDpay(config);

(async () => {
  const params = {
    // //交易流水号
    // tradeNum: moment().valueOf(),
    // //交易名称
    // tradeName: moment().valueOf(),
    // //交易金额
    // amount: '1',
    // callbackUrl: 'http://5f3a2d8.ngrok.yopoint.cc:81/',
    // notifyUrl: 'http://5f3a2d8.ngrok.yopoint.cc:81/jd/gateway/notify',
    oTradeNum: '1545811092905',
    tradeNum: moment().valueOf(),
    amount: 1,
  };

  try {
    // const response = await jpay.uniorder(params);
    // const response = await jpay.customerPay(params);
    const response = await jpay.query(params);
    // const response = await jpay.refund(params);
    console.log(response);
  } catch (e) {
    console.log(e);
  }
})()