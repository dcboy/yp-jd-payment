
import moment from 'moment';
import _ from 'lodash';
import util from './util';

const APIURL = {
  uniorder: 'https://paygate.jd.com/service/uniorder',
  query: 'https://paygate.jd.com/service/query',
  refund: 'https://paygate.jd.com/service/refund',
  customerPay: 'http://h5pay.jd.com/jdpay/customerPay',
}
/** 
 * 京东支付类
*/
class JDpay {
  constructor(config) {
    this.config = config;
    if (this.config.desKey) {
      this.config.desKey = Buffer.from(this.config.desKey, 'base64');
    }
    this.baseOptions = {
      version: 'V2.0',
      merchant: this.config.merchant,
    }
  }

  /** 
   * Xml提交请求
  */
  async xmlRequest (url, params) {
    const { desKey, privateKey, publicKey } = this.config;

    params = Object.assign({}, this.baseOptions, params)

    //将提交参数按照拼接规则，生成S1如下
    const xmlStr = util.buildXml(params);
    const sign = util.hash(xmlStr, 'sha256');
    params.sign = util.rsaEncrypt(Buffer.from(sign), privateKey).toString('base64');

    // 待签名的xml字符串
    const signedXmlStr = util.buildXml(params);

    // 加密字符串
    const hex = util.encryptDES3(desKey, signedXmlStr).toString('hex');

    // 加密字符串转BASE64
    const encrypt = Buffer.from(hex, 'utf-8').toString('base64');

    // 提交的postData
    const postData = Object.assign({}, this.baseOptions, { encrypt });

    const body = util.buildXml(postData)
    // 请求API
    let response = await util.request({
      url,
      headers: {
        'content-type': 'application/xml',
      },
      body,
    });
    response = await util.validResponse(response, desKey, publicKey);

    return response;
  }

  /** 
   * 表单方式提交
  */
  async getFormRequest (params) {
    const { desKey, privateKey } = this.config;

    params = Object.assign({}, this.baseOptions, params)

    //将提交参数按照拼接规则，生成S1如下
    const signStr = util.normalize(params);
    // 签名
    const sign = util.hash(signStr, 'sha256');
    // 加密签名
    params.sign = util.rsaEncrypt(Buffer.from(sign), privateKey).toString('base64');

    // 除sign以外所有字段值都加密
    _.each(params, (v, k) => {
      if (k === 'sign' || k === 'merchant' || k === 'version') {
        return;
      }
      const hex = util.encryptDES3(desKey, v).toString('hex');
      params[k] = Buffer.from(hex, 'utf-8').toString();
    });

    return params;
  }

  /**
   * 回调数据解密校验数据
   *
   * @param {*} encrypt
   * @returns
   * {
   *   "version": "V2.0",
   *   "merchant": "110148035005",
   *   "result": {
   *     "code": "000000",
   *     "desc": "success"
   *   },
   *   "device": "111",
   *   "tradeNum": "160927496812634",
   *   "tradeType": "0",
   *   "sign": "YSHTmpqKE0VMqhMWP9dHCxf+GkfxjD56U2XcgT1seN3V02KbFguC41DTygFpO4XXHmepZZkl8P+6R0EWs0hlL5FO1tT53jnr2+zRYo7TV/AIaPTYMBKgPV2FRYVuTjgUi6VIS/gLFauxXGaouRIU+h8m0CPfctgcBcTMumr3z8w=",
   *   "amount": "1690",
   *   "status": "2",
   *   "payList": {
   *     "pay": {
   *       "payType": "0",
   *       "amount": "1690",
   *       "currency": "CNY",
   *       "tradeTime": "20160927142346",
   *       "detail": {
   *         "cardHolderName": "*径",
   *         "cardHolderMobile": "138****6396",
   *         "cardHolderType": "0",
   *         "cardHolderId": "****0049",
   *         "cardNo": "622588****6178",
   *         "bankCode": "CMB",
   *         "cardType": "1"
   *       }
   *     }
   *   }
   * }
   * @memberof JDpay
   */
  async validNotify (encryptStr) {
    if (!encryptStr) {
      throw new Error('MISSING_PRARMS_ENCRYPT');
    }
    const { desKey, publicKey } = this.config;
    const data = await util.validNotifyEncrypt(encryptStr, desKey, publicKey);
    return data;
  }

