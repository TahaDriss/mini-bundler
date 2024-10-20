import { greet } from './moduleA.js'

export function sayHello() {
   greet()
   console.log('Hello from moduleWithImport')
}
