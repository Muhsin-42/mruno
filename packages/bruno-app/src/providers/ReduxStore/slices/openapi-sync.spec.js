import reducer, {
  setCollectionUpdate,
  markUpdateNotified,
  clearCollectionUpdate,
  clearCollectionState,
  checkCollectionForUpdates,
  checkActiveWorkspaceCollectionsForUpdates
} from './openapi-sync';
import * as toastModule from 'components/Toast/OpenApiUpdateToast';

jest.mock('components/Toast/OpenApiUpdateToast', () => ({
  showOpenApiUpdateToast: jest.fn()
}));

describe('openapiSync slice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets collection update with remoteSpecHash and lastChecked', () => {
    const initialState = undefined;
    const action = setCollectionUpdate({
      collectionUid: 'col-1',
      hasUpdates: true,
      error: null,
      remoteSpecHash: 'hash-abc-123'
    });

    const state = reducer(initialState, action);

    expect(state.collectionUpdates['col-1']).toEqual({
      hasUpdates: true,
      error: null,
      remoteSpecHash: 'hash-abc-123',
      lastChecked: expect.any(Number)
    });
  });

  it('marks update as notified for a collection', () => {
    const action = markUpdateNotified({
      collectionUid: 'col-1',
      hash: 'hash-abc-123'
    });

    const state = reducer(undefined, action);

    expect(state.notifiedUpdates['col-1']).toBe('hash-abc-123');
  });

  it('clears collection update and notified hash on clearCollectionUpdate', () => {
    const populatedState = {
      collectionUpdates: {
        'col-1': { hasUpdates: true, error: null, remoteSpecHash: 'hash-1', lastChecked: 12345 }
      },
      notifiedUpdates: {
        'col-1': 'hash-1'
      },
      pollingEnabled: true,
      lastPollTime: null,
      tabUiState: {},
      storedSpecMeta: {},
      storedSpec: {},
      drift: {}
    };

    const state = reducer(populatedState, clearCollectionUpdate({ collectionUid: 'col-1' }));

    expect(state.collectionUpdates['col-1']).toBeUndefined();
    expect(state.notifiedUpdates['col-1']).toBeUndefined();
  });

  it('clears all collection state including notified hash on clearCollectionState', () => {
    const populatedState = {
      collectionUpdates: {
        'col-1': { hasUpdates: true, error: null, remoteSpecHash: 'hash-1', lastChecked: 12345 }
      },
      notifiedUpdates: {
        'col-1': 'hash-1'
      },
      tabUiState: { 'col-1': { activeTab: 'spec-updates' } },
      storedSpecMeta: { 'col-1': { title: 'API' } },
      storedSpec: { 'col-1': {} },
      drift: { 'col-1': {} },
      pollingEnabled: true,
      lastPollTime: null
    };

    const state = reducer(populatedState, clearCollectionState({ collectionUid: 'col-1' }));

    expect(state.collectionUpdates['col-1']).toBeUndefined();
    expect(state.notifiedUpdates['col-1']).toBeUndefined();
    expect(state.tabUiState['col-1']).toBeUndefined();
    expect(state.storedSpecMeta['col-1']).toBeUndefined();
    expect(state.storedSpec['col-1']).toBeUndefined();
    expect(state.drift['col-1']).toBeUndefined();
  });
});

describe('checkCollectionForUpdates thunk', () => {
  const originalIpc = window.ipcRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.ipcRenderer = originalIpc;
  });

  it('calls ipcRenderer and shows toast on new update hash', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      hasUpdates: true,
      remoteSpecHash: 'new-remote-hash'
    });

    window.ipcRenderer = {
      invoke: mockInvoke
    };

    const collection = {
      uid: 'col-1',
      pathname: '/path/to/col',
      brunoConfig: {
        openapi: [
          {
            sourceUrl: 'http://localhost:9000/openapi.json',
            specHash: 'old-stored-hash'
          }
        ]
      }
    };

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue({
      openapiSync: {
        notifiedUpdates: {}
      }
    });

    const result = await checkCollectionForUpdates(collection)(dispatch, getState);

    expect(result.hasUpdates).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith('renderer:check-openapi-updates', expect.objectContaining({
      collectionUid: 'col-1',
      sourceUrl: 'http://localhost:9000/openapi.json',
      storedSpecHash: 'old-stored-hash'
    }));

    expect(dispatch).toHaveBeenCalledWith(setCollectionUpdate({
      collectionUid: 'col-1',
      hasUpdates: true,
      error: null,
      remoteSpecHash: 'new-remote-hash'
    }));

    expect(dispatch).toHaveBeenCalledWith(markUpdateNotified({
      collectionUid: 'col-1',
      hash: 'new-remote-hash'
    }));

    expect(toastModule.showOpenApiUpdateToast).toHaveBeenCalledWith({
      collection,
      dispatch,
      sourceUrl: 'http://localhost:9000/openapi.json'
    });
  });

  it('does not show toast if hash is already notified', async () => {
    const mockInvoke = jest.fn().mockResolvedValue({
      hasUpdates: true,
      remoteSpecHash: 'already-notified-hash'
    });

    window.ipcRenderer = {
      invoke: mockInvoke
    };

    const collection = {
      uid: 'col-1',
      pathname: '/path/to/col',
      brunoConfig: {
        openapi: [
          {
            sourceUrl: 'http://localhost:9000/openapi.json',
            specHash: 'old-stored-hash'
          }
        ]
      }
    };

    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue({
      openapiSync: {
        notifiedUpdates: {
          'col-1': 'already-notified-hash'
        }
      }
    });

    await checkCollectionForUpdates(collection)(dispatch, getState);

    expect(toastModule.showOpenApiUpdateToast).not.toHaveBeenCalled();
  });
});
