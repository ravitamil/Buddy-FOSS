import {compareSemver, resolveUpgradeState} from '../service';

describe('SystemStatus Service', () => {
  describe('compareSemver', () => {
    it('returns 0 when versions are equal', () => {
      expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
      expect(compareSemver('2.1.3', '2.1.3')).toBe(0);
    });

    it('returns 1 when v1 is greater than v2', () => {
      expect(compareSemver('1.1.0', '1.0.0')).toBe(1);
      expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
      expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
    });

    it('returns -1 when v1 is less than v2', () => {
      expect(compareSemver('1.0.0', '1.1.0')).toBe(-1);
      expect(compareSemver('1.9.9', '2.0.0')).toBe(-1);
      expect(compareSemver('1.0.0', '1.0.1')).toBe(-1);
    });
  });

  describe('resolveUpgradeState', () => {
    it('detects when an upgrade is required', async () => {
      // Mocking nativeApplicationVersion as 1.0.0
      const state = await resolveUpgradeState('1.2.0', '1.3.0');
      expect(state.isUpgradeRequired).toBe(true);
      expect(state.minRequiredVersion).toBe('1.2.0');
    });

    it('detects when an installed version meets the minimum version', async () => {
      const state = await resolveUpgradeState('0.9.0', '1.0.0');
      expect(state.isUpgradeRequired).toBe(false);
    });
  });
});
