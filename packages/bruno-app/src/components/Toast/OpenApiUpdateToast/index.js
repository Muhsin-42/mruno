import React from 'react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { IconArrowRight, IconX } from '@tabler/icons';
import OpenAPISyncIcon from 'components/Icons/OpenAPISync';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { setTabUiState } from 'providers/ReduxStore/slices/openapi-sync';
import StyledWrapper from './StyledWrapper';

const OpenApiUpdateToastContent = ({ t, collection, sourceUrl, dispatch }) => {
  const collectionName = collection?.name || 'Collection';

  const handleReviewAndSync = () => {
    toast.dismiss(t.id);
    if (dispatch && collection?.uid) {
      dispatch(setTabUiState({
        collectionUid: collection.uid,
        activeTab: 'spec-updates'
      }));
      dispatch(addTab({
        uid: uuid(),
        collectionUid: collection.uid,
        type: 'openapi-sync'
      }));
    }
  };

  const handleDismiss = () => {
    toast.dismiss(t.id);
  };

  return (
    <StyledWrapper
      data-testid="openapi-update-toast"
      style={{
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
      <div className="toast-accent" />
      <div className="toast-body">
        <div className="toast-header">
          <div className="toast-header-left">
            <OpenAPISyncIcon size={16} />
            <span className="toast-title" data-testid="openapi-update-toast-title">
              OpenAPI Spec Update
            </span>
          </div>
          <button
            type="button"
            className="toast-close"
            aria-label="Close notification"
            data-testid="openapi-update-toast-close"
            onClick={handleDismiss}
          >
            <IconX size={14} />
          </button>
        </div>

        <div className="toast-message" data-testid="openapi-update-toast-message">
          New updates are available for <strong>{collectionName}</strong>.
        </div>

        {sourceUrl && (
          <div className="toast-source" title={sourceUrl}>
            {sourceUrl}
          </div>
        )}

        <div className="toast-actions">
          <button
            type="button"
            className="toast-btn toast-btn-secondary"
            onClick={handleDismiss}
            data-testid="openapi-update-toast-dismiss"
          >
            Dismiss
          </button>
          <button
            type="button"
            className="toast-btn toast-btn-primary"
            onClick={handleReviewAndSync}
            data-testid="openapi-update-toast-sync"
          >
            <span>Review & Sync</span>
            <IconArrowRight size={14} />
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

// Track active toast IDs by collection UID so we don't duplicate notifications
const activeToasts = new Map();

/**
 * Show a global toast notification when an OpenAPI spec update is detected.
 */
export const showOpenApiUpdateToast = ({ collection, dispatch, sourceUrl }) => {
  if (!collection?.uid) return null;

  // If a toast is already active for this collection, dismiss it first
  const existingToastId = activeToasts.get(collection.uid);
  if (existingToastId) {
    toast.dismiss(existingToastId);
  }

  const toastId = toast.custom(
    (t) => (
      <OpenApiUpdateToastContent
        t={t}
        collection={collection}
        sourceUrl={sourceUrl || collection?.brunoConfig?.openapi?.[0]?.sourceUrl}
        dispatch={dispatch}
      />
    ),
    {
      duration: 12000,
      position: 'bottom-right'
    }
  );

  activeToasts.set(collection.uid, toastId);
  return toastId;
};

export default OpenApiUpdateToastContent;
