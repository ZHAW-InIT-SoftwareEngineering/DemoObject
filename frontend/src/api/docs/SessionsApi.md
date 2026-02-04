# SessionsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**sessionsPost**](SessionsApi.md#sessionspostoperation) | **POST** /sessions | Create a new session and return a sessionId (and QR payload) |
| [**sessionsSessionIdPatch**](SessionsApi.md#sessionssessionidpatchoperation) | **PATCH** /sessions/{sessionId} | Update stored information (status, path or expiresAt) for a specific session |
| [**sessionsSessionIdPathsGet**](SessionsApi.md#sessionssessionidpathsget) | **GET** /sessions/{sessionId}/paths | Retrieve stored path for a session |
| [**sessionsSessionIdPathsPut**](SessionsApi.md#sessionssessionidpathsput) | **PUT** /sessions/{sessionId}/paths | Store a user-selected path and its automatically transpiled DSL representation bund to a session  |



## sessionsPost

> SessionsPost201Response sessionsPost(sessionsPostRequest)

Create a new session and return a sessionId (and QR payload)

### Example

```ts
import {
  Configuration,
  SessionsApi,
} from '';
import type { SessionsPostOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SessionsApi();

  const body = {
    // SessionsPostRequest (optional)
    sessionsPostRequest: ...,
  } satisfies SessionsPostOperationRequest;

  try {
    const data = await api.sessionsPost(body);
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
| **sessionsPostRequest** | [SessionsPostRequest](SessionsPostRequest.md) |  | [Optional] |

### Return type

[**SessionsPost201Response**](SessionsPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Session created |  * Location - Cannoncial URI of the new created session resource <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sessionsSessionIdPatch

> SessionsSessionIdPatchRequest sessionsSessionIdPatch(sessionId, sessionsSessionIdPatchRequest)

Update stored information (status, path or expiresAt) for a specific session

### Example

```ts
import {
  Configuration,
  SessionsApi,
} from '';
import type { SessionsSessionIdPatchOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SessionsApi();

  const body = {
    // string
    sessionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SessionsSessionIdPatchRequest (optional)
    sessionsSessionIdPatchRequest: ...,
  } satisfies SessionsSessionIdPatchOperationRequest;

  try {
    const data = await api.sessionsSessionIdPatch(body);
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
| **sessionId** | `string` |  | [Defaults to `undefined`] |
| **sessionsSessionIdPatchRequest** | [SessionsSessionIdPatchRequest](SessionsSessionIdPatchRequest.md) |  | [Optional] |

### Return type

[**SessionsSessionIdPatchRequest**](SessionsSessionIdPatchRequest.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Path found |  -  |
| **404** | Session not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sessionsSessionIdPathsGet

> SessionsSessionIdPathsGet200Response sessionsSessionIdPathsGet(sessionId)

Retrieve stored path for a session

### Example

```ts
import {
  Configuration,
  SessionsApi,
} from '';
import type { SessionsSessionIdPathsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SessionsApi();

  const body = {
    // string
    sessionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SessionsSessionIdPathsGetRequest;

  try {
    const data = await api.sessionsSessionIdPathsGet(body);
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
| **sessionId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**SessionsSessionIdPathsGet200Response**](SessionsSessionIdPathsGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Path found |  -  |
| **404** | Session not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sessionsSessionIdPathsPut

> SessionsSessionIdPathsGet200Response sessionsSessionIdPathsPut(sessionId, mazesMazeIdPathsDslPostRequest)

Store a user-selected path and its automatically transpiled DSL representation bund to a session 

### Example

```ts
import {
  Configuration,
  SessionsApi,
} from '';
import type { SessionsSessionIdPathsPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SessionsApi();

  const body = {
    // string
    sessionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // MazesMazeIdPathsDslPostRequest (optional)
    mazesMazeIdPathsDslPostRequest: ...,
  } satisfies SessionsSessionIdPathsPutRequest;

  try {
    const data = await api.sessionsSessionIdPathsPut(body);
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
| **sessionId** | `string` |  | [Defaults to `undefined`] |
| **mazesMazeIdPathsDslPostRequest** | [MazesMazeIdPathsDslPostRequest](MazesMazeIdPathsDslPostRequest.md) |  | [Optional] |

### Return type

[**SessionsSessionIdPathsGet200Response**](SessionsSessionIdPathsGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Path stored |  -  |
| **400** | Invalid request or path |  -  |
| **404** | Session not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

