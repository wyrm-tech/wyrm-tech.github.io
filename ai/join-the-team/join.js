(() => {
  const roleIds = ['sales', 'consultancy', 'tools'];
  const labels = { sales: 'Sales', consultancy: 'Consultancy', tools: 'Tool Builder' };
  const inputs = roleIds.map((id) => document.getElementById(`role-${id}`));
  const storageKey = 'wyrmtech-ai-team-roles';

  function saveRoles() {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(
        roleIds.filter((id, index) => inputs[index].checked)
      ));
    } catch {
      // The role chooser still works when browser storage is unavailable.
    }
  }

  function restoreRoles() {
    try {
      const selected = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      inputs.forEach((input, index) => {
        input.checked = selected.includes(roleIds[index]);
      });
    } catch {
      // Leave the unchecked defaults in place if saved data cannot be read.
    }
  }

  function updateRoles() {
    const selected = roleIds.filter((id, index) => inputs[index].checked);
    const directShare = (selected.includes('sales') ? 25 : 0) + (selected.includes('consultancy') ? 25 : 0);
    const directRoles = selected.filter(id => id !== 'tools').map(id => labels[id]).join(' and ');
    const includesTools = selected.includes('tools');

    roleIds.forEach((id, index) => {
      const active = inputs[index].checked;
      document.getElementById(`${id}-card`).classList.toggle('is-selected', active);
      document.getElementById(`${id}-segment`).classList.toggle('is-selected', active);
      document.getElementById(`${id}-legend`).classList.toggle('is-selected', active);
      document.getElementById(`${id}-details`).hidden = !active;
      inputs[index].setAttribute('aria-expanded', String(active));
      document.getElementById(`${id}-state`).textContent = id === 'tools'
        ? (active ? 'Selected · your portion is still to be defined' : 'Contribution-based allocation')
        : (active ? 'Selected' : 'Not selected');
    });

    const summary = selected.length === 0
      ? 'Select a role to explore your allocation.'
      : includesTools
        ? (directShare > 0
          ? `${directShare}% for ${directRoles}, plus your contribution-based share of the 25% Tool Builder pool.`
          : 'Your contribution-based share of the 25% Tool Builder pool. Your individual percentage is still to be defined.')
        : `${directShare}% of contract earnings allocated to your selected ${selected.length === 1 ? 'role' : 'roles'}.`;

    document.getElementById('share-value').textContent = includesTools && directShare === 0 ? 'TBD' : `${directShare}%`;
    document.getElementById('share-extra').textContent = includesTools && directShare > 0 ? '+ library share' : '';
    document.getElementById('share-caption').textContent = selected.length === 0
      ? 'Select your roles'
      : includesTools && directShare === 0 ? 'Your part of the 25% pool' : 'Your role allocation';
    document.getElementById('share-summary').textContent = summary;
    document.getElementById('chart-description').textContent = `Sales 25%, Consultancy 25%, Tool Builder pool 25%, Operations 25%. ${summary}`;
  }

  inputs.forEach(input => input.addEventListener('change', () => {
    saveRoles();
    updateRoles();
  }));
  window.addEventListener('pageshow', updateRoles);
  restoreRoles();
  updateRoles();
})();
