import { foo } from './moduleA.js'

export const bar = 'This is bar from moduleB'

export function useFoo() {
   return foo
}
