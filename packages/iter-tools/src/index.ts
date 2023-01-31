import { getMethodNames, getFunctionDeclaration } from './declaration'

for (const name of getMethodNames()) {
  try {
    console.log(getFunctionDeclaration(name.replace('$', '')).getText())
  } catch (e) {
    console.log('error', name)
  }
}
