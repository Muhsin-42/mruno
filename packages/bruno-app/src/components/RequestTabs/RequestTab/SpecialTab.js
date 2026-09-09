import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from 'providers/Theme';
import GradientCloseButton from './GradientCloseButton';
import StatusBadge from 'ui/StatusBadge';
import { IconVariable, IconSettings, IconRun, IconFolder, IconDatabase, IconWorld, IconHome, IconFileCode, IconConfetti, IconServer2 } from '@tabler/icons';
import OpenAPISyncIcon from 'components/Icons/OpenAPISync';

const SpecialTab = ({ handleCloseClick, type, tabName, handleDoubleClick, hasDraft, tab }) => {
  const { theme } = useTheme();
  const collectionUpdates = useSelector((state) => state.openapiSync?.collectionUpdates || {});
  const hasOpenApiUpdates = tab?.collectionUid && collectionUpdates[tab.collectionUid]?.hasUpdates;
  const hasOpenApiError = tab?.collectionUid && collectionUpdates[tab.collectionUid]?.error;

  const getTabInfo = (type, tabName) => {
    switch (type) {
      case 'collection-settings': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Collection</span>
          </>
        );
      }
      case 'collection-overview': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Overview</span>
          </>
        );
      }
      case 'folder-settings': {
        return (
          <>
            <IconFolder size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">{tabName || 'Folder'}</span>
          </>
        );
      }
      case 'variables': {
        return (
          <>
            <IconVariable size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Variables</span>
          </>
        );
      }
      case 'collection-runner': {
        return (
          <>
            <IconRun size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Runner</span>
          </>
        );
      }
      case 'environment-settings': {
        return (
          <>
            <IconDatabase size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Environments</span>
          </>
        );
      }
      case 'global-environment-settings': {
        return (
          <>
            <IconWorld size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Global Environments</span>
          </>
        );
      }
      case 'preferences': {
        return (
          <>
            <IconSettings size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Preferences</span>
          </>
        );
      }
      case 'workspaceOverview': {
        return (
          <>
            <IconHome size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Overview</span>
          </>
        );
      }
      case 'workspaceEnvironments': {
        return (
          <>
            <IconWorld size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">Environments</span>
          </>
        );
      }
      case 'openapi-sync': {
        return (
          <>
            <div className="relative flex items-center">
              <OpenAPISyncIcon size={14} className="special-tab-icon flex-shrink-0" />
              {(hasOpenApiUpdates || hasOpenApiError) && (
                <span
                  className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: hasOpenApiError ? (theme?.status?.danger?.text || '#ef4444') : (theme?.status?.warning?.text || '#f59e0b') }}
                />
              )}
            </div>
            <span className="ml-1 tab-name mr-1">OpenAPI</span>
          </>
        );
      }
      case 'openapi-spec': {
        return (
          <>
            <IconFileCode size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">API Spec</span>
          </>
        );
      }
      case 'mock-server': {
        return (
          <>
            <IconServer2 size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name mr-1">{tabName || 'Mock Server'}</span>
            <StatusBadge status="info" size="xs">Beta</StatusBadge>
          </>
        );
      }
      case 'changelog': {
        return (
          <>
            <IconConfetti size={14} strokeWidth={1.5} className="special-tab-icon flex-shrink-0" />
            <span className="ml-1 tab-name">What's New</span>
          </>
        );
      }
    }
  };

  return (
    <>
      <div
        className="flex items-center tab-label"
        onDoubleClick={handleDoubleClick}
      >
        {getTabInfo(type, tabName)}
      </div>

      <GradientCloseButton hasChanges={hasDraft} onClick={handleCloseClick} />
    </>
  );
};

export default SpecialTab;
