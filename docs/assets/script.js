window.onload = () => {
  initAccessibility();
  setComponents();
};

function setComponents() {
  customElements.define('custom-header', CustomHeader);
}

function initAccessibility() {}

class CustomHeader extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    await loadComponent(
      this.shadowRoot,
      '/components/header/header.html',
      '/components/header/header.css'
    );

    this.initTheme();
    this.setAriaCurrentPage();
  }

  initTheme() {
    const themeStored = localStorage.getItem('theme');

    if (themeStored) {
      this.setTheme(themeStored);
    } else {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.setTheme('dark');
      } else {
        this.setTheme('light');
      }
    }

    const btnLight = this.shadowRoot.getElementById('btnLight');
    if (btnLight) {
      btnLight.onclick = () => this.setTheme('light');
    }

    const btnDark = this.shadowRoot.getElementById('btnDark');
    if (btnDark) {
      btnDark.onclick = () => this.setTheme('dark');
    }
  }

  setTheme(theme) {
    var buttons = this.shadowRoot.querySelectorAll(
      '.theme-switcher-buttons button'
    );
    buttons.forEach((button) => {
      const dataTheme = button.getAttribute('data-theme');
      if (dataTheme === theme) {
        button.setAttribute('aria-pressed', true);
      } else {
        button.setAttribute('aria-pressed', false);
      }
    });

    document.documentElement.setAttribute('data-selected-theme', theme);
    localStorage.setItem('theme', theme);
  }

  setAriaCurrentPage() {
    const links = this.shadowRoot.querySelectorAll('a');

    links.forEach((link) => {
      console.log(window.location.href);
      if (
        window.location.href.includes(link.href) ||
        (window.location.href.includes('index') &&
          link.href.includes('index')) ||
        (!window.location.href.includes('html') && link.href.includes('index'))
      ) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }
}

async function loadComponent(shadowRoot, htmlFileName, cssFileName) {
  try {
    const absolutePath = 'https://emma11y.github.io/panorama-handicap';

    if (window.location.hostname.includes('emma11y.github.io')) {
      htmlFileName = absolutePath + htmlFileName;
      cssFileName = absolutePath + cssFileName;
    }

    const responseHTML = await fetch(htmlFileName);
    if (!responseHTML.ok) {
      throw new Error(
        'Erreur lors du chargement du fichier HTML : ' + responseHTML.statusText
      );
    }

    const htmlContent = await responseHTML.text();
    shadowRoot.innerHTML = htmlContent;

    const responseCSS = await fetch(cssFileName);
    if (!responseCSS.ok) {
      throw new Error(
        'Erreur lors du chargement du fichier CSS : ' + responseCSS.statusText
      );
    }

    const style = document.createElement('style');
    style.textContent = await responseCSS.text();
    shadowRoot.appendChild(style);
  } catch (error) {
    console.error('Erreur:', error);
  }
}
