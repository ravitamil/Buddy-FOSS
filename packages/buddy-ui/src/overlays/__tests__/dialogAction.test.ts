import {actionVariant} from '../DialogAction';

describe('DialogAction', () => {
  it('maps tones to button variants correctly', () => {
    expect(actionVariant.default).toBe('primary');
    expect(actionVariant.primary).toBe('primary');
    expect(actionVariant.secondary).toBe('secondary');
    expect(actionVariant.outline).toBe('outline');
    expect(actionVariant.cancel).toBe('outline');
    expect(actionVariant.success).toBe('success');
    expect(actionVariant.destructive).toBe('danger');
  });
});
