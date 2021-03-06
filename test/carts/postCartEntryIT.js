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


describe('magento postCartEntry', function() {

    describe('Integration tests', function() {

        // Get environment
        let env = setup();

        // Increase test timeout
        this.slow(env.slow);
        this.timeout(env.timeout);

        let cartId;
        let cartEntryId;
        let cartEntryIdSecond;
        const productVariantId = env.PRODUCT_VARIANT_EQBISUMAS_10;
        const productVariantIdSecond = env.PRODUCT_VARIANT_EQBISUMAS_11;

        /** Create cart. */
        before(function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .send({
                    currency: 'USD',
                    quantity: 3,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res.body.id).to.not.be.empty;

                    // Store cart id
                    cartId = res.body.id;
                    cartEntryId = res.body.entries[0].id;
                });
        });

        /** Delete cart entry. */
        after(function() {
            return chai.request(env.openwhiskEndpoint)
                .delete(env.cartsPackage + `/${cartId}/entries/${cartEntryId}`)
                .then(res => {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.entries).to.have.lengthOf(1);

                    return chai.request(env.openwhiskEndpoint)
                        .delete(env.cartsPackage + `/${cartId}/entries/${cartEntryIdSecond}`);
                }).then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.OK);
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });

        it('creates an empty cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .query({
                    currency: 'EUR'
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res).to.have.property('headers');
                    expect(res.headers).to.have.property('location');

                    // Verify structure
                    requiredFields.verifyCart(res.body);
                    expect(res.body.id).to.not.be.empty;
                    expect(res.body).to.have.own.property('lastModifiedAt');
                    expect(res.body).to.have.own.property('createdAt');
                    expect(res.body.entries).to.have.lengthOf(0);
                });
        });

        it('adds a product to an existing cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + `/${cartId}/entries`)
                .send({
                    quantity: 2,
                    productVariantId: productVariantIdSecond
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res).to.have.property('headers');
                    expect(res.headers).to.have.property('location');

                    // Verify structure
                    requiredFields.verifyCart(res.body);
                    expect(res.body.id).to.equal(cartId);
                    expect(res.body).to.have.own.property('lastModifiedAt');
                    expect(res.body).to.have.own.property('createdAt');
                    expect(res.body.entries).to.have.lengthOf(2);
                    cartEntryIdSecond = res.body.entries[1].id;
                    // Verify that product was added
                    let addedEntry;
                    for (let entry of res.body.entries) {
                        if (entry.productVariant.sku == productVariantIdSecond) {
                            addedEntry = entry;
                        }
                    }
                    expect(addedEntry.quantity).to.equal(2);
                });
        });

        it('adds a product to a new cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .send({
                    currency: 'USD',
                    quantity: 2,
                    productVariantId: productVariantId
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(HttpStatus.CREATED);
                    expect(res).to.have.property('headers');
                    expect(res.headers).to.have.property('location');

                    // Verify structure
                    requiredFields.verifyCart(res.body);
                    expect(res.body.id).to.not.be.empty;
                    expect(res.body).to.have.own.property('lastModifiedAt');
                    expect(res.body).to.have.own.property('createdAt');
                    expect(res.body.entries).to.have.lengthOf(1);

                    // Verify entry structure
                    const entry = res.body.entries[0];
                    expect(entry.quantity).to.equal(2);
                    expect(entry.productVariant.sku).to.equal(productVariantId);
                });
        });

        it('returns a 400 error for an invalid quantity', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .send({
                    quantity: -12,
                    id: cartId,
                    productVariantId: productVariantIdSecond
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.BAD_REQUEST);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

        it('returns a 404 error for an invalid product variant id', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage)
                .send({
                    quantity: 1,
                    id: cartId,
                    productVariantId: 'does-not-exist'
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        })

        it('returns a 404 error for adding a product to a non existent cart', function() {
            return chai.request(env.openwhiskEndpoint)
                .post(env.cartsPackage + '/does-not-exist/entries')
                .send({
                    quantity: 1,
                    productVariantId: productVariantId
                })
                .then(function(res) {
                    expect(res).to.have.status(HttpStatus.NOT_FOUND);
                    expect(res).to.be.json;
                    requiredFields.verifyErrorResponse(res.body);
                });
        });

    });
});