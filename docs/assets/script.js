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
  customElements.define('custom-figure', CustomFigure);
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
      let link = routerLink.querySelector('a');

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
  }

  async connectedCallback() {
    await this.loadCartes();

    var tablist = document.querySelector('[role=tablist]');
    new TabsAutomatic(tablist);
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

    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    //tabs.setAttribute('aria-live', 'polite');
    //tabs.setAttribute('aria-relevant', 'additions text');

    const title = document.createElement('h3');
    title.id = 'tablist-familles';
    title.textContent = 'Familles';
    title.className = 'tabs';
    tabs.appendChild(title);

    const tablist = document.createElement('div');
    tablist.role = 'tablist';
    tablist.setAttribute('aria-labelledby', title.id);

    //https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/

    const tabPanels = [];

    familles.forEach((famille, index) => {
      const button = document.createElement('button');
      button.id = `tab-${famille.id}`;
      button.type = 'button';
      button.role = 'tab';
      button.setAttribute('aria-controls', `tabpanel-${famille.id}`);

      const span = document.createElement('span');
      span.className = 'focus';
      span.textContent = famille.titre;

      button.appendChild(span);

      tablist.appendChild(button);

      const tabPanel = document.createElement('div');
      tabPanel.id = `tabpanel-${famille.id}`;
      tabPanel.role = 'tabpanel';
      tabPanel.setAttribute('tabindex', 0);
      tabPanel.setAttribute('aria-labelledBy', `tab-${famille.id}`);

      const fCartes = famille.cartes.sort((a, b) => {
        return a.titre.localeCompare(b.titre);
      });

      const list = document.createElement('div');
      list.role = 'list';

      fCartes.forEach((carte) => {
        const listitem = document.createElement('div');
        listitem.role = 'listitem';

        const h4 = document.createElement('h4');
        h4.textContent = carte.titre;

        listitem.appendChild(h4);

        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.alt = '';
        let src = `/assets/img/cartes/${carte.id}.png`;

        if (isProd) {
          src = absolutePath + src;
        }

        img.src = src;

        img.setAttribute('lazy', 'loading');
        figure.appendChild(img);

        const figCaption = document.createElement('figcaption');

        const titre = document.createElement('p');
        titre.className = 'titre';
        titre.innerText = carte.sousTitre;
        figCaption.appendChild(titre);

        const sousTitre = document.createElement('p');
        sousTitre.className = 'sr-only';
        sousTitre.textContent = carte.description;
        figCaption.appendChild(sousTitre);

        figure.appendChild(figCaption);

        listitem.appendChild(figure);

        list.appendChild(listitem);
      });

      tabPanel.appendChild(list);

      tabPanels.push(tabPanel);
    });

    tabs.appendChild(tablist);

    tabPanels.forEach((tb) => {
      tabs.appendChild(tb);
    });

    this.appendChild(tabs);
  }
}

class CustomPicture extends HTMLElement {
  constructor() {
    super();
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
      this.attributes.class.value.split(' ').forEach((value) => {
        img.classList.add(value);
      });
    }

    this.appendChild(img);

    /* if (this.attributes.toggle) {
      const divToggle = document.createElement('div');
      divToggle.classList.add('toggle-gp');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', `alt-${this.attributes.id.value}`);
      button.textContent = "Consulter la transcription de l'image";

      button.addEventListener('click', (e) => {
        e.preventDefault();

        const expanded = e.target.getAttribute('aria-expanded');

        console.log('expanded', expanded);

        if (expanded === 'true') {
          console.log('true');
          button.setAttribute('aria-expanded', 'false');
          divToggle.classList.remove('is-active');
        } else {
          console.log('false');
          button.setAttribute('aria-expanded', 'true');
          divToggle.classList.add('is-active');
          console.log(button, divContenttoggle);
        }
      });

      const divContenttoggle = document.createElement('div');
      divContenttoggle.id = `alt-${this.attributes.id.value}`;
      divContenttoggle.className = 'content-to-toggle';

      const p = document.createElement('p');
      p.textContent = this.attributes.alt.value;
      divContenttoggle.appendChild(p);

      divToggle.appendChild(button);
      divToggle.appendChild(divContenttoggle);
      this.appendChild(divToggle);
    }*/
  }
}

class CustomFigure extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const figure = document.createElement('figure');

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
      this.attributes.class.value.split(' ').forEach((value) => {
        img.classList.add(value);
      });
    }

    const figCaption = document.createElement('figcaption');

    const legend = document.createElement('p');
    legend.className = 'sr-only';
    legend.innerText = this.attributes.longdesc.value;
    figCaption.appendChild(legend);

    figure.appendChild(img);
    figure.appendChild(figCaption);

    this.appendChild(figure);
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

    this.appendChild(link);
  }
}

// https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   tabs-automatic.js
 *
 *   Desc:   Tablist widget that implements ARIA Authoring Practices
 */

class TabsAutomatic {
  constructor(groupNode) {
    this.tablistNode = groupNode;

    this.tabs = [];

    this.firstTab = null;
    this.lastTab = null;

    this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
    this.tabpanels = [];

    for (var i = 0; i < this.tabs.length; i += 1) {
      var tab = this.tabs[i];
      var tabpanel = document.getElementById(tab.getAttribute('aria-controls'));

      tab.tabIndex = -1;
      tab.setAttribute('aria-selected', 'false');
      this.tabpanels.push(tabpanel);

      tab.addEventListener('keydown', this.onKeydown.bind(this));
      tab.addEventListener('click', this.onClick.bind(this));

      if (!this.firstTab) {
        this.firstTab = tab;
      }
      this.lastTab = tab;
    }

    this.setSelectedTab(this.firstTab, false);
  }

  setSelectedTab(currentTab, setFocus) {
    if (typeof setFocus !== 'boolean') {
      setFocus = true;
    }
    for (var i = 0; i < this.tabs.length; i += 1) {
      var tab = this.tabs[i];
      if (currentTab === tab) {
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');
        this.tabpanels[i].classList.remove('is-hidden');
        if (setFocus) {
          tab.focus();
        }
      } else {
        tab.setAttribute('aria-selected', 'false');
        tab.tabIndex = -1;
        this.tabpanels[i].classList.add('is-hidden');
      }
    }
  }

  setSelectedToPreviousTab(currentTab) {
    var index;

    if (currentTab === this.firstTab) {
      this.setSelectedTab(this.lastTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.setSelectedTab(this.tabs[index - 1]);
    }
  }

  setSelectedToNextTab(currentTab) {
    var index;

    if (currentTab === this.lastTab) {
      this.setSelectedTab(this.firstTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.setSelectedTab(this.tabs[index + 1]);
    }
  }

  /* EVENT HANDLERS */

  onKeydown(event) {
    var tgt = event.currentTarget,
      flag = false;

    switch (event.key) {
      case 'ArrowLeft':
        this.setSelectedToPreviousTab(tgt);
        flag = true;
        break;

      case 'ArrowRight':
        this.setSelectedToNextTab(tgt);
        flag = true;
        break;

      case 'Home':
        this.setSelectedTab(this.firstTab);
        flag = true;
        break;

      case 'End':
        this.setSelectedTab(this.lastTab);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onClick(event) {
    this.setSelectedTab(event.currentTarget);
  }
}
