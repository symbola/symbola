import { getMethodNames, getDeclaration } from './declaration'

for (const name of getMethodNames()) {
  try {
    console.log(getDeclaration(name.replace('$', '')).getText())
  } catch (e) {
    console.log('error', name)
  }
}
