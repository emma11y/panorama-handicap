const absolutePath = 'https://emma11y.github.io/panorama-handicap';
const isProd = window.location.hostname.includes('emma11y.github.io');
const titlePage =
  'Immersion dans les Situations de Handicap : Participez à un Panorama Interactif';

window.onload = () => {
  setComponents();
};

function setComponents() {
  customElements.define('app-router', AppRouter);
  customElements.define('router-link', RouterLink);
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
    const routerLinks = this.shadowRoot.querySelectorAll('router-link');

    routerLinks.forEach((routerLink) => {
      let link = routerLink.shadowRoot.querySelector('a');

      if (
        window.location.pathname === routerLink.attributes.href.value ||
        (window.location.pathname === '/' &&
          routerLink.attributes.title.value === 'Accueil')
      ) {
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

    const familles = cartes.familles.sort((a, b) => {
      return a.titre.localeCompare(b.titre);
    });

    familles.forEach((famille) => {
      const details = document.createElement('details');
      details.id = famille.id;

      const summary = document.createElement('summary');
      summary.textContent = famille.titre;

      details.appendChild(summary);

      const fCartes = famille.cartes.sort((a, b) => {
        return a.titre.localeCompare(b.titre);
      });

      fCartes.forEach((carte) => {
        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.alt = carte.description;
        img.src = `${window.location.protocol}//${window.location.host}/assets/img/cartes/${carte.id}.png`;
        img.setAttribute('lazy', 'loading');
        figure.appendChild(img);

        const figCaption = document.createElement('figcaption');

        const titre = document.createElement('p');
        titre.className = 'titre';
        titre.textContent = carte.titre;
        figCaption.appendChild(titre);

        const sousTitre = document.createElement('p');
        sousTitre.className = 'sous-titre';
        sousTitre.innerText = carte.sousTitre;
        figCaption.appendChild(sousTitre);

        figure.appendChild(figCaption);

        details.appendChild(figure);
      });

      this.shadowRoot.appendChild(details);
    });

    const style = document.createElement('style');

    style.textContent = `

    details {
      margin-bottom: 1em;
    }

    summary {
      font-size: 130%;
    }

    figure {
      border-bottom: 0.1em solid;
      margin: 2em auto;
      text-align: center;
    }

    figure:last-child {
      border-bottom: 0;
    }
    
    figcaption {
      text-align: center;
    }

    img {
      width: 75%;
    }

    @media screen and (max-width: 768px) {
      img {
        width:100%;
      }
    }

    .titre {
      font-weight: 600;
      font-size: 102%;
      margin-bottom: 0;
    }

    .sous-titre {
      margin-top : 0;
    }
    
    `;

    this.shadowRoot.appendChild(style);
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
      img.src = `${absolutePath}/${this.attributes.src.value}/panorama-handicap/`;
    }

    if (this.attributes.style) {
      img.style = this.attributes.style.value;
    }

    if (this.attributes.class) {
      img.classList.add(this.attributes.class.value);

      const style = document.createElement('style');
      style.textContent = `
        .img-dark,
        .img-light,
        .img-responsive {
          width:20rem;
        }

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

        @media screen and (max-width: 600px) {
          .img-dark,
          .img-light,
          .img-responsive {
            width:100%;
          }
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

    let title = '';
    let filename = '';
    switch (path) {
      case '/':
      case '/panorama-handicap/':
        filename = '/pages/accueil.html';
        title = 'Accueil';
        break;
      case '/panorama-handicap/atelier':
        filename = '/pages/atelier.html';
        title = 'Atelier';
        break;
      case '/panorama-handicap/diaporama':
        filename = '/pages/diaporama.html';
        title = 'Diaporama';
        break;
      case '/panorama-handicap/ressources':
        filename = '/pages/ressources.html';
        title = 'Ressources';
        break;
      case '/panorama-handicap/a-propos':
        filename = '/pages/a-propos.html';
        title = 'A propos de nous';
        break;
      case '/panorama-handicap/erreur':
      default:
        filename = '/pages/erreur.html';
        title = 'Erreur 404';
    }

    this.innerHTML = await this.getHtmlContent(filename);
    document.title = `${title} - ${titlePage}`;
    document.querySelector('#title-page').textContent = document.title;
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

class RouterLink extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const link = document.createElement('a');
    const href = this.attributes.href.value;

    link.href = href;
    link.text = this.attributes.title.value;
    link.onclick = (event) => {
      event.preventDefault();
      document.querySelector('app-router').navigate(href);
    };

    const style = document.createElement('style');

    style.textContent = `
    a {
      color: var(--color-primary);
      text-decoration: none;
      cursor: pointer;
    }

    a:hover,
    a.active {
      text-decoration-thickness: 0.2em;
      text-decoration-line: underline;
      text-decoration-style: unset;
      text-underline-offset: 0.5em;
    }

    a.active {
      text-decoration-color: var(--red);
    }

    a:hover,
    a.active:hover {
      text-decoration-color: var(--color-primary);
    }
    
    `;

    this.shadowRoot.appendChild(link);
    this.shadowRoot.appendChild(style);
  }
}
