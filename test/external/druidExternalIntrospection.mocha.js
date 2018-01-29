/*
 * Copyright 2015-2017 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { expect } = require("chai");
const { PassThrough } = require('readable-stream');


let plywood = require('../plywood');
let { Expression, External, TimeRange, $, ply, r } = plywood;

function promiseFnToStream(promiseRq) {
  return (rq) => {
    const stream = new PassThrough({ objectMode: true });

    promiseRq(rq)
      .then(
        (res) => {
          if (res) stream.write(res);
          stream.end();
        },
        (e) => {
          stream.emit('error', e);
          stream.end();
        }
      );

    return stream;
  }
}

describe("DruidExternal Introspection", () => {
  let requesterFail = promiseFnToStream(({query}) => {
    return Promise.reject(new Error('Bad status code'));
  });


  let requesterDruid_0_9_0 = promiseFnToStream(({query}) => {
    if (query.queryType === 'status') return Promise.resolve({ version: '0.9.0' });
    expect(query.dataSource).to.equal('wikipedia');

    if (query.queryType === 'segmentMetadata') {
      expect(query.merge).to.equal(true);
      expect(query.analysisTypes).to.be.an('array');
      expect(query.lenientAggregatorMerge).to.equal(true);

      let merged = {
        "id": "merged",
        "intervals": null,
        "size": 0,
        "numRows": 654321,
        "columns": {
          "__time": {
            "type": "LONG",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "added": {
            "type": "FLOAT",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "anonymous": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "count": { "type": "LONG", "hasMultipleValues": false, "size": 0, "cardinality": null, "errorMessage": null },
          "delta": {
            "type": "FLOAT",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "delta_hist": {
            "type": "approximateHistogram",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "language": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "namespace": {
            "type": "STRING",
            "hasMultipleValues": true,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "newPage": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": "lol wtf"
          },
          "newUser": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": -1,
            "cardinality": 0,
            "errorMessage": null
          },
          "page": { "type": "STRING", "hasMultipleValues": false, "size": 0, "cardinality": 0, "errorMessage": null },
          "time": { "type": "STRING", "hasMultipleValues": false, "size": 0, "cardinality": 0, "errorMessage": null },
          "user_unique": {
            "type": "hyperUnique",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          }
        }
      };

      if (query.analysisTypes.indexOf("aggregators") !== -1) {
        merged.aggregators = {
          // Normal aggs
          "added": { "type": "doubleSum", "name": "added", "fieldName": "added" },
          "count": { "type": "longSum", "name": "count", "fieldName": "count" },

          // This can happen if the JS agg was used at ingestion time
          "delta": {
            "type": "javascript",
            "name": "delta",
            "fieldNames": [
              "delta"
            ],
            "fnAggregate": "function(partialA,partialB) {return partialA + partialB; }",
            "fnReset": "function() {return 0; }",
            "fnCombine": "function(partialA,partialB) {return partialA + partialB; }"
          },

          // A histogram
          "delta_hist": {
            "type": "approxHistogramFold",
            "name": "delta_hist",
            "fieldName": "delta_hist",
            "resolution": 50,
            "numBuckets": 7,
            "lowerLimit": "-Infinity",
            "upperLimit": "Infinity"
          },
          "user_unique": { "type": "hyperUnique", "name": "user_unique", "fieldName": "user_unique" }
        };
      }

      return Promise.resolve(merged);

    } else if (query.queryType === 'introspect') {
      return Promise.resolve({
        dimensions: ['anonymous', 'language', 'namespace', 'newPage', 'page', 'time'],
        metrics: ['added', 'count', 'delta_hist', 'user_unique']
      });

    } else {
      throw new Error(`unsupported query ${query.queryType}`);
    }
  });


  let requesterDruid_0_8_3 = promiseFnToStream(({query}) => {
    if (query.queryType === 'status') return Promise.resolve({ version: '0.8.3' });
    expect(query.dataSource).to.equal('wikipedia');

    if (query.queryType === 'segmentMetadata') {
      expect(query.merge).to.equal(true);
      expect(query.analysisTypes).to.be.an('array');
      expect(query.context).to.deep.equal({
        hello: 'world'
      });

      let merged = {
        "id": "merged",
        "intervals": null,
        "size": 0,
        "numRows": 654321,
        "columns": {
          "__time": {
            "type": "LONG",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "added": {
            "type": "FLOAT",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "anonymous": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "count": { "type": "LONG", "hasMultipleValues": false, "size": 0, "cardinality": null, "errorMessage": null },
          "delta_hist": {
            "type": "approximateHistogram",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          },
          "language": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "namespace": {
            "type": "STRING",
            "hasMultipleValues": true,
            "size": 0,
            "cardinality": 0,
            "errorMessage": null
          },
          "newPage": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": 0,
            "errorMessage": "lol wtf"
          },
          "newUser": {
            "type": "STRING",
            "hasMultipleValues": false,
            "size": -1,
            "cardinality": 0,
            "errorMessage": null
          },
          "page": { "type": "STRING", "hasMultipleValues": false, "size": 0, "cardinality": 0, "errorMessage": null },
          "time": { "type": "STRING", "hasMultipleValues": false, "size": 0, "cardinality": 0, "errorMessage": null },
          "user_unique": {
            "type": "hyperUnique",
            "hasMultipleValues": false,
            "size": 0,
            "cardinality": null,
            "errorMessage": null
          }
        }
      };

      if (query.analysisTypes.indexOf("aggregators") !== -1) {
        return Promise.reject(new Error('Can not construct instance of io.druid.query.metadata.metadata.SegmentMetadataQuery$AnalysisType'));
      }

      return Promise.resolve(merged);

    } else if (query.queryType === 'introspect') {
      return Promise.resolve({
        dimensions: ['anonymous', 'language', 'namespace', 'newPage', 'page', 'time'],
        metrics: ['added', 'count', 'delta_hist', 'user_unique']
      });

    } else {
      throw new Error(`unsupported query ${query.queryType}`);
    }
  });


  let requesterDruid_0_8_2 = promiseFnToStream(({query}) => {
    if (query.queryType === 'status') return Promise.resolve({ version: '0.8.2' });
    expect(query.dataSource).to.equal('wikipedia');

    if (query.queryType === 'segmentMetadata') {
      expect(query.merge).to.equal(true);
      expect(query.analysisTypes).to.be.an('array');

      let merged = {
        "id": "merged",
        "intervals": null,
        "size": 0,
        "numRows": 654321,
        "columns": {
          "__time": { "type": "LONG", "size": 0, "cardinality": null, "errorMessage": null },
          "added": { "type": "FLOAT", "size": 0, "cardinality": null, "errorMessage": null },
          "anonymous": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": null },
          "count": { "type": "LONG", "size": 0, "cardinality": null, "errorMessage": null },
          "delta_hist": { "type": "COMPLEX", "size": 0, "cardinality": null, "errorMessage": null },
          "language": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": null },
          "namespace": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": null },
          "newPage": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": "lol wtf" },
          "newUser": { "type": "STRING", "size": -1, "cardinality": 0, "errorMessage": null },
          "page": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": null },
          "time": { "type": "STRING", "size": 0, "cardinality": 0, "errorMessage": null },
          "user_unique": { "type": "COMPLEX", "size": 0, "cardinality": null, "errorMessage": null }
        }
      };

      if (query.analysisTypes.indexOf("aggregators") !== -1) {
        return Promise.reject(new Error('Can not construct instance of io.druid.query.metadata.metadata.SegmentMetadataQuery$AnalysisType'));
      }

      return Promise.resolve(merged);

    } else if (query.queryType === 'introspect') {
      return Promise.resolve({
        dimensions: ['anonymous', 'language', 'namespace', 'newPage', 'page', 'time'],
        metrics: ['added', 'count', 'delta_hist', 'user_unique']
      });

    } else {
      throw new Error(`unsupported query ${query.queryType}`);
    }
  });


  let requesterDruid_0_8_1 = promiseFnToStream(({query}) => {
    if (query.queryType === 'status') return Promise.resolve({ version: '0.8.1' });
    expect(query.dataSource).to.equal('wikipedia');

    if (query.queryType === 'segmentMetadata') {
      expect(query.intervals).to.not.exist;
      return Promise.reject(new Error("Instantiation of [simple type, class io.druid.query.metadata.metadata.SegmentMetadataQuery] value failed: querySegmentSpec can't be null"));

    } else if (query.queryType === 'introspect') {
      return Promise.resolve({
        dimensions: ['anonymous', 'language', 'namespace', 'newPage', 'page', 'time'],
        metrics: ['added', 'count', 'delta_hist', 'user_unique']
      });

    } else {
      throw new Error(`unsupported query ${query.queryType}`);
    }
  });


  it("errors on bad introspectionStrategy", () => {
    expect(() => {
      External.fromJS({
        engine: 'druid',
        source: 'wikipedia',
        introspectionStrategy: 'crowd-source'
      }, requesterFail);
    }).to.throw("invalid introspectionStrategy 'crowd-source'");
  });

  it("does an introspect with general failure", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia'
    }, requesterFail);

    return wikiExternal.introspect()
      .then(() => {
        throw new Error('DID_NOT_ERROR');
      })
      .catch((err) => {
        expect(err.message).to.equal('Bad status code');
      });
  });

  it("does an introspect with segmentMetadata (with aggregators)", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time'
    }, requesterDruid_0_9_0);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.9.0');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "maker": {
              "expression": {
                "name": "added",
                "op": "ref"
              },
              "op": "sum"
            },
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "maker": {
              "op": "count"
            },
            "name": "count",
            "nativeType": "LONG",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "maker": {
              "expression": {
                "name": "delta",
                "op": "ref"
              },
              "op": "sum"
            },
            "name": "delta",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "approximateHistogram",
            "type": "NULL",
            "unsplitable": true
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "SET/STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "user_unique",
            "nativeType": "hyperUnique",
            "type": "NULL",
            "unsplitable": true
          }
        ]);
      });
  });

  it("does an introspect with segmentMetadata (without aggregators)", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time',
      context: {
        hello: 'world'
      }
    }, requesterDruid_0_8_3);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.8.3');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "count",
            "nativeType": "LONG",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "approximateHistogram",
            "type": "NULL",
            "unsplitable": true
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "SET/STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "user_unique",
            "nativeType": "hyperUnique",
            "type": "NULL",
            "unsplitable": true
          }
        ]);
      });
  });

  it("does an introspect with segmentMetadata (with old style COMPLEX columns)", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time'
    }, requesterDruid_0_8_2);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.8.2');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "count",
            "nativeType": "LONG",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "COMPLEX",
            "type": "NULL"
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "user_unique",
            "nativeType": "COMPLEX",
            "type": "NULL"
          }
        ]);
      });
  });

  it("does a simple introspect with GET", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time'
    }, requesterDruid_0_8_1);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.8.1');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "newPage",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "count",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "user_unique",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          }
        ]);
      });
  });

  it("respects the introspectionStrategy flag", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      introspectionStrategy: 'datasource-get',
      timeAttribute: 'time'
    }, requesterDruid_0_9_0);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.9.0');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "newPage",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "count",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "user_unique",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          }
        ]);
      });
  });

  it("does an introspect with overrides", () => {
    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time',
      attributeOverrides: [
        { name: "user_unique", type: 'NULL', nativeType: 'hyperUnique', "unsplitable": true },
        { name: "delta_hist", type: 'NULL', nativeType: 'approximateHistogram', unsplitable: true }
      ]
    }, requesterDruid_0_8_1);

    return wikiExternal.introspect()
      .then((introspectedExternal) => {
        expect(introspectedExternal.version).to.equal('0.8.1');
        expect(introspectedExternal.toJS().attributes).to.deep.equal([
          {
            "name": "time",
            "nativeType": "__time",
            "type": "TIME"
          },
          {
            "name": "anonymous",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "language",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "namespace",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "newPage",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "page",
            "nativeType": "STRING",
            "type": "STRING"
          },
          {
            "name": "added",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "count",
            "nativeType": "FLOAT",
            "type": "NUMBER",
            "unsplitable": true
          },
          {
            "name": "delta_hist",
            "nativeType": "approximateHistogram",
            "type": "NULL",
            "unsplitable": true
          },
          {
            "name": "user_unique",
            "nativeType": "hyperUnique",
            "type": "NULL",
            "unsplitable": true
          }
        ]);
      });
  });

  it("does a version aware based query", () => {
    let selectRequesterDruid = ({query}) => {
      if (query.queryType !== 'select') return requesterDruid_0_9_0({query});
      expect(query).to.deep.equal({
        "dataSource": "wikipedia",
        "dimensions": [
          "anonymous",
          "language",
          "namespace",
          "page"
        ],
        "granularity": "all",
        "intervals": "1000/3000",
        "metrics": [
          "added",
          "count",
          "delta",
          "delta_hist",
          "user_unique"
        ],
        "pagingSpec": {
          "pagingIdentifiers": {},
          "threshold": 50
        },
        "queryType": "select"
      });
      const stream = new PassThrough({ objectMode: true });
      setTimeout(() => { stream.end(); }, 1);
      return stream;
    };

    let wikiExternal = External.fromJS({
      engine: 'druid',
      source: 'wikipedia',
      timeAttribute: 'time',
      allowEternity: true,
      allowSelectQueries: true
    }, selectRequesterDruid);

    let context = { wiki: wikiExternal };

    return $('wiki').compute(context)
      .then((results) => {
        expect(results.toJS().data).to.deep.equal([]);
      });
  });
});
