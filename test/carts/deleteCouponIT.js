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

const chai = require('chai');
const chaiHttp = require('chai-http');
const HttpStatus = require('http-status-codes');
const setup = require('../lib/setupIT.js').setup;
const expect = chai.expect;
const requiredFields = require('../lib/requiredFields');

chai.use(chaiHttp);

/**
 * For this test to pass a coupon with code coupon10 should be configured in Magento.
 */
describe('magento deleteCoupon', function () {

    describe('Integration tests', function () {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        const couponCode = 'coupon10';

        let cartId;
        let cartEntryId;

        /** Create cart and add coupon code to cart. */
        beforeEach(function () {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .send({
                    currency: 'USD',
                    quantity: 1,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);

                    // Store cart id
                    cartId = res.body.id;
                    cartEntryId = res.body.entries[0].id;

                    return chai.request(env.openwhiskEndpoint)
                        .post(env.cartsPackage + `/${cartId}/coupons`)
                        .send({
                            code: couponCode
                        });
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body).to.have.property('coupons');
                    expect(res.body.coupons).to.have.lengthOf(1);

                    let coupon = res.body.coupons[0];
                    expect(coupon).to.have.property('id');
                    expect(coupon).to.have.property('code');
                    expect(coupon.code).to.equal(couponCode);
                });
        });

        /** Delete cart entry */
        after(function () {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });

        it('deletes a coupon code from an existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/${cartId}/coupons/${couponCode}`)
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    requiredFields.verifyCart(res.body);
                    expect(res.body).to.not.have.property('coupons');
                });
        });

        it('returns 404 for deleting a coupon code from a non existing cart', function () {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/does-not-exist/coupons/${couponCode}`)
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns 405 for a missing coupon code', function () {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/${cartId}/coupons/`)
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.METHOD_NOT_ALLOWED);
                });
        });
    });
});