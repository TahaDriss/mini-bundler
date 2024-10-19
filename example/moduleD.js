import { shoutGreeting } from './moduleC.js'

export function specialGreeting(name) {
   return `*** ${shoutGreeting(name)} ***`
}
