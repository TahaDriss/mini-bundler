import { parse, type Program } from 'acorn'
import type { Graph } from './graph'

export class Module {
   graph: Graph
   ast: Program
   code: string
   path: string
   dependencies: string[] = []
   imports: ImportsMap = new Map()
   public exports: string[] = []
   linkedImports = new Map<string, string>()

   private constructor(graph: Graph, code: string, path: string) {
      this.graph = graph
      this.code = code
      this.path = path
      this.ast = this.parse(code)
      this.extractDependencies()
      this.extractExport() // this updates dependencies
   }

   static INIT = async (graph: Graph, code: string, fullPath: string): Promise<Module> => {
      const module = new Module(graph, code, fullPath)
      await module.linkDependencies()
      module.linkImportToExport()

      return module
   }

   parse(content: string): Program {
      return parse(content, { sourceType: 'module', ecmaVersion: 2020 })
   }

   async linkDependencies() {
      for (const dep of this.dependencies) {
         const depModule = await this.graph.loadModule(dep)
         this.graph.addModule(dep, depModule)
      }
   }

   private extractDependencies() {
      this.ast.body.forEach((node) => {
         if (node.type === 'ImportDeclaration') {
            const source = node.source.value as string
            this.dependencies.push(source)
            this.handleImportSpecifiers(node.specifiers, source)
         }
      })
   }

   private extractExport() {
      this.ast.body.forEach((node) => {
         if (node.type === 'ExportNamedDeclaration') {
            if (node.specifiers.length > 0) {
               node.specifiers.forEach((specifier) => {
                  if (specifier.type === 'ExportSpecifier' && specifier.exported.type === 'Identifier') {
                     this.exports.push(specifier.exported.name)
                  }
               })
            }

            if (node.declaration != null) {
               const declaration = node.declaration
               if (declaration.type === 'FunctionDeclaration' && declaration.id) {
                  this.exports.push(declaration.id.name)
               }
               if (declaration.type === 'VariableDeclaration') {
                  declaration.declarations.forEach((declaration) => {
                     if (declaration.id.type === 'Identifier') {
                        this.exports.push(declaration.id.name)
                     }
                  })
               }
               if (declaration.type === 'ClassDeclaration' && declaration.id) {
                  this.exports.push(declaration.id.name)
               }
            }
         }

         if (node.type === 'ExportDefaultDeclaration') {
            this.exports.push('default')
         }

         if (node.type === 'ExportAllDeclaration') {
            const source = node.source.value as string
            this.dependencies.push(source)
         }
      })
   }

   private handleImportSpecifiers(specifiers: any[], source: string) {
      specifiers.forEach((specifier) => {
         if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
            const imported = specifier.imported.name
            const local = specifier.local.name
            this.imports.set(local, { importedName: imported, source })
         }
      })
   }

   private linkImportToExport() {
      this.imports.forEach((importPath, localName) => {
         const importedModule = this.graph.getModule(importPath.source)

         if (importedModule != null) {
            const importedExports = importedModule.exports
            if (importedExports.includes(importPath.importedName)) {
               this.linkedImports.set(localName, importPath.importedName)
            } else {
               console.warn(`Warning: ${importPath.importedName} not found in ${importPath.source}`)
            }
         } else {
            console.warn(`Warning: Module ${importPath.source} not found`)
         }
      })
   }
}

interface ImportEntry {
   importedName: string
   source: string // The module path
}

type ImportsMap = Map<string, ImportEntry>
