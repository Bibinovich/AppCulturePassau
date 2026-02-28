import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChipRow } from '../FilterChip';

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
  },
}));

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockItems = [
  { id: '1', label: 'Item 1' },
  { id: '2', label: 'Item 2' },
  { id: '3', label: 'Item 3', icon: 'star', count: 5 },
];

describe('FilterChipRow', () => {
  it('renders correctly with given items', () => {
    const { getByText } = render(
      <FilterChipRow
        items={mockItems}
        selectedId="1"
        onSelect={() => {}}
      />
    );
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  it('calls onSelect with correct id when an item is pressed', () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <FilterChipRow
        items={mockItems}
        selectedId="1"
        onSelect={mockOnSelect}
      />
    );
    fireEvent.press(getByText('Item 2'));
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });

  it('handles empty items array without crashing', () => {
    const { toJSON } = render(
      <FilterChipRow
        items={[]}
        selectedId="1"
        onSelect={() => {}}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('passes down size prop correctly', () => {
    const { getByText } = render(
      <FilterChipRow
        items={[{ id: '1', label: 'Small Item' }]}
        selectedId="1"
        onSelect={() => {}}
        size="small"
      />
    );

    expect(getByText('Small Item')).toBeTruthy();
  });

  it('displays count badge when provided', () => {
    const { getByText } = render(
      <FilterChipRow
        items={[{ id: '1', label: 'Item 1', count: 10 }]}
        selectedId="1"
        onSelect={() => {}}
      />
    );

    expect(getByText('10')).toBeTruthy();
  });
});
