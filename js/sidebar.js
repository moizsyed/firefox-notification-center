import {
  LitElement,
  html,
  css,
  repeat,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

const NotificationManager = new (class {
  #store = [...window.NOTIFS];

  getNotifications(sources, searchQuery) {
    return this.#store.filter((notification) => {
      return (
        notification.title.toLowerCase().indexOf(searchQuery) >= 0 &&
        sources.find(src => src.id === notification.src)
      );
    });
  }

  getCategories() {
    let categories = new Map();
    for (const source of window.SOURCES) {
      categories.set(source.profile, categories.getOrInsert(source.profile, []).concat([source]));
    }
    return [...categories.entries().map(([k,v]) => ({ id: k, name: k, sources: v }))];
  }
})();

class CategoryElement extends LitElement {
  static properties = {
    category: { attribute: false },
    filter: { type: String },
  };

  static styles = css`
    :host { display: block; }

    /* Section header (PERSONAL / WORK) — matches the app's uppercase labels */
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 18px 2px 6px;
    }
    .name {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-3);
    }
    button.info {
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text-3);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 9px;
      border-radius: var(--r-full);
      cursor: pointer;
      transition: background var(--t-fast), color var(--t-fast);
    }
    button.info:hover { background: var(--surface-3); color: var(--text-2); }

    /* Notification row — mirrors .cnotif from the New Tab widget */
    .notification { padding-block: 1px; }
    .notification > main {
      position: relative;
      display: grid;
      grid-template-columns: 26px 1fr;
      gap: 10px;
      align-items: center;
      padding: 7px 8px;
      border-radius: var(--r-md);
      transition: background var(--t-fast);
    }
    .notification:hover > main { background: var(--surface-2); }

    .icon {
      width: 26px; height: 26px;
      border-radius: var(--r-sm);
      display: grid; place-items: center;
      font-size: 12px; font-weight: 700;
      color: white;
    }
    .body { min-width: 0; }
    .title {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .source {
      display: block;
      font-size: 12px;
      color: var(--text-3);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    /* Unread accent dot, sitting in the left gutter like .cnotif.is-unread */
    .notification.is-unread > main::before {
      content: "";
      position: absolute;
      left: 1px; top: 50%; transform: translateY(-50%);
      width: 4px; height: 4px;
      border-radius: 50%;
      background: var(--purple);
    }
  `;

  render() {
    let notifications = NotificationManager.getNotifications(
      this.category.sources,
      this.filter,
    );
    if (!notifications.length) {
      return;
    }
    return html`
      <div>
        <div class="top">
          <strong class="name">${this.category.name}</strong>
          <button class="info">${this.category.sources.length} sources</button>
        </div>
        ${repeat(
          notifications,
          (notification) => notification.when,
          this.notificationTemplate,
        )}
      </div>
    `;
  }

  notificationTemplate(notification) {
    const source = window.SOURCES.find(x => x.id === notification.src);
    return html`
      <div class="notification ${notification.unread ? 'is-unread' : ''}">
        <main>
          <span class="icon" style="background:${source.color}">${source.icon}</span>
          <span class="body">
            <strong class="title">${notification.title}</strong>
            <span class="source">${source.name}</span>
          </span>
        </main>
      </div>
    `;
  }
}

class CategoryListElement extends LitElement {
  static properties = {
    searchQuery: { type: String },
  };

  static styles = css`
    :host { display: block; }

    div {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    /* Search — matches the app's pill-shaped inputs and theming */
    input {
      font: inherit;
      font-size: 13px;
      width: 100%;
      padding: 10px 16px;
      background: var(--surface-2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: var(--r-full);
      outline: none;
      transition: border-color var(--t-fast), background var(--t-fast);
    }
    input::placeholder { color: var(--text-3); }
    input:focus { border-color: var(--purple); background: var(--surface); }
  `;

  constructor() {
    super();
    this.searchQuery = "";
  }

  handleEvent(event) {
    if (event.type === "change") {
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <div>
        <input
          value=${this.searchQuery}
          placeholder="Search"
          @input=${this.onSearchQueryChange}
        />
        <ul>
          ${repeat(
            NotificationManager.getCategories(),
            (category) => category.id,
            (category) => html`
              <li>
                <mockup-category
                  .category=${category}
                  .filter=${this.searchQuery}
                ></mockup-category>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  onSearchQueryChange(event) {
    this.searchQuery = event.target.value.toLowerCase();
  }
}

window.NotificationManager = NotificationManager;
customElements.define("mockup-category-list", CategoryListElement);
customElements.define("mockup-category", CategoryElement);

window.addEventListener("load", event => {
  document.querySelector(".sb__view[data-view=recent]").appendChild(document.createElement("mockup-category-list"));
});
