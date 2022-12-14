import { Package, PackageRequirement } from "types"
import SemVer, * as semver from "semver"

/// allows inputs `nodejs.org@16` when `semver.parse` would reject
export function parse(input: string): PackageRequirement | Package {
  const match = input.match(/^(.*?)([\^=~<>@].+)?$/)
  if (!match) throw new Error(`invalid pkgspec: ${input}`)
  if (!match[2]) match[2] = "*"

  const project = match[1]

  if (match[2].startsWith("@") || match[2].startsWith("=")) {
    const match2 = match[2].slice(1)
    if (match2 == 'latest') {
      console.warn(`@latest is deprecated, instead specify \`${project}*' or just \`${project}'`)
      return { project, constraint: new semver.Range('*') }
    }
    let version = semver.parse(match2)
    if (!version) {
      const coercion = parseInt(match[2].slice(1))
      if (Number.isNaN(coercion)) throw new Error()
      version = new SemVer([coercion, 0, 0])
    }
    return { project, version }
  } else {
    const constraint = new semver.Range(match[2])
    const version = constraint.single()

    if (version) {
      return { project, version }
    } else {
      return { project, constraint }
    }
  }
}

export function compare(a: Package, b: Package): number {
  return a.project === b.project
    ? a.version.compare(b.version)
    : a.project.localeCompare(b.project)
}

export function str(pkg: Package | PackageRequirement): string {
  if ("constraint" in pkg) {
    if (pkg.constraint.set === "*") {
      return pkg.project
    } else {
      return `${pkg.project}${pkg.constraint.toString()}`
    }
  } else {
    return `${pkg.project}@${pkg.version.toString()}`
  }
}
