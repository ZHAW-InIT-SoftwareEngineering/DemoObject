# MazesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**mazesMazeIdDisplayFeedGet**](MazesApi.md#mazesmazeiddisplayfeedget) | **GET** /mazes/{mazeId}/display-feed | Retrieve ranked final submissions for a public display leaderboard |
| [**mazesMazeIdDisplayNextGet**](MazesApi.md#mazesmazeiddisplaynextget) | **GET** /mazes/{mazeId}/display-next | Retrieve the next final submission path for public display animation |
| [**mazesMazeIdGet**](MazesApi.md#mazesmazeidget) | **GET** /mazes/{mazeId} | Retrieve a maze definition |
| [**mazesMazeIdPathsDslPost**](MazesApi.md#mazesmazeidpathsdslpostoperation) | **POST** /mazes/{mazeId}/paths/dsl | Compute the DSL of a specific provided path through the maze. |
| [**mazesMazeIdShortestPathGet**](MazesApi.md#mazesmazeidshortestpathget) | **GET** /mazes/{mazeId}/shortest-path |  |



## mazesMazeIdDisplayFeedGet

> MazesMazeIdDisplayFeedGet200Response mazesMazeIdDisplayFeedGet(mazeId)

Retrieve ranked final submissions for a public display leaderboard

### Example

```ts
import {
  Configuration,
  MazesApi,
} from '';
import type { MazesMazeIdDisplayFeedGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MazesApi();

  const body = {
    // number
    mazeId: 56,
  } satisfies MazesMazeIdDisplayFeedGetRequest;

  try {
    const data = await api.mazesMazeIdDisplayFeedGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **mazeId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**MazesMazeIdDisplayFeedGet200Response**](MazesMazeIdDisplayFeedGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Display feed found |  -  |
| **404** | Maze not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## mazesMazeIdDisplayNextGet

> MazesMazeIdDisplayNextGet200Response mazesMazeIdDisplayNextGet(mazeId)

Retrieve the next final submission path for public display animation

### Example

```ts
import {
  Configuration,
  MazesApi,
} from '';
import type { MazesMazeIdDisplayNextGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MazesApi();

  const body = {
    // number
    mazeId: 56,
  } satisfies MazesMazeIdDisplayNextGetRequest;

  try {
    const data = await api.mazesMazeIdDisplayNextGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **mazeId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**MazesMazeIdDisplayNextGet200Response**](MazesMazeIdDisplayNextGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Next display animation found |  -  |
| **404** | Maze not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## mazesMazeIdGet

> MazesMazeIdGet200Response mazesMazeIdGet(mazeId)

Retrieve a maze definition

### Example

```ts
import {
  Configuration,
  MazesApi,
} from '';
import type { MazesMazeIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MazesApi();

  const body = {
    // number
    mazeId: 56,
  } satisfies MazesMazeIdGetRequest;

  try {
    const data = await api.mazesMazeIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **mazeId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**MazesMazeIdGet200Response**](MazesMazeIdGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Maze found |  -  |
| **404** | Maze not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## mazesMazeIdPathsDslPost

> MazesMazeIdPathsDslPost200Response mazesMazeIdPathsDslPost(mazeId, mazesMazeIdPathsDslPostRequest)

Compute the DSL of a specific provided path through the maze.

### Example

```ts
import {
  Configuration,
  MazesApi,
} from '';
import type { MazesMazeIdPathsDslPostOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MazesApi();

  const body = {
    // number
    mazeId: 56,
    // MazesMazeIdPathsDslPostRequest (optional)
    mazesMazeIdPathsDslPostRequest: ...,
  } satisfies MazesMazeIdPathsDslPostOperationRequest;

  try {
    const data = await api.mazesMazeIdPathsDslPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **mazeId** | `number` |  | [Defaults to `undefined`] |
| **mazesMazeIdPathsDslPostRequest** | [MazesMazeIdPathsDslPostRequest](MazesMazeIdPathsDslPostRequest.md) |  | [Optional] |

### Return type

[**MazesMazeIdPathsDslPost200Response**](MazesMazeIdPathsDslPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Compile a user-provided maze path do DSL |  -  |
| **400** | Invalid request |  -  |
| **404** | Maze not found |  -  |
| **412** | Invalid path |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## mazesMazeIdShortestPathGet

> MazesMazeIdShortestPathGet200Response mazesMazeIdShortestPathGet(mazeId, algorithm)



### Example

```ts
import {
  Configuration,
  MazesApi,
} from '';
import type { MazesMazeIdShortestPathGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MazesApi();

  const body = {
    // number
    mazeId: 56,
    // 'bfs' | 'dijkstra' (optional)
    algorithm: algorithm_example,
  } satisfies MazesMazeIdShortestPathGetRequest;

  try {
    const data = await api.mazesMazeIdShortestPathGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **mazeId** | `number` |  | [Defaults to `undefined`] |
| **algorithm** | `bfs`, `dijkstra` |  | [Optional] [Defaults to `undefined`] [Enum: bfs, dijkstra] |

### Return type

[**MazesMazeIdShortestPathGet200Response**](MazesMazeIdShortestPathGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Find shortest path between two nodes using BFS or Dijkstra |  -  |
| **400** | Invalid request |  -  |
| **404** | Maze or path not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

