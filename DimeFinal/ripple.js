var express = require('express');
var router = express.Router();
var RippleAPI = require('ripple-lib').RippleAPI;
var api = new RippleAPI({
    server: process.env.RIPPLE_IP
});

//     ____  _             __        ______                 __
//    / __ \(_)___  ____  / /__     / ____/   _____  ____  / /______
//   / /_/ / / __ \/ __ \/ / _ \   / __/ | | / / _ \/ __ \/ __/ ___/
//  / _, _/ / /_/ / /_/ / /  __/  / /___ | |/ /  __/ / / / /_(__  )
// /_/ |_/_/ .___/ .___/_/\___/  /_____/ |___/\___/_/ /_/\__/____/
//        /_/   /_/

api.on('error', (errorCode, errorMessage) => {
    console.log(errorCode + ': ' + errorMessage);
});
api.on('connected', () => {
    console.log('Connecting To Ripple Network');
});
api.on('disconnected', (code) => {
    console.log('Breaking Connection from Ripple Network');
});

//     ____  _             __        ___    ____  ____
//    / __ \(_)___  ____  / /__     /   |  / __ \/  _/
//   / /_/ / / __ \/ __ \/ / _ \   / /| | / /_/ // /
//  / _, _/ / /_/ / /_/ / /  __/  / ___ |/ ____// /
// /_/ |_/_/ .___/ .___/_/\___/  /_/  |_/_/   /___/
//        /_/   /_/

/**
 *
 * @api {post} /ripple/account Get Account Information
 * @apiDescription Get account information for an address
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} address Address of the account to fetch the information
 * @apiParamExample  {type} Request-Example:
 * {
 *     "address" : "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
 * }
 *
 */
router.post('/account', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.getAccountInfo(req.body.address);
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

/**
 *
 * @api {post} /ripple/account/generate Create Account
 * @apiDescription Generates new address for a ripple account
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 */
router.post('/account/generate', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.generateAddress();
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

/**
 *
 * @api {post} /ripple/balance Get Balance
 * @apiDescription Get balance information for an address
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} address Address of the account to fetch the balance
 * @apiParamExample  {type} Request-Example:
 * {
 *     "address" : "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
 * }
 *
 */
router.post('/balance', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.getBalances(req.body.address);
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

/**
 *
 * @api {post} /ripple/transaction Create a Transaction
 * @apiDescription Create a transaction to send Ripple to an address
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} address Address from where you want to send Ripple
 * @apiParam  {string} secret Secret key for the address from where are you sending the Ripple
 * @apiParam  {string} payment An Object of source and destination address with the details of value to be sent
 *
 * @apiParamExample  {type} Request-Example:
 * {
 *     "address": "rHgeSrUq5kYMa57nsEyRSJzCL7pvmjLk3m",
 *     "secret": "saaGc4VD1GbKz359R71V9LX1r68zx",
 *     "payment": {
 *         "source": {
 *             "address": "rHgeSrUq5kYMa57nsEyRSJzCL7pvmjLk3m",
 *             "amount": {
 *                 "currency": "XRP",
 *                 "value": "20"
 *             }
 *         },
 *         "destination": {
 *             "address": "rPYsDpxm7zgtJZ6rxdjrGLwYUNS1jA4tWn",
 *             "tag":8782342,
 *             "minAmount": {
 *                 "currency": "XRP",
 *                 "value": "20"
 *             }
 *         }
 *     }
 * }
 *
 */
router.post('/transaction', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var preparedPayment = await api.preparePayment(req.body.address, req.body.payment);
        var signedHash = await api.sign(preparedPayment.txJSON, req.body.secret)
        var response = await api.submit(signedHash.signedTransaction);
        response.resultHash = signedHash.id;
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

/**
 *
 * @api {post} /ripple/transaction/hash Get Transaction By Hash
 * @apiDescription Get transaction information by the transaction hash
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} hash Hash of the transaction to fetch the information
 * @apiParamExample  {type} Request-Example:
 * {
 *     "hash" : "BDEA59F1D6C8446E261322A1AC52A7770DA709426AE5B95537E5D4A9117E077C"
 * }
 *
 */
router.post('/transaction/hash', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.getTransaction(req.body.hash);
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

/**
 *
 * @api {post} /fee/XRP Get estimated transaction fees
 * @apiDescription Get estimated transaction fees 
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 */
router.post('/fee/XRP', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.getFee();
        api.disconnect();
        res.status(200).send(JSON.parse('{"status": true,"data":"'+response+'"}'));
    } catch (error) {
        res.status(404).send(error);
    }
});
/**
 *
 * @api {post} /DropsToXrp convert XRP to drops
 * @apiDescription convert drops to XRP
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} Value that is required to convert
 * @apiParamExample  {type} Request-Example:
 * {
 *     "val" : "120000000"
 * }
 *
 */

router.post('/DropsToXrp', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.dropsToXrp(req.body.val);
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});
/**
 *
 * @api {post} /DropsToXrp convert XRP to drops
 * @apiDescription convert XRP to drops
 * @apiGroup Ripple
 * @apiVersion  0.1.0
 *
 * @apiHeaderExample Request-Headers:
 * {
 *     Accept: application/json
 *     Content-Type: application/json
 * }
 *
 * @apiParam  {string} Value that is required to convert
 * @apiParamExample  {type} Request-Example:
 * {
 *     "val" : "120000000"
 * }
 *
 */
router.post('/XrpToDrops', async function (req, res, next) {
    try {
        var connection = await api.connect();
        var response = await api.xrpToDrops(req.body.val);
        api.disconnect();
        res.status(200).send(response);
    } catch (error) {
        res.status(404).send(error);
    }
});

module.exports = router;