const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topbar nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
}

const projectToggle = document.querySelector('.project-menu-toggle');
const projectMenu = document.querySelector('.project-menu');
if (projectToggle && projectMenu) {
  projectToggle.addEventListener('click', () => {
    const open = projectMenu.classList.toggle('open');
    projectToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!projectMenu.contains(event.target)) {
      projectMenu.classList.remove('open');
      projectToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
