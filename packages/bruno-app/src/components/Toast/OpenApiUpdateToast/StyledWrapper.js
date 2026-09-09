import styled from 'styled-components';
import { rgba } from 'polished';

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  background: ${(props) => props.theme.background.base};
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border.border2};
  border-radius: ${(props) => props.theme.border.radius.md};
  overflow: hidden;
  max-width: 400px;
  min-width: 340px;
  margin-bottom: 1.5rem;
  margin-right: 0.75rem;
  box-shadow: ${(props) => props.theme.shadow.lg};
  transition: all 0.3s ease;
  z-index: 9999;

  .toast-accent {
    width: 4px;
    flex-shrink: 0;
    border-radius: ${(props) => props.theme.border.radius.md} 0 0 ${(props) => props.theme.border.radius.md};
    background: ${(props) => props.theme.status?.warning?.text || props.theme.colors?.text?.yellow || '#f59e0b'};
  }

  .toast-body {
    flex: 1;
    padding: 12px 14px;
  }

  .toast-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .toast-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${(props) => props.theme.status?.warning?.text || props.theme.colors?.text?.yellow || '#f59e0b'};
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: none;
    border: none;
    cursor: pointer;
    color: ${(props) => props.theme.text};
    border-radius: ${(props) => props.theme.border.radius.sm};
    opacity: 0.6;
    transition: opacity 0.2s ease, background-color 0.2s ease;

    &:hover {
      opacity: 1;
      background-color: ${(props) => rgba(props.theme.text, 0.1)};
    }
  }

  .toast-title {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.theme.text};
  }

  .toast-message {
    font-size: 12px;
    color: ${(props) => props.theme.colors.text.subtext1};
    margin-bottom: 4px;
    line-height: 1.4;

    strong {
      color: ${(props) => props.theme.text};
      font-weight: 600;
    }
  }

  .toast-source {
    font-size: 11px;
    color: ${(props) => props.theme.colors.text.subtext2};
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 10px;
    opacity: 0.85;
  }

  .toast-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    align-items: center;
    margin-top: 8px;
  }

  .toast-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    cursor: pointer;
    border-radius: ${(props) => props.theme.border.radius.sm};
    transition: all 0.15s ease;

    &.toast-btn-secondary {
      border: 1px solid ${(props) => props.theme.border.border1};
      background: ${(props) => props.theme.background.surface1};
      color: ${(props) => props.theme.colors.text.subtext1};

      &:hover {
        background: ${(props) => props.theme.background.surface2};
        color: ${(props) => props.theme.text};
      }
    }

    &.toast-btn-primary {
      border: 1px solid transparent;
      background: ${(props) => props.theme.primary.solid};
      color: #ffffff;

      &:hover {
        background: ${(props) => props.theme.primary.hover};
      }
    }
  }
`;

export default StyledWrapper;
