import { revalidatePath } from 'next/cache'
import type { CollectionConfig, GlobalConfig } from 'payload'
function refresh() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    /* CLI seeds run without a Next request/cache context. */
  }
}
export function publicCollection(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange || []),
        ({ doc }) => {
          refresh()
          return doc
        },
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete || []),
        ({ doc }) => {
          refresh()
          return doc
        },
      ],
    },
  }
}
export function publicGlobal(global: GlobalConfig): GlobalConfig {
  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [
        ...(global.hooks?.afterChange || []),
        ({ doc }) => {
          refresh()
          return doc
        },
      ],
    },
  }
}
