import { Module } from './module'

export class Graph {
   modules: Map<string, Module> = new Map()

   constructor(public entryPointPath: string) {
      // load entryPoint
   }

   async build() {
      const module = await this.loadModule(this.entryPointPath)
      this.addModule(this.entryPointPath, module)
   }

   async loadModule(path: string): Promise<Module> {
      const code = await this.loadCode(path)
      const module = new Module(this, code)

      return module
   }

   async loadCode(path: string): Promise<string> {
      const file = Bun.file(path)
      return file.text()
   }

   addModule(path: string, module: Module) {
      this.modules.set(path, module)
   }

   getModule(path: string) {
      return this.modules.get(path)
   }
}
