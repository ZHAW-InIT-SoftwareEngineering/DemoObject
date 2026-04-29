# InfraApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**healthzGet**](InfraApi.md#healthzget) | **GET** /healthz | Health check endpoint |



## healthzGet

> HealthzGet200Response healthzGet()

Health check endpoint

### Example

```ts
import {
  Configuration,
  InfraApi,
} from '';
import type { HealthzGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new InfraApi();

  try {
    const data = await api.healthzGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**HealthzGet200Response**](HealthzGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Service is healthy |  -  |
| **503** | Service is degraded |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

