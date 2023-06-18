export const constants = {
    tooltips: {
      upgradePlan: 'Upgrade your plan to access this content.',
    },
    // Added existing journals from cases
    journals: [
      'CLR',
      'KLR',
      'LHC',
      'MLD',
      'NLR',
      'PCRLJ',
      'PCTLR',
      'PLC',
      'PLD',
      'PLJ',
      'PSC',
      'PSC CIV',
      'PSC CRI',
      'PTCL',
      'PTD',
      'SCMR',
      'SCR',
      'TAX',
      'YLR'
    ],
    pageSize: localStorage.getItem('role') === 'free' ? '20' : '10',
  };