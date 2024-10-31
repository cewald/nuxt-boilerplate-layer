import { Project, SyntaxKind } from 'ts-morph'
import type { SourceFile, ModuleDeclaration } from 'ts-morph'

export const transformTypesToGlobal = (filePath: string) => {
  const project = new Project()

  const sourceFile = project.addSourceFileAtPath(filePath)
  const output = project.createSourceFile('')

  const imports = sourceFile.getImportDeclarations()
  output.addStatements(imports.map(s => s.getText()))

  const globalMod = output.addModule({
    name: 'global',
    hasDeclareKeyword: true,
  })

  translateExports(sourceFile, globalMod)

  const types = sourceFile.getStatements()
    .filter(s => [
      SyntaxKind.InterfaceDeclaration,
      SyntaxKind.TypeAliasDeclaration,
    ].includes(s.getKind()))
  globalMod.addStatements(types.map(s => s.getText()))

  output.getStatements().forEach(s => {
    if (s.getKind() === SyntaxKind.ModuleDeclaration) {
      s.replaceWithText(s.getText().replace('declare namespace', 'declare'))
    }
  })

  return output.getText()
}

const translateExports = <T extends ModuleDeclaration>(source: SourceFile, globalMod: T) => {
  const importMap: Record<string, { name: string, from: string }> = {}
  source.getImportDeclarations().forEach(d =>
    d.getNamedImports().forEach(e => {
      importMap[e.getAliasNode()?.getText() ?? e.getName()] = {
        name: e.getName(),
        from: d.getModuleSpecifierValue(),
      }
    }))

  const exportList: string[] = []
  source.getExportDeclarations().forEach(d =>
    d.getNamedExports().forEach(e => {
      exportList.push(e.getAliasNode()?.getText() ?? e.getName())
    }))

  exportList.forEach(e => {
    const { name, from } = importMap[e]
    const declaration = globalMod.addExportDeclaration({
      namedExports: [
        { name, alias: e },
      ],
      moduleSpecifier: from,
    })
    declaration.replaceWithText(declaration.getText().replace(';', ''))
  })
}

export default transformTypesToGlobal
