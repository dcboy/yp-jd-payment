# 京东支付 NodeJS

## Install

```shell
npm install yp-jd-payment
```

[![yp-jd-payment](https://nodei.co/npm/yp-jd-payment.png)](https://npmjs.org/package/yp-jd-payment)

## Usage

```javascript
const fs = require('fs');
const path = require('path');

const desKey = 'xxxx';
const config = {
  privateKey: fs.readFileSync(path.resolve(__dirname, './key.pem')).toString(),
  publicKey: fs.readFileSync(path.resolve(__dirname, './public.pem')).toString(),
  desKey: Buffer.from(desKey, 'base64'),
  merchant: 'xxx',
};

const params = {
  // 
};

try {
  const response = await jpay.customerPay(params);

  // const response = await jpay.uniorder(params);
  // const response = await jpay.query(params);
  // const response = await jpay.refund(params);
  console.log(response);
} catch (e) {
  console.log(e);
}

```

## API

https://payapi.jd.com/