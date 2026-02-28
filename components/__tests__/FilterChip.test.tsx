import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterChip, FilterChipRow } from '../FilterChip';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../constants/colors', () => ({
  primary: '#000',
  surface: '#fff',
  borderLight: '#eee',
  text: '#333',
  backgroundSecondary: '#f0f0f0',
  textSecondary: '#666'
}));

describe('FilterChip', () => {
  const mockItem = {
    id: '1',
    label: 'Test Item',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <FilterChip item={mockItem} isActive={false} onPress={mockOnPress} />
    );
    expect(getByText('Test Item')).toBeTruthy();
  });

  it('calls onPress and triggers haptics when pressed', () => {
    const { getByText } = render(
      <FilterChip item={mockItem} isActive={false} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Item'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });

  it('renders an icon if item has one', () => {
    const itemWithIcon = { ...mockItem, icon: 'star' };
    const { root } = render(
      <FilterChip item={itemWithIcon} isActive={false} onPress={mockOnPress} />
    );

    const ionicons = root.findAllByType('Ionicons');
    expect(ionicons.length).toBe(1);
    expect(ionicons[0].props.name).toBe('star');
  });

  it('renders a badge if count is greater than 0', () => {
    const itemWithCount = { ...mockItem, count: 5 };
    const { getByText } = render(
      <FilterChip item={itemWithCount} isActive={false} onPress={mockOnPress} />
    );

    expect(getByText('5')).toBeTruthy();
  });

  it('does not render a badge if count is 0', () => {
    const itemWithZeroCount = { ...mockItem, count: 0 };
    const { queryByText } = render(
      <FilterChip item={itemWithZeroCount} isActive={false} onPress={mockOnPress} />
    );

    expect(queryByText('0')).toBeNull();
  });
});

describe('FilterChipRow', () => {
  const mockItems = [
    { id: '1', label: 'All' },
    { id: '2', label: 'Active', count: 3 },
    { id: '3', label: 'Inactive' },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all items', () => {
    const { getByText } = render(
      <FilterChipRow items={mockItems} selectedId="1" onSelect={mockOnSelect} />
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Inactive')).toBeTruthy();
  });

  it('calls onSelect with the correct ID when an item is pressed', () => {
    const { getByText } = render(
      <FilterChipRow items={mockItems} selectedId="1" onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Active'));
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });
});
