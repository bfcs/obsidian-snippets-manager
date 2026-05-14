import type MySnippetsPlugin from "src/plugin/main";
import { Menu, ToggleComponent, ButtonComponent, Notice } from "obsidian";
import { setAttributes } from "src/util/setAttributes";
import { MySnippetsSettings } from "src/settings/settingsData";
import CreateSnippetModal from "src/modal/createSnippetModal";
import { EnhancedApp, EnhancedMenu, EnhancedMenuItem } from "src/settings/type";

export default function snippetsMenu(
  app: EnhancedApp,
  plugin: MySnippetsPlugin,
  settings: MySnippetsSettings
) {
  const menu = new Menu() as unknown as EnhancedMenu;
  plugin.activeMenu = menu;

  menu.onHide(() => {
    plugin.activeMenu = null;
    plugin.lastMenuCloseTime = Date.now();
  });

  // Force DOM menu to ensure CSS and components render correctly
  if (typeof menu.setUseNativeMenu === "function") {
    menu.setUseNativeMenu(false);
  }

  const menuDom = (menu as any).dom as HTMLElement;
  menuDom.addClass("MySnippets-statusbar-menu");

  // Prevent menu from closing when clicking inside the menu container on blank areas
  ["mousedown", "mouseup", "click", "contextmenu", "pointerdown", "pointerup"].forEach((type) => {
    menuDom.addEventListener(type, (e) => {
      const target = e.target as HTMLElement;
      // If we're clicking the menu container itself or a menu item (but not a button/toggle inside it)
      if (target === menuDom || (target.closest(".menu-item") && !target.closest("button") && !target.closest(".checkbox-container"))) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, { capture: true });
  });

  const windowX = window.innerWidth;
  const windowY = window.innerHeight;


  const { customCss } = app;
  const currentSnippets = customCss.snippets;
  const snippetsFolder = customCss.getSnippetsFolder();

  currentSnippets.forEach((snippet: string) => {
    const snippetPath = customCss.getSnippetPath(snippet);

    menu.addItem((snippetElement) => {
      snippetElement.setTitle(snippet);

      const snippetElementDom = (snippetElement as any).dom as HTMLElement;
      const toggleComponent = new ToggleComponent(snippetElementDom);
      const openButton = new ButtonComponent(snippetElementDom);
      const deleteButton = new ButtonComponent(snippetElementDom);

      toggleComponent
        .setValue(customCss.enabledSnippets.has(snippet))
        .onChange((value) => {
          try {
            customCss.setCssEnabledStatus(snippet, value);
            new Notice(`${value ? "Enabled" : "Disabled"} snippet: ${snippet}`);
          } catch (err) {
            // Handle error
          }
        });

      openButton
        .setIcon("ms-snippet")
        .setTooltip(`Open snippet`)
        .onClick((e: any) => {
          app.openWithDefaultApp(snippetPath);
        });
      openButton.buttonEl.addClass("MS-OpenSnippet");

      deleteButton
        .setIcon("trash-2")
        .setTooltip("Delete snippet")
        .onClick(async () => {
          const confirm = window.confirm(
            `Are you sure you want to delete "${snippet}"?`
          );
          if (confirm) {
            try {
              await app.vault.adapter.remove(snippetPath);
              customCss.requestLoadSnippets();
              new Notice(`Deleted snippet: ${snippet}`);
              
              // Refresh menu with a small delay to allow vault/CSS state to sync
              setTimeout(() => {
                menu.hide();
                snippetsMenu(app, plugin, settings);
              }, 50);
            } catch (err) {
              new Notice("Error deleting snippet");
            }
          }
        });
      deleteButton.buttonEl.addClass("MS-DeleteSnippet");

      const stopProp = (e: Event) => {
        e.stopPropagation();
      };
      const events = ["click", "mousedown", "mouseup"];
      events.forEach((type) => {
        toggleComponent.toggleEl.addEventListener(type, stopProp);
        openButton.buttonEl.addEventListener(type, stopProp);
        deleteButton.buttonEl.addEventListener(type, stopProp);
      });
    });
  });

  menu.addSeparator();

  menu.addItem((actionsItem) => {
    const actions = actionsItem as unknown as EnhancedMenuItem;
    actions.setIcon(null);
    actions.setTitle("Actions");
    const actionsDom = (actions as any).dom as HTMLElement;
    setAttributes(actions.titleEl, { style: "font-weight: 700" });

    const reloadButton = new ButtonComponent(actionsDom);
    const folderButton = new ButtonComponent(actionsDom);
    const addButton = new ButtonComponent(actionsDom);

    setAttributes(reloadButton.buttonEl, { style: "margin-right: 3px" });
    setAttributes(addButton.buttonEl, { style: "margin-left: 3px" });

    reloadButton
      .setIcon("ms-reload")
      .setTooltip("Reload snippets")
      .onClick((e: any) => {
        customCss.requestLoadSnippets();
        new Notice("Snippets reloaded");
      });
    reloadButton.buttonEl.addClass("MySnippetsButton");
    reloadButton.buttonEl.addClass("MS-Reload");

    folderButton
      .setIcon("ms-folder")
      .setTooltip("Open snippets folder")
      .onClick((e: any) => {
        app.openWithDefaultApp(snippetsFolder);
      });
    folderButton.buttonEl.addClass("MySnippetsButton");
    folderButton.buttonEl.addClass("MS-Folder");

    addButton
      .setIcon("ms-add")
      .setTooltip("Create new snippet")
      .onClick((e: any) => {
        new CreateSnippetModal(app, plugin).open();
      });
    addButton.buttonEl.addClass("MySnippetsButton");
    addButton.buttonEl.addClass("MS-Add");

      const stopProp = (e: Event) => {
        e.stopPropagation();
      };
      const events = ["click", "mousedown", "mouseup"];
      events.forEach((type) => {
        reloadButton.buttonEl.addEventListener(type, stopProp);
        folderButton.buttonEl.addEventListener(type, stopProp);
        addButton.buttonEl.addEventListener(type, stopProp);
      });
  });

  menu.showAtPosition({
    x: windowX - 15,
    y: windowY - 37,
  });
}
