const crypto = require('crypto');
const parseString = require('xml2js').parseString;
const request = require('request');
const algorithm = 'des-ede3';
const autopad = false;
const Builder = require('xml2js').Builder;

const flush = (cipher, buf) => {
  const arr = [];
  arr.push(cipher.update(buf));
  arr.push(cipher.final());
  return Buffer.concat(arr);
};

const toBuffer = (text, encode = 'utf-8') => {
  if (text instanceof Buffer) {
    return text;
  }
  const str = text.toString();
  return Buffer.from(str, encode);
};

const _padText = (text) => {
  const buf = toBuffer(text);
  const len = buf.length;
  const mod = (len + 4) % 8;
  let nfb;
  if (mod === 0) {
    nfb = Buffer.alloc(len + 4);
  } else {
    nfb = Buffer.alloc(len + 4 + (8 - mod));
  }
  nfb.writeInt32BE(len, 0);
  buf.copy(nfb, 4, 0, len);
  return nfb;
};

const _rText = (buf) => {
  const datasize = buf.readInt32BE(0);
  if (datasize > buf.length - 4) {
    throw new Error('data_length_error');
  }
  const nc = Buffer.alloc(datasize);
  buf.copy(nc, 0, 4, datasize + 4);
  return nc.toString();
}

const utils = {
  async validResponse (response, desKey, publicKey) {
    response = await this.parseXml(response);

    if (response.result.code === '000000') {
      const encrypt = response.encrypt;
      const raw = Buffer.from(encrypt, 'base64');
      const str = raw.toString('utf-8');
      const data = Buffer.from(str, 'hex');

      // 解密后的xml
      let xmlStr = this.dencryptDES3(desKey, data);

      /** 
        * <?xml version="1.0" encoding="UTF-8"?>
        * <jdpay>
        *     <version>V2.0</version>
        *     <merchant>111204753004</merchant>
        *     <result>
        *         <code>000000</code>
        *         <desc>成功</desc>
        *     </result>
        *     <tradeNum>1545811092905</tradeNum>
        *     <tradeType>0</tradeType>
        *     <payList>
        *         <pay>
        *             <payType>0</payType>
        *             <amount>1</amount>
        *             <currency>CNY</currency>
        *             <tradeTime>20181226155852</tradeTime>
        *             <detail>
        *                 <cardHolderName>*俏锋</cardHolderName>
        *                 <cardHolderMobile>186****5761</cardHolderMobile>
        *                 <cardHolderType>0</cardHolderType>
        *                 <cardHolderId>****3618</cardHolderId>
        *                 <cardNo>1060</cardNo>
        *                 <bankCode>CMB</bankCode>
        *                 <cardType>2</cardType>
        *                 <payMoney>1</payMoney>
        *             </detail>
        *         </pay>
        *     </payList>
        *     <amount>1</amount>
        *     <status>2</status>
        *     <sign>Ku3ZO2iqNFwGJTQP4ozYWN/N+Iv0hRY+p4RRimE6FWU0st65Ta2lymvoIJbLErOUF3Qo0oVrtxBOqDd6IoXzivtMrYrVgxX28lFTjxWUgt0h9XFoy3oMChRb+QH4Y7QT16wWlvQTwTxVh3BUYxjXWxwKwkEwtTGfXwsz6MRyiXw=</sign>
        * </jdpay>
      */

      // xml转对象
      const result = await this.parseXml(xmlStr);

      // 签名
      const inSignStr = result.sign;
      // 签名buffer
      const sign_data = Buffer.from(inSignStr, 'base64');

      // 本地解密签名
      const inSign = this.rsaDecrypt(sign_data, publicKey).toString('utf-8');

      // 获取xml除sign节点
      const sign_inx = xmlStr.indexOf('<sign>');
      const linx = xmlStr.indexOf('</sign>');
      const s1 = xmlStr.substring(0, sign_inx);
      const s2 = xmlStr.substring(linx + 7);

      // 本地计算签名
      let sign = this.hash(s1 + s2, 'sha256');;

      // 判断签名是否正常
      if (sign !== inSign) {
        throw new Error('ERR_SING_INVALID');
      }

      return result;
    } else {
      throw new Error(JSON.stringify(response.result));
    }
  },
  rsaEncrypt (data, key) {
    return crypto.privateEncrypt({
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, data);
  },
  rsaDecrypt (data, key) {
    return crypto.publicDecrypt({
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, data);
  },
  buildXml (data, headless) {
    const builder = new Builder({
      rootName: 'jdpay',
      xmldec: {
        version: '1.0',
        encoding: 'UTF-8'
      },
      renderOpts: {
        newline: '',
        spacebeforeslash: ' '
      },
      headless,
    });
    return builder.buildObject(data);
  },
  normalize (data) {
    return Object.keys(data).sort().map(k => `${k}=${data[k]}`).join('&');
  },
  hash (str, al = 'md5') {
    const hash = crypto.createHash(al);
    hash.update(str, 'utf8');
    return hash.digest('hex');
  },
  parseXml (data) {
    return new Promise((resolve, reject) => {
      parseString(data, { trim: true, explicitArray: false, explicitRoot: false }, (err, rs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rs);
        return;
      });
    })
  },
  encryptDES3 (key, plaintext) {
    const buf = _padText(plaintext);
    const cipher = crypto.createCipheriv(algorithm, key, new Buffer(0));
    cipher.setAutoPadding(autopad);
    return flush(cipher, buf);
  },
  dencryptDES3 (key, data) {
    const decipher = crypto.createDecipheriv(algorithm, key, new Buffer(0));
    decipher.setAutoPadding(autopad);
    const buf = flush(decipher, data);
    return _rText(buf);
  },
  request (options) {
    return new Promise((resolve, reject) => {
      request.post(options, (err, resp, body) => {
        if (err) {
          reject(err);
          return;
        }
        if (resp.statusCode !== 200) {
          console.error('request failed [%s]', resp.statusCode);
          console.error(body);
          reject(body);
          return;
        }
        resolve(body);
      });
    })
  }
}

module.exports = utils;