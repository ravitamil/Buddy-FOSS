import type {EnhancedGroup, EnhancedGroupMember} from '../types';
import {
  getEditGroupValidationError,
  toEditableMember,
  toEnhancedGroupMember,
} from './editGroupScreenModels';

const member = {
  id: 'member-1',
  name: 'Alex',
  role: 'member',
  supabaseUserId: 'user-1',
} as EnhancedGroupMember;

describe('editGroupScreenModels', () => {
  it('keeps the current user as an owner in the editable model', () => {
    expect(toEditableMember(member, () => true).role).toBe('owner');
  });

  it('maps an editable member to an active persisted member', () => {
    const result = toEnhancedGroupMember({
      id: 'member-1',
      name: 'Alex',
      role: 'member',
      inviteStatus: 'accepted',
    });

    expect(result).toMatchObject({id: 'member-1', name: 'Alex', isActive: true});
  });

  it('returns validation errors for blank and duplicate names', () => {
    const group = {id: 'group-1'} as EnhancedGroup;
    expect(getEditGroupValidationError('', [], group, [])?.title).toBe('Validation Error');
    expect(
      getEditGroupValidationError('Trip', [{id: 'member-1', name: 'Alex', role: 'member'}], group, [
        {id: 'group-2', name: 'Trip'},
      ] as EnhancedGroup[])?.title,
    ).toBe('Duplicate Name');
  });
});
