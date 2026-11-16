import catalog from './catalog.json';
import glossary from './glossary.json';
import type { EngineComponent, GlossaryTerm, Lang } from '../types';
import type { ComponentType } from 'react';

// The old generic catalog is a placeholder, not verified TF35000 hardware data.
// V5 navigation hid LPC. Remove 'lpc' from this set when the motor-specific
// architecture has been verified and you want to display it again.
const excludedIds = new Set(['lpc']);
const rawComponents = catalog.components as EngineComponent[];
const hidden = new Set(excludedIds);
let changed = true;
while (changed) {
  changed = false;
  for (const item of rawComponents) {
    if (item.parentId && hidden.has(item.parentId) && !hidden.has(item.id)) {
      hidden.add(item.id);
      changed = true;
    }
  }
}
export const components = rawComponents.filter(item => !hidden.has(item.id));
export const glossaryTerms = glossary as GlossaryTerm[];

// Vite imports new MDX files automatically; each article section is independently editable.
const pages = import.meta.glob('../../content/**/*.mdx', { eager: true }) as Record<
  string,
  { default: ComponentType<{ components?: Record<string, ComponentType<any>> }> }
>;

export function loadSection(componentId: string, sectionId: string, lang: Lang) {
  return pages[`../../content/${componentId}/${sectionId}.${lang}.mdx`]?.default ?? null;
}
