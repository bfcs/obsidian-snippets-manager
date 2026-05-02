export const SNIPPET_VIEW_SIDE = ["right", "left"];

export interface MySnippetsSettings {
  snippetViewPosition: string;
  openSnippetFile: boolean;
  stylingTemplate: string;
  snippetEnabledStatus: boolean;
}

export const DEFAULT_SETTINGS: MySnippetsSettings = {
  snippetViewPosition: "left",
  openSnippetFile: true,
  stylingTemplate: "",
  snippetEnabledStatus: false,
};
