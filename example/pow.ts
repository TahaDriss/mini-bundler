import { add } from './multiply'

export const pow = (a: number, b: number): number => {
   let res = a
   for (let i = 1; i < b; i++) {
      res = add(a, i)
   }

   return res
}
