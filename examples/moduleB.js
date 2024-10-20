import { greet } from './moduleA.js'

export function greetLoud(name) {
   return greet(name).toUpperCase()
}

export * from './moduleA.js' // Re-export all from moduleA
