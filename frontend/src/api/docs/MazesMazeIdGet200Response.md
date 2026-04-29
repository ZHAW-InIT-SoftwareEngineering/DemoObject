
# MazesMazeIdGet200Response


## Properties

Name | Type
------------ | -------------
`mazeId` | number
`startNodeId` | number
`endNodeId` | number
`nodes` | [Array&lt;MazesMazeIdGet200ResponseNodesInner&gt;](MazesMazeIdGet200ResponseNodesInner.md)
`edges` | [Array&lt;MazesMazeIdGet200ResponseEdgesInner&gt;](MazesMazeIdGet200ResponseEdgesInner.md)
`walls` | [Array&lt;MazesMazeIdGet200ResponseWallsInner&gt;](MazesMazeIdGet200ResponseWallsInner.md)

## Example

```typescript
import type { MazesMazeIdGet200Response } from ''

// TODO: Update the object below with actual values
const example = {
  "mazeId": null,
  "startNodeId": null,
  "endNodeId": null,
  "nodes": null,
  "edges": null,
  "walls": null,
} satisfies MazesMazeIdGet200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MazesMazeIdGet200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


