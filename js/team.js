function cmsUrl(path) {
  const base = window.ElementoI18n ? window.ElementoI18n.getCmsBasePath() : '';
  return `${base}${path}`;
}

function resolveMember(member) {
  const locale = window.ElementoI18n ? window.ElementoI18n.getPageLocale() : 'en';
  return window.ElementoI18n ? window.ElementoI18n.resolveCmsEntry(member, locale) : member;
}

fetch(cmsUrl('CMS/team.json'))
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(team => {
    const grid = document.getElementById('team-grid');
    if (!grid) return;

    const html = team.map(raw => {
      const member = resolveMember(raw);
      const divisionClass = member.division ? `division-${member.division}` : 'division-default';
      const photo = member.photo || 'assets/img/team/placeholder.png';
      const photoSrc = window.ElementoI18n?.assetUrl
        ? window.ElementoI18n.assetUrl(photo)
        : cmsUrl(photo);
      const placeholder = window.ElementoI18n?.assetUrl
        ? window.ElementoI18n.assetUrl('assets/img/team/placeholder.png')
        : cmsUrl('assets/img/team/placeholder.png');

      return `
        <div class="team-member ${divisionClass}">
          <div class="team-photo-container">
            <div class="team-member-glow ${divisionClass}-glow"></div>
            <img src="${photoSrc}" alt="${member.name}" class="team-photo" onerror="this.src='${placeholder}'" />
          </div>
          <h4>${member.name}</h4>
          <p class="team-role">${member.role}</p>
          ${member.highlight ? `<p class="team-highlight"><em>${member.highlight}</em></p>` : ''}
          <p class="team-bio">${member.bio}</p>
          <div class="team-links">
            ${(member.links || []).map(link => `
              <a href="${link.url}" target="_blank" class="btn btn-link">${link.type}</a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = html;

    const teamMembers = grid.querySelectorAll('.team-member.fade-in');
    teamMembers.forEach((member, index) => {
      setTimeout(() => member.classList.add('visible'), index * 150);
    });
  })
  .catch(error => {
    console.error('Error loading team data:', error);
  });
