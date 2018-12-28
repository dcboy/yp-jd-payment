const moment = require('moment');
const JDpay = require('../src/jd-pay');
const config = require('../config');

const jpay = new JDpay(config);

(async () => {
  const params = {
    //交易流水号
    tradeNum: moment().valueOf(),
    //交易名称
    tradeName: moment().valueOf(),
    //交易金额
    amount: '1',
    callbackUrl: 'http://433d76ca.ngrok.yopoint.cc:81/',
    notifyUrl: 'http://433d76ca.ngrok.yopoint.cc:81/jd/gateway/notify',
    // oTradeNum: '1545811092905',
    // tradeNum: moment().valueOf(),
    // tradeNum: '1545811092905',
    // tradeType: 1,
  };

  const encrypt = 'M2JlZTE1NTZkMTdmOGYzN2ZkN2YyY2IwNTFkMTI0MzgwYTA5ZjAxM2ZhNWI5NmUyNjVmNzg5ZmIyY2E4OWJkMmM5N2VmYWVlMDViMzJhNWQwYWVhZDI4YTE5MjRhY2QzZjAyZmMxMjcyODVhNjM4ZWE3ZDkxNjk1N2VlYTVlMTQ0MzMzNWFlODg2MzAzOTE1ZDQyNDM3NzlmZmM2NzA1NjNmNTA2MGVjZjRmOWFlZjVkZDNkZjM2NjZlYTU4Mjk1NDZjOTUxMmJkOTI4NzM0MjBjMWUyMjU2Njg5ZjNmMjNhZjU4Njg2YWJjNDEwOWEyOGU2ZjZmMzkyZDIwNDM5ZjQxMTc0NzdiYjRmMjA3MWQxMjRlYTA0YmJlMWI1OTFjZGM5YWE1YTU5MDQ5MmQ0ZWE5NDdlNTNhNTBjZGZjNWQ2M2MyNWRlN2VhNzJhOWVlODg3ZmYzZmJjNzNlMWI1YzExYzk1MWRiNjhlY2QwOGFmZWZlYmEwNTk1NmU3MDI0NDEzY2E0NjdlNjkzNDViNWEzOTY4ZGM4M2Y0ZDk1ZGI4YWRiM2FlMjlmNGMyNDRjNjIwMTBmOWUxOTUwYjQ3ODg3OGQyYzAwZWUzY2U0ZGViMDMxZGE5YjlhMTZhNWRhMjdkNTRlMWQxNjExYjUwZGVkNzZkMGZmNWQ0YTg1ODFkN2NjNTEzODYyMGQ5OGYwZDlhODJmMTE4YWRlZTM1YzgwNDAxYTcwNzY1ZDNmY2ZkNTdjNGY4NzNhMzhhZTA4OWFmMDAxMTMyYWNmZjM0NTdhZDczYjhkOTJhNGIxMzMxNzQ3ZTMwYmQ4Njg2MGRkMDEwOGM0ZmNkMzU4M2I4YjI1NDdiMjU0OTdmZjNkMTYyZTU5MzFlODNkN2ZjZmZjYjhjYzUxNjY1NGMwMjA0MDk3YTNiNDM0YzFlNDdkZDU1ODZkN2ZlMTBkNWNkNWRmOGYyOWQ0NTk2MmMxMGYzYTE1MTJhNDM5M2M5YWI0ZmQ4MmYwYjFjMzRlNDJiMGJkNDY3YWFjMGU0OGI2YTJkMmUzZDA3ZWIxNmJmM2I5NWViNzk1MzEwZTBhNDUyZjdkYTMzMjhhNWVlZjJkN2M0MjUxZWRjY2ZmNDY2OTI1NjdlMGExMThkNjkyNGNkMGYzZjllYjEwZTAzYmMzMGZmMmQ0NDBjZGVkOWJkZGRjNjdkZmJlYjZjY2ExODk1Zjc3ZjQzNDZhMDdlNmM5M2ZlOWVjZTFkY2IyMDk2ODcwODhhMzM3ZTJhYTMzNWQyMjE4ZmIwZmUyNWYyYTFiYzc3MDgxNjZmYWM3ODJjOGQwYTc1NmQ2NmFmNDhmYjEzNTIwYzhmYjIxYjgzYmY4ZGRlYTI3MTA4YjAzZDA0OWJlYjUwZmQ1YTU5OTE0MzIwMWMxOTM4OTk4OWRjYjVmMmFkNWU4OGFmZGM2YmJlZmFjYjVhNDE1NGZmYjRmNWNjYmE3YWYwNzcxMDUxODU4NTM3YzdiNzhmYWUyNmE4ZDFjZmIzMjRiN2I4ZGZlNTE2NzBlZTUyMDA1Y2Y4Mjg4MzhkOTAwMDYxNGIyNTExZTZhNDM2Yzg1NmZhODY2YWE1YzFjY2E1Y2NkNjVkYmNiY2IzYTFiZmM4OWY1NGVlOWNjMzhmM2U3MThlYTFhMGYwMTJjNzAwMGU4MzlmZDdhOTc0MDdlY2FiODVkMGVhOTc2MDg4NWU4YjJlYjM2MTAzMmQ1ZDc4N2FhY2Q5NWQ1NmIxMjkzMGMwY2EyZDhkZmFiZmI2NWI0MDEyNmJmZDRjZGNlNDgyNjg5ZmMzNzJiOThmNzdjNzE5NWJjZTZkYTY2MzYxZjY1OTdmZTM0YjhhMDYzNDQwYmM2Y2MwZTYyZjM0NzEyYmJmZDhjN2MwZTM2Zjk0NDBiYzZjYzBlNjJmMzQ3NGFmNDY5YTg5MDFjYzA4MzVjYmUyYTMzMmI2YWEwYWJhN2Y4NjVjMjg2NzNiYzA0YjlmZGRjNTFlMDNmMDkzNjhiMmJkNTVjZmFhZDM4M2MzZjA1MTA2NGMzOWUzZTQwYzczNjRjNmE3NWI4OTNmZThmMTM5ZTRkMDE2YjJkMDVmNTdmZTg0YWI2OGZkMDYyNjlmZWRmYzYyYTg0YzM0YzgxNzRkYjI2ZGFlOGExYTlmN2JjNjIzNjUxNGI5MDhmZTQyYjM0ODE1MjRlYWIwMmIzOTNlOTk0OWZlYzFmZmE4YzBkNTU5MDQwMGRiNTE0ODI0ZjBhMWQyZDAxMWExM2M1ZDUxZDhiNzRhMTg4YWY=';
  try {
    // const response = await jpay.uniorder(params);
    // const response = await jpay.customerPay(params);
    // const response = await jpay.query(params);
    // const response = await jpay.refund(params);

    const response = await jpay.validNotify(encrypt)
    console.log(response);

  } catch (e) {
    console.log(e);
  }
})()