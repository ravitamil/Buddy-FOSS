import {GroupMemberService} from './GroupMemberService';

const mockRpc = jest.fn();
const mockInsert = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]): unknown => mockRpc(...args) as unknown,
    from: jest.fn(() => ({
      insert: (...args: unknown[]): unknown => mockInsert(...args) as unknown,
    })),
  },
}));

describe('GroupMemberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvite', () => {
    it('creates an invite without email and with memberId for contact sharing', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        returns: jest.fn().mockResolvedValue({
          data: {
            id: 'invite-1',
            group_id: 'group-1',
            invited_by: 'user-1',
            email: null,
            member_id: 'member-1',
            token: 'test-token',
            expires_at: '2026-09-13T00:00:00Z',
            status: 'pending',
            created_at: '2026-09-06T00:00:00Z',
          },
          error: null,
        }),
      };
      mockInsert.mockReturnValue(mockChain);

      const invite = await GroupMemberService.createInvite('group-1', null, 'user-1', 'member-1');

      expect(mockInsert).toHaveBeenCalledWith({
        group_id: 'group-1',
        invited_by: 'user-1',
        email: null,
        member_id: 'member-1',
      });
      expect(invite).toEqual({
        id: 'invite-1',
        groupId: 'group-1',
        invitedBy: 'user-1',
        email: undefined,
        memberId: 'member-1',
        token: 'test-token',
        expiresAt: new Date('2026-09-13T00:00:00Z'),
        status: 'pending',
        createdAt: new Date('2026-09-06T00:00:00Z'),
      });
    });

    it('normalizes email when provided', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        returns: jest.fn().mockResolvedValue({
          data: {
            id: 'invite-2',
            group_id: 'group-1',
            invited_by: 'user-1',
            email: 'test@example.com',
            token: 'test-token-2',
            expires_at: '2026-09-13T00:00:00Z',
            status: 'pending',
            created_at: '2026-09-06T00:00:00Z',
          },
          error: null,
        }),
      };
      mockInsert.mockReturnValue(mockChain);

      const invite = await GroupMemberService.createInvite(
        'group-1',
        '  Test@Example.COM  ',
        'user-1',
      );

      expect(mockInsert).toHaveBeenCalledWith({
        group_id: 'group-1',
        invited_by: 'user-1',
        email: 'test@example.com',
        member_id: null,
      });
      expect(invite?.email).toBe('test@example.com');
    });
  });

  describe('acceptInvite', () => {
    it('delegates membership and invite changes to the atomic RPC', async () => {
      mockRpc.mockResolvedValue({data: 'group-1', error: null});

      await expect(GroupMemberService.acceptInvite('invite-token')).resolves.toEqual({
        groupId: 'group-1',
      });
      expect(mockRpc).toHaveBeenCalledWith('accept_group_invite', {
        p_token: 'invite-token',
      });
    });

    it('returns null when the server rejects the invite', async () => {
      mockRpc.mockResolvedValue({data: null, error: new Error('expired')});

      await expect(GroupMemberService.acceptInvite('expired-token')).resolves.toBeNull();
    });
  });
});
