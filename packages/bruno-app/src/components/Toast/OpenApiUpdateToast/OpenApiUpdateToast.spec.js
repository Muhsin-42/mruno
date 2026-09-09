import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import toast from 'react-hot-toast';
import OpenApiUpdateToastContent, { showOpenApiUpdateToast } from './index';

jest.mock('react-hot-toast', () => ({
  dismiss: jest.fn(),
  custom: jest.fn((fn) => 'toast-123')
}));

const mockTheme = {
  text: '#ffffff',
  background: {
    base: '#1e1e1e',
    surface1: '#2a2a2a',
    surface2: '#333333'
  },
  border: {
    border1: '#333333',
    border2: '#444444',
    radius: {
      sm: '3px',
      md: '6px',
      lg: '8px'
    }
  },
  shadow: {
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
  },
  status: {
    warning: {
      text: '#f59e0b',
      background: '#2b2315',
      border: '#78350f'
    }
  },
  colors: {
    text: {
      subtext1: '#a0a0a0',
      subtext2: '#707070',
      yellow: '#f59e0b'
    }
  },
  primary: {
    solid: '#546de5',
    hover: '#455cc7'
  }
};

const renderWithTheme = (ui) => render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);

describe('OpenApiUpdateToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCollection = {
    uid: 'col-123',
    name: 'ZippTrack API',
    brunoConfig: {
      openapi: [
        {
          sourceUrl: 'http://localhost:9000/openapi.json'
        }
      ]
    }
  };

  it('renders notification title, collection name, and source URL', () => {
    const t = { id: 'test-toast', visible: true };
    renderWithTheme(
      <OpenApiUpdateToastContent
        t={t}
        collection={mockCollection}
        sourceUrl="http://localhost:9000/openapi.json"
        dispatch={jest.fn()}
      />
    );

    expect(screen.getByTestId('openapi-update-toast-title')).toHaveTextContent('OpenAPI Spec Update');
    expect(screen.getByTestId('openapi-update-toast-message')).toHaveTextContent('New updates are available for ZippTrack API.');
    expect(screen.getByText('http://localhost:9000/openapi.json')).toBeInTheDocument();
    expect(screen.getByTestId('openapi-update-toast-sync')).toBeInTheDocument();
    expect(screen.getByTestId('openapi-update-toast-dismiss')).toBeInTheDocument();
  });

  it('dismisses toast when Dismiss button or close icon is clicked', () => {
    const t = { id: 'test-toast', visible: true };
    renderWithTheme(
      <OpenApiUpdateToastContent
        t={t}
        collection={mockCollection}
        sourceUrl="http://localhost:9000/openapi.json"
        dispatch={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('openapi-update-toast-dismiss'));
    expect(toast.dismiss).toHaveBeenCalledWith('test-toast');

    fireEvent.click(screen.getByTestId('openapi-update-toast-close'));
    expect(toast.dismiss).toHaveBeenCalledWith('test-toast');
  });

  it('navigates to spec-updates tab and dismisses toast when Review & Sync is clicked', () => {
    const t = { id: 'test-toast', visible: true };
    const mockDispatch = jest.fn();

    renderWithTheme(
      <OpenApiUpdateToastContent
        t={t}
        collection={mockCollection}
        sourceUrl="http://localhost:9000/openapi.json"
        dispatch={mockDispatch}
      />
    );

    fireEvent.click(screen.getByTestId('openapi-update-toast-sync'));

    expect(toast.dismiss).toHaveBeenCalledWith('test-toast');
    expect(mockDispatch).toHaveBeenCalledTimes(2);

    // Expect setTabUiState to 'spec-updates'
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'openapiSync/setTabUiState',
      payload: expect.objectContaining({
        collectionUid: 'col-123',
        activeTab: 'spec-updates'
      })
    }));

    // Expect addTab for openapi-sync
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'tabs/addTab',
      payload: expect.objectContaining({
        collectionUid: 'col-123',
        type: 'openapi-sync'
      })
    }));
  });

  it('showOpenApiUpdateToast creates a custom toast with bottom-right position', () => {
    const mockDispatch = jest.fn();
    const id = showOpenApiUpdateToast({
      collection: mockCollection,
      dispatch: mockDispatch,
      sourceUrl: 'http://localhost:9000/openapi.json'
    });

    expect(id).toBe('toast-123');
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        duration: 12000,
        position: 'bottom-right'
      })
    );
  });
});
