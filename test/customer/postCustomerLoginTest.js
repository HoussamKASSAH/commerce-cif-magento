/*******************************************************************************
 *
 *    Copyright 2018 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const assert = require('chai').assert;
const setup = require('../lib/setupTest').setup;
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;
const customerResponseMock = require('../resources/sample-customer');
const sampleCustomerLogin401 = require('../resources/sample-customer-login-401');
const sampleCart = require('../resources/sample-cart');
/**
 * Describes the unit tests for magento customer login operation.
 */
describe('Magento postCustomerLogin', () => {
    
    describe('Unit Tests', () => {
        
        let customerToken = 'qwtuyr382svfjt7l5abufyuxqsp4sknv';
        setup(this, __dirname, 'postCustomerLogin');

        it('successful customer login with cart', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;
            
            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCart
            ];
            
            let mockedResponses = [customerToken, customerResponseMock, sampleCart];
            
            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password'
                    })
                ).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body.customer);
                    assert.isDefined(result.response.body.cart);
                    assert.isDefined(result.response.headers['Set-Cookie']);
                    assert.isTrue(result.response.headers['Set-Cookie'].includes(customerToken));
                });
        });

        it('successful customer login with no cart', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;

            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCart
            ];

            let mockedResponses = [customerToken, customerResponseMock, Promise.reject({'statusCode': 404})];

            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password'
                    })
                ).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body.customer);
                    assert.isUndefined(result.response.body.cart);
                    assert.isDefined(result.response.headers['Set-Cookie']);
                    assert.isTrue(result.response.headers['Set-Cookie'].includes(customerToken));
                });
        });

        it('returns proper error for a customer login when get cart fails unexpectedly', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;

            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCart
            ];

            let mockedResponses = [customerToken, customerResponseMock, Promise.reject({'statusCode': 500})];

            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password'
                    })
                ).then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                    assert.strictEqual(result.response.error.message, 'Unknown error while communicating with Magento');
                });
        });

        it('successful customer login and cart assign', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCartBeforeMerge = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine`), 'GET');
            let assignCartRequest = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine/merge-with-guest-cart/${sampleCart.cart_details.id}`), 'PUT');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            getCustomerCartBeforeMerge.headers.authorization = assignCartRequest.headers.authorization = getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;

            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCartBeforeMerge,
                assignCartRequest,
                getCustomerCart,
            ];

            let mockedResponses = [customerToken, customerResponseMock, '', '', sampleCart];

            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password',
                        anonymousCartId: sampleCart.cart_details.id
                    })
                ).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body.customer);
                    assert.isDefined(result.response.body.cart);
                    assert.isDefined(result.response.headers['Set-Cookie']);
                    assert.isTrue(result.response.headers['Set-Cookie'].includes(customerToken));
                });
        });

        it('successful customer login and cart assign when customer does not have an active cart', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCartBeforeMerge = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine`), 'GET');
            let createsEmptyCart = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine`), 'POST');
            let assignCartRequest = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine/merge-with-guest-cart/${sampleCart.cart_details.id}`), 'PUT');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            createsEmptyCart.headers.authorization = getCustomerCartBeforeMerge.headers.authorization = assignCartRequest.headers.authorization = getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;

            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCartBeforeMerge,
                createsEmptyCart,
                assignCartRequest,
                getCustomerCart,
            ];

            let mockedResponses = [customerToken, customerResponseMock, Promise.reject({statusCode: 404}), '', '', sampleCart];

            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password',
                        anonymousCartId: sampleCart.cart_details.id
                    })
                ).then(result => {
                    assert.strictEqual(result.response.statusCode, 200);
                    assert.isDefined(result.response.body.customer);
                    assert.isDefined(result.response.body.cart);
                    assert.isDefined(result.response.headers['Set-Cookie']);
                    assert.isTrue(result.response.headers['Set-Cookie'].includes(customerToken));
                });
        });

        it('fails with unexpected error at customer cart merge when get cart returns 500', () => {
            let body = {
                username: 'a@a.com',
                password: 'password'
            };
            let postRequestWithBody = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/integration/customer/token`, 'POST');
            postRequestWithBody.body = body;
            let getRequestWithCustomerToken = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/customers/me`), 'GET');
            let getCustomerCartBeforeMerge = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine`), 'GET');
            let createsEmptyCart = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine`), 'POST');
            let assignCartRequest = requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/carts/mine/merge-with-guest-cart/${sampleCart.cart_details.id}`), 'PUT');
            let getCustomerCart = requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/customer-aggregated-carts/mine?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,'GET');
            createsEmptyCart.headers.authorization = getCustomerCartBeforeMerge.headers.authorization = assignCartRequest.headers.authorization = getCustomerCart.headers.authorization = getRequestWithCustomerToken.headers.authorization = 'Bearer ' + customerToken;

            const expectedArgs = [
                postRequestWithBody,
                getRequestWithCustomerToken,
                getCustomerCartBeforeMerge,
                createsEmptyCart,
                assignCartRequest,
                getCustomerCart,
            ];

            let mockedResponses = [customerToken, customerResponseMock, Promise.reject({statusCode: 500}), '', '', sampleCart];

            return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs)
                .execute(
                    Object.assign(config, {
                        email: 'a@a.com',
                        password: 'password',
                        anonymousCartId: sampleCart.cart_details.id
                    })
                ).then(result => {
                    assert.strictEqual(result.response.error.name, 'UnexpectedError');
                    assert.strictEqual(result.response.error.message, 'Unknown error while communicating with Magento');
                });
        });


        it('returns proper error message with a failed login', () => {
            let args = {
                email: 'a@a.com',
                password: 'bad password'
            };
            return this.prepareReject(sampleCustomerLogin401).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'CommerceServiceUnauthorizedError');
                assert.strictEqual(result.response.error.message, 'Unauthorized Request');
            });
        });

        it('returns proper error when email is missing', () => {
            let args = {
                password: 'bad password'
            };
            return this.prepareReject(sampleCustomerLogin401).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                assert.strictEqual(result.response.error.message, 'Parameter \'email\' is missing.');
            });
        });

        it('returns proper error when password is missing', () => {
            let args = {
                email: 'a@a.com'
            };
            return this.prepareReject(sampleCustomerLogin401).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                assert.strictEqual(result.response.error.message, 'Parameter \'password\' is missing.');
            });
        });
    });
});
