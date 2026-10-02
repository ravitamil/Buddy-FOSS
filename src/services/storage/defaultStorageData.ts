import {Category, InvestmentCategory} from '../../types';

export function getDefaultCategories(): Category[] {
  return [
    {id: '1', name: 'Food', icon: 'ðŸ½ï¸', color: '#FF6B6B', type: 'expense'},
    {id: '2', name: 'Transport', icon: 'ðŸš—', color: '#4ECDC4', type: 'expense'},
    {id: '3', name: 'Shopping', icon: 'ðŸ›ï¸', color: '#45B7D1', type: 'expense'},
    {id: '4', name: 'Entertainment', icon: 'ðŸŽ‰', color: '#96CEB4', type: 'expense'},
    {id: '5', name: 'Bills', icon: 'ðŸ’¾', color: '#FECA57', type: 'expense'},
    {id: '6', name: 'Healthcare', icon: 'âš•ï¸', color: '#FF9FF3', type: 'expense'},
    {id: '7', name: 'Salary', icon: 'ðŸ’µ', color: '#54A0FF', type: 'income'},
    {id: '8', name: 'Freelance', icon: 'ðŸ’¼', color: '#5F27CD', type: 'income'},
    {id: '9', name: 'Investment', icon: 'ðŸ“ˆ', color: '#00D2D3', type: 'income'},
  ];
}

export function getDefaultInvestmentCategories(): InvestmentCategory[] {
  return [
    {
      id: '1',
      name: 'Stocks & Equity',
      icon: 'ðŸ“ˆ',
      color: '#4CAF50',
      description: 'Stock investments and equity funds',
      riskLevel: 'high',
      expectedReturn: 12,
    },
    {
      id: '2',
      name: 'Mutual Funds',
      icon: 'ðŸ“Š',
      color: '#2196F3',
      description: 'Diversified mutual fund investments',
      riskLevel: 'medium',
      expectedReturn: 10,
    },
    {
      id: '3',
      name: 'Fixed Deposits',
      icon: 'ðŸ¦',
      color: '#FF9800',
      description: 'Bank fixed deposits and CDs',
      riskLevel: 'low',
      expectedReturn: 6,
    },
    {
      id: '4',
      name: 'Gold & Precious Metals',
      icon: 'ðŸ¥‡',
      color: '#FFD700',
      description: 'Gold, silver and other precious metals',
      riskLevel: 'medium',
      expectedReturn: 8,
    },
    {
      id: '5',
      name: 'Bonds & Debentures',
      icon: 'ðŸ“œ',
      color: '#9C27B0',
      description: 'Government and corporate bonds',
      riskLevel: 'low',
      expectedReturn: 7,
    },
    {
      id: '6',
      name: 'Cash & Savings',
      icon: 'ðŸ’°',
      color: '#00BCD4',
      description: 'Savings accounts and cash equivalents',
      riskLevel: 'low',
      expectedReturn: 4,
    },
  ];
}
