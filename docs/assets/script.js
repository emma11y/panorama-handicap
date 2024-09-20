const absolutePath = 'https://emma11y.github.io/panorama-handicap';
const isProd = window.location.hostname.includes('emma11y.github.io');

window.onload = () => {};

document.addEventListener('DOMContentLoaded', () => {
  setComponents();
});

function setComponents() {
  customElements.define('app-router', AppRouter);
  customElements.define('custom-header', CustomHeader);
  customElements.define('custom-footer', CustomFooter);
  customElements.define('custom-cartes', CustomCartes);
  customElements.define('custom-picture', CustomPicture);
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
      let routerLink = link.getAttribute('routerLink');

      if (window.location.pathname === routerLink) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }

      link.addEventListener('click', () => {
        this.setAriaCurrentPage();
      });
    });
  }
}

class CustomFooter extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    await loadComponent(
      this.shadowRoot,
      '/components/footer/footer.html',
      '/components/footer/footer.css'
    );
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
    let jsonFileName = '/assets/cartes.json';

    if (isProd) {
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

        const description = document.createElement('p');
        description.textContent = carte.description;

        const sousTitre = document.createElement('p');
        sousTitre.innerText = carte.sousTitre;

        div.appendChild(titre);
        div.appendChild(description);
        div.appendChild(sousTitre);

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
`;

    this.shadowRoot.appendChild(style);*/
  }
}

class CustomPicture extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    let img = document.createElement('img');
    img.alt = this.attributes.alt.value;
    img.src = `${window.location.protocol}//${window.location.host}/${this.attributes.src.value}`;
    img.setAttribute('lazy', 'loading');

    if (isProd) {
      img.src = `${absolutePath}/${this.attributes.src.value}`;
    }

    if (this.attributes.style) {
      img.style = this.attributes.style.value;
    }

    if (this.attributes.class) {
      img.classList.add(this.attributes.class.value);

      const style = document.createElement('style');
      style.textContent = `
        .img-responsive { width:20rem; }

        .img-round {
          border-radius: 50%;
          height: auto;
          width: 20rem;
          height: 20rem;
          object-fit: cover;
        }
          
       .icon {
          vertical-align: middle;
          width:2em;
        }

        @media screen and (max-width: 599px) {
          .img-responsive { width:100%; }
        }
        
        `;
      this.shadowRoot.appendChild(style);
    }

    this.shadowRoot.appendChild(img);
  }
}

async function loadComponent(shadowRoot, htmlFileName, cssFileName) {
  try {
    if (isProd) {
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

class AppRouter extends HTMLElement {
  constructor() {
    super();
    window.addEventListener('popstate', () => this.handleRoute());
  }

  async connectedCallback() {
    await this.handleRoute();
  }

  async handleRoute() {
    const path = window.location.pathname;

    let filename = '';
    switch (path) {
      case '/':
      case '/panorama-handicap/':
        filename = '/pages/accueil.html';
        break;
      case '/panorama-handicap/atelier':
        filename = '/pages/atelier.html';
        break;
      case '/panorama-handicap/diaporama':
        filename = '/pages/diaporama.html';
        break;
      case '/panorama-handicap/ressources':
        filename = '/pages/ressources.html';
        break;
      case '/panorama-handicap/a-propos':
        filename = '/pages/a-propos.html';
        break;
      default:
        filename = '/pages/erreur.html';
    }

    this.innerHTML = await this.getHtmlContent(filename);
  }

  async navigate(path) {
    window.history.pushState({}, '', path);
    await this.handleRoute();
  }

  async getHtmlContent(htmlFileName) {
    if (isProd) {
      htmlFileName = absolutePath + htmlFileName;
    }

    const responseHTML = await fetch(htmlFileName);
    if (!responseHTML.ok) {
      throw new Error(
        'Erreur lors du chargement du fichier HTML : ' + responseHTML.statusText
      );
    }

    return await responseHTML.text();
  }
}
