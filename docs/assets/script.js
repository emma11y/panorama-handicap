window.onload = () => {
  setComponents();
};

function setComponents() {
  customElements.define('custom-header', CustomHeader);
  customElements.define('custom-cartes', CustomCartes);
}

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

class CustomCartes extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    await this.loadCartes();
  }

  async loadCartes() {
    const jsonFileName = '/assets/cartes.json';

    const absolutePath = 'https://emma11y.github.io/panorama-handicap';

    if (window.location.hostname.includes('emma11y.github.io')) {
      jsonFileName = absolutePath + jsonFileName;
    }

    const response = await fetch(jsonFileName);
    if (!response.ok) {
      throw new Error(
        'Erreur lors du chargement du fichier JSON : ' + response.statusText
      );
    }

    const cartes = await response.json();
    cartes.familles.forEach((famille) => {
      const details = document.createElement('details');
      details.id = famille.id;

      const summary = document.createElement('summary');
      summary.textContent = famille.titre;

      details.appendChild(summary);

      famille.cartes.forEach((carte) => {
        const div = document.createElement('div');
        div.id = carte.id;

        const titre = document.createElement('p');
        titre.textContent = carte.titre;

        const sousTitre = document.createElement('p');
        sousTitre.textContent = carte.sousTitre;

        const description = document.createElement('p');
        description.textContent = carte.description;

        div.appendChild(titre);
        div.appendChild(sousTitre);
        div.appendChild(description);

        details.appendChild(div);
      });

      this.shadowRoot.appendChild(details);
    });

    /* const style = document.createElement('style');
    style.textContent = `details > summary {
  padding: 2px 6px;
  width: 15em;
  background-color: #ddd;
  border: none;
  box-shadow: 3px 3px 4px black;
  cursor: pointer;
}

details > p {
  border-radius: 0 0 10px 10px;
  background-color: #ddd;
  padding: 2px 6px;
  margin: 0;
  box-shadow: 3px 3px 4px black;
}

details[open] > summary {
  background-color: #ccf;
}
`;*/

    this.shadowRoot.appendChild(style);
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
