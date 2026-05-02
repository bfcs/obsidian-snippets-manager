export function setAttributes(element: HTMLElement, attributes: Record<string, string>) {
  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      const value = attributes[key];
      if (value !== undefined) {
        element.setAttribute(key, value);
      }
    }
  }
}
