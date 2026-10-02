import {walletDatabaseService} from './WalletDatabaseService';

describe('WalletDatabaseService offline storage', () => {
  it('seeds default wallets when empty', async () => {
    const wallets = await walletDatabaseService.getWallets('local_user');
    expect(wallets.length).toBeGreaterThan(0);
    expect(wallets.some((w) => w.name === 'Cash')).toBe(true);
  });

  it('creates and retrieves a new wallet locally', async () => {
    const newWallet = await walletDatabaseService.createWallet('local_user', {
      name: 'Savings Vault',
      type: 'savings',
      balance: 500,
      currency: 'USD',
    });

    expect(newWallet.id).toBeDefined();
    expect(newWallet.name).toBe('Savings Vault');
    expect(newWallet.balance).toBe(500);

    const wallets = await walletDatabaseService.getWallets('local_user');
    expect(wallets.some((w) => w.id === newWallet.id)).toBe(true);
  });

  it('updates a wallet locally', async () => {
    const wallets = await walletDatabaseService.getWallets('local_user');
    const target = wallets[0];

    const updated = await walletDatabaseService.updateWallet('local_user', target.id, {
      balance: 999,
    });

    expect(updated.balance).toBe(999);
  });

  it('deletes a wallet locally', async () => {
    const newWallet = await walletDatabaseService.createWallet('local_user', {
      name: 'To Delete',
      type: 'other',
      balance: 10,
    });

    await walletDatabaseService.deleteWallet('local_user', newWallet.id);

    const wallets = await walletDatabaseService.getWallets('local_user');
    expect(wallets.some((w) => w.id === newWallet.id)).toBe(false);
  });
});
