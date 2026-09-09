import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkActiveWorkspaceCollectionsForUpdates } from 'providers/ReduxStore/slices/openapi-sync';
import { normalizePath } from 'utils/common/path';

// Poll ticker checks every 15s against each collection's autoCheckInterval
const POLL_TICK_INTERVAL = 15 * 1000;

const useOpenAPISyncPolling = () => {
  const dispatch = useDispatch();

  const pollingEnabled = useSelector((state) => state.openapiSync?.pollingEnabled ?? true);
  const collections = useSelector((state) => state.collections?.collections || []);
  const { workspaces, activeWorkspaceUid } = useSelector((state) => state.workspaces);
  const activeWorkspace = workspaces.find((w) => w.uid === activeWorkspaceUid);
  const intervalRef = useRef(null);

  // Filter to only active workspace collections
  const activeWorkspaceCollections = useMemo(() => {
    if (!activeWorkspace) return [];
    return collections.filter((c) =>
      activeWorkspace.collections?.some((wc) => normalizePath(wc.path) === normalizePath(c.pathname))
    );
  }, [activeWorkspace, collections]);

  // Derive a stable boolean so polling doesn't restart on every collection mutation
  const hasSyncableCollections = useMemo(
    () => activeWorkspaceCollections.some((c) => {
      const syncConfig = c.brunoConfig?.openapi?.[0];
      return syncConfig?.sourceUrl && syncConfig.autoCheck !== false;
    }),
    [activeWorkspaceCollections]
  );

  useEffect(() => {
    if (!pollingEnabled || !hasSyncableCollections) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check after app mounts
    const initialTimeout = setTimeout(() => {
      dispatch(checkActiveWorkspaceCollectionsForUpdates());
    }, 2000);

    // Set up polling interval ticker
    intervalRef.current = setInterval(() => {
      dispatch(checkActiveWorkspaceCollectionsForUpdates());
    }, POLL_TICK_INTERVAL);

    // Check immediately when user switches focus back to Bruno
    const handleWindowFocus = () => {
      dispatch(checkActiveWorkspaceCollectionsForUpdates({ force: true }));
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [dispatch, pollingEnabled, hasSyncableCollections]);

  return null;
};

export default useOpenAPISyncPolling;
