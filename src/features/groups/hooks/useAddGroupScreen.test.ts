import {renderHook, act} from '@testing-library/react-native';
import type {AlertConfig} from '@/hooks/useAlert';
import {useAddGroupScreen} from './useAddGroupScreen';

const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockRouterBack,
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
  useLocalSearchParams: () => ({}),
}));

const mockShowAlert = jest.fn<void, [AlertConfig]>();
jest.mock('@/hooks/useAlert', () => ({
  useAlert: () => ({
    showAlert: mockShowAlert,
    hideAlert: jest.fn(),
  }),
}));

const mockGroupsAdd = jest.fn();
const existingGroup = {
  id: 'group-1',
  name: 'Home',
  members: [],
  transactions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1',
  currency: 'USD',
  isActive: true,
};

const mockGroups = {
  items: [existingGroup],
  add: mockGroupsAdd,
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addMany: jest.fn(),
  deleteMany: jest.fn(),
  isLoading: false,
  error: null,
};

jest.mock('@/context', () => ({
  useGroups: () => ({
    groups: mockGroups,
    isGroupNameUnique: (name: string) =>
      !mockGroups.items.some((g) => g.name.toLowerCase().trim() === name.toLowerCase().trim()),
  }),
  useUser: () => ({
    profile: {
      id: 'user-1',
      displayName: 'Alice',
      firstName: 'Alice',
      email: 'alice@example.com',
    },
  }),
}));

jest.mock('@/context/TamaguiThemeProvider', () => ({
  useTamaguiTheme: () => ({
    isDarkMode: false,
    currentThemeName: 'light',
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('@/context/SettingsContext', () => ({
  useSettings: () => ({
    currency: 'USD',
    groupCurrency: 'USD',
  }),
}));

jest.mock('@/hooks/useProgressiveBlurHeader', () => ({
  useProgressiveBlurHeader: () => ({
    headerProps: {},
    onScroll: jest.fn(),
    isScrollingDown: {value: false},
    scrollY: {value: 0},
  }),
}));

describe('useAddGroupScreen edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prevents creating a group when a group with the same name already exists', async () => {
    const {result} = renderHook(() => useAddGroupScreen());

    act(() => {
      result.current.setGroupName('Home');
    });

    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    // groups.add should NOT be called because it was caught by pre-check
    expect(mockGroupsAdd).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Group Already Exists',
      }),
    );

    // Verify "View Group" action is offered
    const alertCall = mockShowAlert.mock.calls[0]?.[0];
    expect(alertCall?.message).toContain('Home');
    const viewGroupAction = alertCall?.actions?.find((a) => a.text === 'View Group');
    expect(viewGroupAction).toBeDefined();

    // Invoking View Group should navigate to existing group
    viewGroupAction?.onPress?.();
    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/groups/[id]',
      params: {id: 'group-1'},
    });
  });

  it('handles case-insensitive duplicate group names with surrounding whitespace', async () => {
    const {result} = renderHook(() => useAddGroupScreen());

    act(() => {
      result.current.setGroupName('  home  ');
    });

    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    expect(mockGroupsAdd).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Group Already Exists',
      }),
    );
  });

  it('prevents double submission after group has been successfully created', async () => {
    const createdGroup = {
      id: 'group-new',
      name: 'Trip',
      members: [],
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      currency: 'USD',
      isActive: true,
    };
    mockGroupsAdd.mockResolvedValueOnce(createdGroup);

    const {result} = renderHook(() => useAddGroupScreen());

    act(() => {
      result.current.setGroupName('Trip');
    });

    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    expect(mockGroupsAdd).toHaveBeenCalledTimes(1);
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Success',
      }),
    );
    const successAlertCall = mockShowAlert.mock.calls[0]?.[0];
    expect(typeof successAlertCall?.onDismiss).toBe('function');

    // Try creating again immediately (double click / tap)
    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    // Should NOT call groups.add again
    expect(mockGroupsAdd).toHaveBeenCalledTimes(1);
    expect(result.current.isCreateDisabled).toBe(true);
  });

  it('navigates back when success alert onDismiss is called', async () => {
    mockGroupsAdd.mockResolvedValueOnce({
      id: 'group-new',
      name: 'Work',
      members: [],
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      currency: 'USD',
      isActive: true,
    });

    const {result} = renderHook(() => useAddGroupScreen());

    act(() => {
      result.current.setGroupName('Work');
    });

    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    const alertCall = mockShowAlert.mock.calls[0]?.[0];
    expect(alertCall?.onDismiss).toBeDefined();

    // Dismissing the alert (e.g. tapping outside the sheet) navigates back
    alertCall?.onDismiss?.();
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('gracefully catches duplicate error thrown by API and offers View Group', async () => {
    mockGroupsAdd.mockRejectedValueOnce(new Error('A group with this name already exists.'));

    const {result} = renderHook(() => useAddGroupScreen());

    // Assume pre-check passed for a new name, but backend rejected with duplicate
    act(() => {
      result.current.setGroupName('UniqueName');
    });

    await act(async () => {
      result.current.handleCreateGroup();
      await Promise.resolve();
    });

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Group Already Exists',
      }),
    );
    const alertCall = mockShowAlert.mock.calls[0]?.[0];
    expect(alertCall?.message).toContain('UniqueName');
  });
});
