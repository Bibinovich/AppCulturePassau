import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorFallback } from '../ErrorFallback';
import { reloadAppAsync } from 'expo';

// Mock expo's reloadAppAsync
jest.mock('expo', () => ({
  reloadAppAsync: jest.fn(),
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 20, left: 0, right: 0 }),
}));

// Mock icons to avoid state update warnings during tests
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  mockError.stack = 'Test stack trace';
  const mockResetError = jest.fn();

  // We'll test __DEV__ behavior as well
  const originalDev = global.__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.__DEV__ = originalDev;
  });

  it('renders correctly with default props', () => {
    global.__DEV__ = false;
    const { getByText } = render(
      <ErrorFallback error={mockError} resetError={mockResetError} />
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Please reload the app to continue.')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('calls reloadAppAsync when Try Again button is pressed', async () => {
    global.__DEV__ = false;
    const { getByText } = render(
      <ErrorFallback error={mockError} resetError={mockResetError} />
    );

    fireEvent.press(getByText('Try Again'));

    await waitFor(() => {
      expect(reloadAppAsync).toHaveBeenCalled();
    });
  });

  it('calls resetError if reloadAppAsync throws an error', async () => {
    global.__DEV__ = false;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (reloadAppAsync as jest.Mock).mockRejectedValueOnce(new Error('Reload failed'));

    const { getByText } = render(
      <ErrorFallback error={mockError} resetError={mockResetError} />
    );

    fireEvent.press(getByText('Try Again'));

    await waitFor(() => {
      expect(mockResetError).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Failed to restart app:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('shows error details modal in DEV mode when alert icon is pressed', () => {
    global.__DEV__ = true;

    const { getByLabelText, getByText, queryByText } = render(
      <ErrorFallback error={mockError} resetError={mockResetError} />
    );

    // Initial state: modal is closed
    expect(queryByText('Error Details')).toBeNull();

    // Press the icon to open modal
    fireEvent.press(getByLabelText('View error details'));

    // Modal should be open
    expect(getByText('Error Details')).toBeTruthy();
    expect(getByText(/Test error message/)).toBeTruthy();
    expect(getByText(/Test stack trace/)).toBeTruthy();

    // Close the modal
    fireEvent.press(getByLabelText('Close error details'));

    // Modal should be hidden (though in RNTL, modal might still exist but with visible=false,
    // we just test that the button is interactive)
  });

  it('does not show alert icon in PROD mode', () => {
    global.__DEV__ = false;

    const { queryByLabelText } = render(
      <ErrorFallback error={mockError} resetError={mockResetError} />
    );

    expect(queryByLabelText('View error details')).toBeNull();
  });
});
