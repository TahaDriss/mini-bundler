import { bar } from './moduleB.js'

export const foo = 'This is foo from moduleA'

export function useBar() {
   return bar
}
