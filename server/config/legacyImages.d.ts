export interface LegacyImageAsset {
  base: string
  originalExt: string
}

export interface VercelRedirect {
  source: string
  destination: string
  permanent: true
}

export declare const LEGACY_IMAGE_ASSETS: LegacyImageAsset[]
export declare const GENERATED_EXTENSIONS: string[]
export declare function buildLegacyImageAliases(): Map<string, string>
export declare function buildVercelImageRedirects(): VercelRedirect[]
