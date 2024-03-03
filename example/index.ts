import { add } from './add'
import { pow } from './pow'

console.log('Hi from index.js !')

const powRes = pow(5, 2)
const res = add(powRes, 100)

console.log('The result is : ', res)
