import { parse, type Program } from 'acorn'
import type { Graph } from './graph'

export class Module {
   graph: Graph
   ast: Program
   code: string
   dependencies: string[] = []
   imports: Map<string, string> = new Map()

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
      this.ast.body.forEach((node) => {
         if (node.type === 'ImportDeclaration') {
            const source = node.source.value
            if (source != null && typeof source === 'string') {
               this.dependencies.push(source)
            }
            node.specifiers.forEach((specifier) => {
               if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
                  const imported = specifier.imported.name
                  const local = specifier.local.name

                  this.imports.set(local, imported)
               }
            })
         }
      })
   }
}
