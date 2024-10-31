import { Project, SyntaxKind } from 'ts-morph'

export const transformTypesToGlobal = (filePath: string, ignoreImports = false) => {
  const project = new Project()

  const source = project.addSourceFileAtPath(filePath)
  const output = project.createSourceFile('')

  if (!ignoreImports) {
    const imports = source.getImportDeclarations()
    output.addStatements(imports.map(s => s.getText()))
  }

  const globalMod = output.addModule({
    name: 'global',
    hasDeclareKeyword: true,
  })

  globalMod.replaceWithText(globalMod.getText().replace('declare namespace', 'declare'))

  const types = source.getStatements()
    .filter(s => [
      SyntaxKind.InterfaceDeclaration,
      SyntaxKind.TypeAliasDeclaration,
    ].includes(s.getKind()))
    .map(s => {
      const st = s.asKind(SyntaxKind.InterfaceDeclaration)
        || s.asKind(SyntaxKind.TypeAliasDeclaration)
      return st ? st.setIsExported(false) : s
    })

  globalMod.addStatements(types.map(s => s.getText()))

  return output.getText()
}

export default transformTypesToGlobal
