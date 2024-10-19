import { parse, type Program } from 'acorn'
import type { Graph } from './graph'

export class Module {
   graph: Graph
   ast: Program
   code: string
   dependencies: string[] = []
   imports: ImportsMap = new Map()
   export: string[] = []

   constructor(graph: Graph, code: string) {
      this.graph = graph
      this.code = code
      this.ast = this.parse(code)
      this.extractDependencies()
      this.extractExport() // this updates dependencies
   }

   parse(content: string): Program {
      return parse(content, { sourceType: 'module', ecmaVersion: 2020 })
   }

   async linkDependencies() {
      this.extractDependencies()
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
            node.specifiers.forEach((specifier) => {
               if (specifier.type === 'ExportSpecifier' && specifier.exported.type === 'Identifier') {
                  this.export.push(specifier.exported.name)
               }
            })
         }

         if (node.type === 'ExportDefaultDeclaration') this.export.push('default')

         if (node.type === 'ExportAllDeclaration') {
            // case of "export * from './moduleE.js';"
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

   //   TODO : implement extractExport + linkImportToExport
}

interface ImportEntry {
   importedName: string
   source: string // The module path
}

type ImportsMap = Map<string, ImportEntry>
