import { parse, type Program } from 'acorn'
import type { Graph } from './graph'

export class Module {
   graph: Graph
   ast: Program
   code: string
   dependencies: string[] = []
   imports: ImportsMap = new Map()

   constructor(graph: Graph, code: string) {
      this.graph = graph
      this.code = code
      this.ast = this.parse(code)
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
      this.ast.body.forEach((node: any) => {
         if (node.type === 'ImportDeclaration') {
            const source = node.source.value as string
            this.dependencies.push(source)
            this.handleImportSpecifiers(node.specifiers, source)
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
