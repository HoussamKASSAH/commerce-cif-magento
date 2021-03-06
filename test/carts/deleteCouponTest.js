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
const samplecartempty = require('../resources/sample-cart-empty');
const samplecart404 = require('../resources/sample-cart-404');
const samplecart404noproduct = require('../resources/sample-cart-404-no-product');
const config = require('../lib/config').config;
const requestConfig = require('../lib/config').requestConfig;
const specsBuilder = require('../lib/config').specsBuilder;

/**
 * Describes the unit tests for magento cart operation.
 */
describe('magento deleteCoupon', () => {
    
    describe('Unit Tests', () => {
        
        //build the helper in the context of '.this' suite
        setup(this, __dirname, 'deleteCoupon');

        specsBuilder('couponId', 'anycoupon').forEach( spec => {
        it(`returns the ${spec.name} cart without the removed coupon when called with valid cart id and any coupon code`, () => {
                const expectedArgs = [
                    requestConfig(encodeURI(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpoint}/coupons`), 'DELETE', spec.token),
                    requestConfig(`http://${config.MAGENTO_HOST}/rest/V1/${spec.baseEndpointAggregatedCart}?productAttributesSearchCriteria[filter_groups][0][filters][0][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][0][value]=color&productAttributesSearchCriteria[filter_groups][0][filters][1][field]=attribute_code&productAttributesSearchCriteria[filter_groups][0][filters][1][value]=size`,
                        'GET', spec.token)
                ];

                let mockedResponses = [];
                mockedResponses.push('true');
                mockedResponses.push(samplecartempty);

                return this.prepareResolveMultipleResponse(mockedResponses, expectedArgs).execute(Object.assign(spec.args, config))
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.strictEqual(result.response.statusCode, 200);
                        assert.isDefined(result.response.body);
                        assert.isDefined(result.response.body.id);
                    });
            });
        });
        
        it('returns missing property error when no cart id is provided', () => {
            return this.prepareReject(null).execute(null).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                assert.strictEqual(result.response.error.message, "Parameter 'id' is missing.");
            });
        });
        
        it('returns missing property error when no coupon code is provided', () => {
            let args = {
                id: 'dummy-id',
            }
            return this.prepareReject(null).execute(args).then(result => {
                assert.strictEqual(result.response.error.name, 'MissingPropertyError');
                assert.strictEqual(result.response.error.message, "Parameter 'couponId' is missing.");
            });
        });
        
        it('returns 404 for a non-existing cart', () => {
            let args = {
                id: 'dummy-id',
                couponId: 'anycoupon',
            }
            return this.prepareReject(samplecart404)
                    .execute(args)
                    .then(result => {
                        assert.isDefined(result.response);
                        assert.isDefined(result.response.error);
                        assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
                    });
        });

        it('returns 404 for empty cart', () => {
            let args = {
                id: 'dummy-id',
                couponId: 'anycoupon',
            }
            return this.prepareReject(samplecart404noproduct)
                .execute(args)
                .then(result => {
                    assert.isDefined(result.response);
                    assert.isDefined(result.response.error);
                    assert.strictEqual(result.response.error.name, 'CommerceServiceResourceNotFoundError');
            });
        });
    });
});
