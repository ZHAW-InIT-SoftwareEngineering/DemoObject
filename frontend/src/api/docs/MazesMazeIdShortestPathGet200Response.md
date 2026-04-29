
# MazesMazeIdShortestPathGet200Response


## Properties

Name | Type
------------ | -------------
`algorithm` | string
`path` | [Array&lt;MazesMazeIdPathsDslPostRequestPathInner&gt;](MazesMazeIdPathsDslPostRequestPathInner.md)
`length` | number
`cost` | number
`explorationSteps` | [Array&lt;MazesMazeIdShortestPathGet200ResponseExplorationStepsInner&gt;](MazesMazeIdShortestPathGet200ResponseExplorationStepsInner.md)

## Example

```typescript
import type { MazesMazeIdShortestPathGet200Response } from ''

// TODO: Update the object below with actual values
const example = {
  "algorithm": null,
  "path": null,
  "length": null,
  "cost": null,
  "explorationSteps": null,
} satisfies MazesMazeIdShortestPathGet200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MazesMazeIdShortestPathGet200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


