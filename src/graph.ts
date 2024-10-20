import { dirname, resolve } from 'path'

import { Module } from './module'

export class Graph {
   modules: Map<string, Module> = new Map()
   entryDir: string
   entryPointPath: string

   constructor(path: string) {
      this.entryDir = this.resolveEntryDirectory(path)
      this.entryPointPath = this.resolveAbsolutePath(path) // Convert the relative path to absolute
   }

   async build() {
      const module = await this.loadModule(this.entryPointPath)
      this.addModule(this.entryPointPath, module)
   }

   async loadModule(relativePath: string): Promise<Module> {
      const fullPath = this.resolveModulePath(relativePath)
      const code = await this.loadCode(fullPath)
      const module = Module.INIT(this, code, fullPath)

      return module
   }

   async loadCode(path: string): Promise<string> {
      try {
         const file = Bun.file(path)

         const code = await file.text()

         return code
      } catch (error) {
         throw error
      }
   }

   addModule(path: string, module: Module) {
      this.modules.set(path, module)
   }

   getModule(path: string) {
      return this.modules.get(path)
   }

   resolveModulePath(importPath: string): string {
      return resolve(this.entryDir, importPath)
   }

   resolveEntryDirectory(entryPath: string): string {
      const absoluteEntryPath = resolve(entryPath)
      return dirname(absoluteEntryPath)
   }
   resolveAbsolutePath(path: string): string {
      // If the path is relative, resolve it to an absolute path based on the current working directory
      return resolve(process.cwd(), path)
   }

   DEBUG = () => {
      this.modules.forEach((m) => {
         console.log('🔶 module path: ', m.path)

         console.log('🔶 exports :')
         console.log(m.export)

         console.log('🔶 imports :')
         console.log(m.imports)
      })
   }
}
