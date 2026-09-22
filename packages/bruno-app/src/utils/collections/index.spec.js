const { describe, it, expect } = require('@jest/globals');
import { mergeHeaders, transformRequestToSaveToFilesystem, getCollectionItemCounts, getVariableScope } from './index';

describe('mergeHeaders', () => {
  it('should include headers from collection, folder and request (with correct precedence)', () => {
    const collection = {
      root: {
        request: {
          headers: [
            { name: 'X-Collection', value: 'c', enabled: true }
          ]
        }
      }
    };

    const folder = {
      type: 'folder',
      root: {
        request: {
          headers: [
            { name: 'X-Folder', value: 'f', enabled: true }
          ]
        }
      }
    };

    const request = {
      headers: [
        { name: 'X-Request', value: 'r', enabled: true }
      ]
    };

    const headers = mergeHeaders(collection, request, [folder]);
    const names = headers.map((h) => h.name);
    expect(names).toEqual(expect.arrayContaining(['X-Collection', 'X-Folder', 'X-Request']));
  });
});

describe('transformRequestToSaveToFilesystem', () => {
  it('preserves header and param annotations', () => {
    const item = {
      uid: 'requestuid123456789012',
      type: 'http-request',
      name: 'Annotated Request',
      seq: 1,
      settings: {},
      tags: [],
      examples: [],
      request: {
        method: 'GET',
        url: 'https://example.com',
        params: [
          {
            uid: 'paramuid1234567890123',
            name: 'q',
            value: '1',
            description: '',
            annotations: [{ name: 'param-note', value: 'keep me' }],
            type: 'query',
            enabled: true
          }
        ],
        headers: [
          {
            uid: 'headeruid123456789012',
            name: 'X-Test',
            value: '1',
            description: '',
            annotations: [{ name: 'header-note', value: 'keep me' }],
            enabled: true
          }
        ],
        auth: { mode: 'none' },
        body: { mode: 'none' },
        script: { req: '', res: '' },
        vars: { req: [], res: [] },
        assertions: [],
        tests: '',
        docs: ''
      }
    };

    const transformed = transformRequestToSaveToFilesystem(item);

    expect(transformed.request.params[0].annotations).toEqual([{ name: 'param-note', value: 'keep me' }]);
    expect(transformed.request.headers[0].annotations).toEqual([{ name: 'header-note', value: 'keep me' }]);
  });
});

describe('getCollectionItemCounts', () => {
  it('counts folders and requests recursively at every depth', () => {
    const items = [
      {
        type: 'folder',
        name: 'Zoo',
        items: [
          { type: 'http-request', name: 'Lion', request: {} },
          { type: 'graphql-request', name: 'Bear', request: {} }
        ]
      },
      {
        type: 'folder',
        name: 'Aviary',
        items: [
          {
            type: 'folder',
            name: 'Nest',
            items: [{ type: 'http-request', name: 'Egg', request: {} }]
          }
        ]
      },
      { type: 'http-request', name: 'RootReq', request: {} }
    ];

    // Folders: Zoo, Aviary, Nest -> 3. Requests: Lion, Bear, Egg, RootReq -> 4.
    expect(getCollectionItemCounts(items)).toEqual({ folderCount: 3, requestCount: 4 });
  });

  it('counts every request transport type', () => {
    const items = [
      { type: 'http-request', request: {} },
      { type: 'graphql-request', request: {} },
      { type: 'grpc-request', request: {} },
      { type: 'ws-request', request: {} }
    ];

    expect(getCollectionItemCounts(items)).toEqual({ folderCount: 0, requestCount: 4 });
  });

  it('returns zero counts for empty or missing items', () => {
    expect(getCollectionItemCounts([])).toEqual({ folderCount: 0, requestCount: 0 });
    expect(getCollectionItemCounts(undefined)).toEqual({ folderCount: 0, requestCount: 0 });
  });
});

describe('getVariableScope', () => {
  it('returns runtime scope when variable exists in collection.runtimeVariables', () => {
    const collection = {
      uid: 'col-1',
      runtimeVariables: {
        identifier: '7000000000'
      }
    };

    const scopeInfo = getVariableScope('identifier', collection, null);
    expect(scopeInfo).toEqual({
      type: 'runtime',
      value: '7000000000',
      data: { collection, variableName: 'identifier', value: '7000000000' }
    });
  });

  it('prioritizes runtime variables over request, collection, and environment variables', () => {
    const collection = {
      uid: 'col-1',
      runtimeVariables: {
        token: 'runtime-token'
      },
      root: {
        request: {
          vars: {
            req: [
              { name: 'token', value: 'collection-token', enabled: true }
            ]
          }
        }
      },
      activeEnvironmentUid: 'env-1',
      environments: [
        {
          uid: 'env-1',
          variables: [
            { name: 'token', value: 'env-token', enabled: true }
          ]
        }
      ]
    };

    const item = {
      uid: 'req-1',
      request: {
        vars: {
          req: [
            { name: 'token', value: 'req-token', enabled: true }
          ]
        }
      }
    };

    const scopeInfo = getVariableScope('token', collection, item);
    expect(scopeInfo).toEqual({
      type: 'runtime',
      value: 'runtime-token',
      data: { collection, variableName: 'token', value: 'runtime-token' }
    });
  });

  it('falls back to request scope when variable is not in runtimeVariables', () => {
    const collection = {
      uid: 'col-1',
      runtimeVariables: {}
    };

    const item = {
      uid: 'req-1',
      request: {
        vars: {
          req: [
            { name: 'myVar', value: 'myVal', enabled: true }
          ]
        }
      }
    };

    const scopeInfo = getVariableScope('myVar', collection, item);
    expect(scopeInfo.type).toBe('request');
    expect(scopeInfo.value).toBe('myVal');
  });
});