  /** 
   * 统一下单接口
  */
  async uniorder (params) {
    // 当前接口默认参数
    const base = {
      currency: 'CNY',
      orderType: '0',
      tradeTime: moment().format('YYYYMMDDHHmmss')
    };

    params = Object.assign({}, base, params);

    if (!params.tradeNum) {
      throw new Error('MISSING_PARAMS_TRADE_NUM');
    }

    if (!params.tradeName) {
      throw new Error('MISSING_PARAMS_TRADEN_NAME');
    }

    if (!params.amount) {
      throw new Error('MISSING_PARAMS_AMOUNT');
    }

    if (!params.notifyUrl) {
      throw new Error('MISSING_PARAMS_NOTIFY_URL');
    }

    const response = await this.xmlRequest(APIURL.uniorder, params);
    return response;
  }

  /**
   * 查询订单
   * 
   * @param {*} params 
   * @returns {Object}
   * {
   *   "version": "V2.0",
   *   "merchant": "111204753004",
   *   "result": {
   *     "code": "000000",
   *     "desc": "成功"
   *   },
   *   "tradeNum": "1545811092905",
   *   "tradeType": "0",
   *   "payList": {
   *     "pay": {
   *       "payType": "0",
   *       "amount": "1",
   *       "currency": "CNY",
   *       "tradeTime": "20181226155852",
   *       "detail": {
   *         "cardHolderName": "*俏锋",
   *         "cardHolderMobile": "186****5761",
   *         "cardHolderType": "0",
   *         "cardHolderId": "****3618",
   *         "cardNo": "1060",
   *         "bankCode": "CMB",
   *         "cardType": "2",
   *         "payMoney": "1"
   *       }
   *     }
   *   },
   *   "amount": "1",
   *   "status": "2",
   *   "sign": "Ku3ZO2iqNFwGJTQP4ozYWN/N+Iv0hRY+p4RRimE6FWU0st65Ta2lymvoIJbLErOUF3Qo0oVrtxBOqDd6IoXzivtMrYrVgxX28lFTjxWUgt0h9XFoy3oMChRb+QH4Y7QT16wWlvQTwTxVh3BUYxjXWxwKwkEwtTGfXwsz6MRyiXw="
   * }
   */
  async query (params) {
    params = Object.assign({}, params);

    if (!params.tradeNum) {
      throw new Error('MISSING_PARAMS_TRADE_NUM');
    }

    if (params.tradeType === undefined) {
      throw new Error('MISSING_PARAMS_TRADE_TYPE');
    }

    const response = await this.xmlRequest(APIURL.query, params);
    return response;
  }

  /**
   * 退款接口
   *
   * @param {*} params
   * @returns
   * {
   *   "version": "V2.0",
   *   "merchant": "111204753004",
   *   "result": {
   *     "code": "000000",
   *     "desc": "成功"
   *   },
   *   "tradeNum": "1545834414432",
   *   "oTradeNum": "1545811092905",
   *   "amount": "1",
   *   "tradeTime": "20181226222654",
   *   "status": "1",
   *   "sign": "Twm/xfJ++a4QUFG8c3FMgZGsBzbqLo3TUZNtDVCFaTKN8yz69WpKtZF5UrAkGxc2MFDqtuWoAz/JGR8lS2RKsI0ru3lIG5x39kSkRdntn6atjMkL04AhXYqf3CPXZNw2LSE8KthVZ7dusgTWVm10Xt3+acXs8jxStbifJOe10+g="
   * }
   * @memberof JDpay
   */
  async refund (params) {
    const base = {
      currency: 'CNY',
      orderType: '0',
    };

    params = Object.assign({}, params);

    if (!params.tradeNum) {
      throw new Error('MISSING_PARAMS_TRADE_NUM');
    }

    if (!params.oTradeNum) {
      throw new Error('MISSING_PARAMS_OTRADENUM');
    }

    if (!params.amount) {
      throw new Error('MISSING_PARAMS_AMOUNT');
    }

    const response = await this.xmlRequest(APIURL.refund, params);
    return response;
  }

  /**
   * H5扫码支付逻辑
   * https://h5pay.jd.com/jdpay/customerPay
   * @param {*} params
   * @returns
   * @memberof JDpay
   */
  async customerPay (params) {
    // 当前接口默认参数
    const base = {
      orderType: 1,
      currency: 'CNY',
      tradeType: 'DRCT',
      tradeTime: moment().format('YYYYMMDDHHmmss')
    };

    params = Object.assign({}, base, params);
    // 处理参数
    params = await this.getFormRequest(params);

    const ret = {
      url: APIURL.customerPay,
      formData: params
    }

    return ret;
  }


}

module.exports = JDpay;