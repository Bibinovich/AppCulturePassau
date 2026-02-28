import React from "react";
import { Text, View } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ErrorBoundary } from "./ErrorBoundary";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mock the react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => <>{children}</>),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
  };
});

// A component that always throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error!");
  }
  return <Text>Normal render</Text>;
};

// Mock ErrorFallback to test custom fallback
const CustomFallback = ({ error, resetError }: any) => (
  <View>
    <Text>Custom Error: {error.message}</Text>
    <Text onPress={resetError}>Try Again Custom</Text>
  </View>
);

describe("ErrorBoundary", () => {
  // Prevent React from logging expected errors in tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("renders children normally when there is no error", () => {
    render(
      <ErrorBoundary>
        <Text>Normal Children</Text>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal Children")).toBeTruthy();
  });

  it("renders default fallback component when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong|Test error!/i)).toBeTruthy();
  });

  it("renders custom fallback component when provided and an error occurs", () => {
    render(
      <ErrorBoundary FallbackComponent={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom Error: Test error!")).toBeTruthy();
  });

  it("calls onError callback when an error occurs", () => {
    const onErrorMock = jest.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(String) // component stack
    );
  });

  it("resets error state when resetError is called", () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <ErrorBoundary FallbackComponent={({ error, resetError }) => (
          <View>
            <Text>Error occurred</Text>
            <Text onPress={() => {
              setShouldThrow(false);
              resetError();
            }}>
              Reset
            </Text>
          </View>
        )}>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };

    render(<TestComponent />);

    // Verify error state
    expect(screen.getByText("Error occurred")).toBeTruthy();

    // Trigger reset
    fireEvent.press(screen.getByText("Reset"));

    // Verify normal render restored
    expect(screen.getByText("Normal render")).toBeTruthy();
  });
});
