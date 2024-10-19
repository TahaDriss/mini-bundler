import { greetLoud, greeting } from './moduleB.js'

export function shoutGreeting(name) {
   return `${greeting}! ${greetLoud(name)}`
}
