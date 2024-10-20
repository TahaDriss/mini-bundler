import { describe, it, expect } from 'bun:test'
import { Graph } from './graph'

describe('Module Bundler', () => {
   it('should initialize an empty module graph', async () => {
      const graph = new Graph('examples/index.js')
      await graph.build()

      expect(graph.modules.size).toBe(5)
   })

   it('should load a single module and parse its AST', async () => {
      const graph = new Graph('examples/moduleA.js')
      await graph.build()

      const moduleA = graph.getModule(`${graph.entryDir}/moduleA.js`)

      // Assertions
      expect(moduleA).toBeDefined()
      expect(moduleA?.ast).toBeDefined()
      expect(moduleA?.ast.body).toBeInstanceOf(Array)
      expect(moduleA?.dependencies.length).toBeGreaterThanOrEqual(0)
   })

   it('should extract dependencies from a module', async () => {
      const graph = new Graph('examples/moduleWithDeps.js')
      await graph.build()

      const path = `${graph.entryDir}/moduleWithDeps.js`
      const moduleWithDeps = graph.getModule(path)

      expect(moduleWithDeps).toBeDefined()
      expect(moduleWithDeps?.dependencies).toBeInstanceOf(Array)
      expect(moduleWithDeps?.dependencies.length).toBeGreaterThan(0)

      expect(moduleWithDeps?.dependencies).toContain('./moduleA.js')
      expect(moduleWithDeps?.dependencies).toContain('./moduleB.js')
   })

   it('should link imports to the correct exports', async () => {
      const graph = new Graph('examples/moduleWithImport.js')
      await graph.build()
      const dirPath = graph.entryDir
      graph.DEBUG()

      const moduleWithImport = graph.getModule(`${dirPath}/moduleWithImport.js`)
      const moduleA = graph.getModule(`./moduleA.js`)

      expect(moduleWithImport).toBeDefined()
      expect(moduleA).toBeDefined()

      const importedSymbol = moduleWithImport?.imports.get('greet')

      expect(importedSymbol).toBeDefined()
      expect(importedSymbol?.importedName).toBe('greet')
      expect(importedSymbol?.source).toBe('./moduleA.js')

      expect(moduleA?.export).toContain('greet')
   })

   // Test for resolving circular dependencies
   it.skip('should resolve circular dependencies correctly', () => {
      // Implement the test for circular dependency resolution
   })

   // Test for handling re-exports
   it.skip('should handle re-exporting all symbols from another module', () => {
      // Implement the test for handling re-exports
   })

   // Test for generating the final bundle
   it.skip('should generate the final bundle with resolved imports', () => {
      // Implement the test for bundle generation
   })

   // Test for export conflicts
   it.skip('should handle export name conflicts', () => {
      // Implement the test for export conflicts
   })

   // Test for handling missing imports
   it.skip('should warn or throw an error for missing imports', () => {
      // Implement the test for missing imports
   })
})
