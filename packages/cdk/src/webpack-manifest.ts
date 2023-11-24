import * as fs from 'fs'
import * as path from 'path'
import invariant from 'tiny-invariant'

export type WebpackManifest = {
  'index.html': string
} & Record<string, string>

export const WEBPACK_MANIFEST_FILE_NAME: string =
  'manifest.json'

function getWebpackManifest(
  distPath: string,
): WebpackManifest {
  return JSON.parse(
    fs.readFileSync(
      path.join(distPath, WEBPACK_MANIFEST_FILE_NAME),
      'utf8',
    ),
  )
}

export function getDefaultRootObject(
  distPath: string,
): string {
  const manifest = getWebpackManifest(distPath)

  // should look like /index.9c763277af2205a9b76d.html
  invariant(
    manifest['index.html'].match(
      /^\/index\.[a-z0-9]{20}\.html$/,
    ),
  )

  return path.basename(manifest['index.html'])
}

export function getExtensions(distPath: string): string[] {
  const manifest = getWebpackManifest(distPath)
  const extensions = new Set<string>()

  for (const name of Object.values(manifest)) {
    let ext = path.extname(name)
    invariant(ext)

    // remove the starting "."
    ext = ext.substring(1)

    if (ext !== 'html') {
      extensions.add(ext)
    }
  }

  // sanity check some we know that should/shouldn't be there
  invariant(extensions.has('js'))
  // invariant(extensions.has('webmanifest'))
  invariant(!extensions.has('html'))
  invariant(!extensions.has(''))

  return [...extensions]
}
