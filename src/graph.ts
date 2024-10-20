import { dirname, resolve } from 'path'

import { Module } from './module'

export class Graph {
   modules: Map<string, Module> = new Map()
   entryDir: string
   entryPointPath: string
   loadingModules: Map<string, Promise<Module>> = new Map() // Using a Map for promises

   constructor(path: string) {
      this.entryDir = this.resolveEntryDirectory(path)
      this.entryPointPath = this.resolveAbsolutePath(path) // Convert the relative path to absolute
   }

   async build() {
      try {
         const module = await this.loadModule(this.entryPointPath)
         if (module) this.addModule(this.entryPointPath, module)
      } catch (error) {
         console.error('Error building the module graph:', error)
      }
   }

   async loadModule(relativePath: string): Promise<Module | undefined> {
      const fullPath = this.resolveModulePath(relativePath)

      if (this.loadingModules.has(fullPath)) {
         console.warn(`Circular dependency detected: ${fullPath} is already loading.`)
         return this.loadingModules.get(fullPath)!
      }

      const code = await this.loadCode(fullPath)
      const modulePromise = Module.INIT(this, code, fullPath)
      this.loadingModules.set(fullPath, modulePromise)

      try {
         const res = await modulePromise
         return res
      } catch (error) {
         console.error(error)
         return
      } finally {
         this.loadingModules.delete(fullPath)
      }

      // return modulePromise
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
      return resolve(process.cwd(), path)
   }

   DEBUG = () => {
      this.modules.forEach((m) => {
         console.log('🔶 module path: ', m.path)

         console.log('🔶 exports :')
         console.log(m.exports)

         console.log('🔶 imports :')
         console.log(m.imports)
      })
   }
}
