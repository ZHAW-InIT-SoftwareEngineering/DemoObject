# ChatApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**chatPost**](ChatApi.md#chatpostoperation) | **POST** /chat | Send a chat message to the hosted LLM through the backend proxy |



## chatPost

> ChatPost200Response chatPost(chatPostRequest)

Send a chat message to the hosted LLM through the backend proxy

### Example

```ts
import {
  Configuration,
  ChatApi,
} from '';
import type { ChatPostOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ChatApi();

  const body = {
    // ChatPostRequest (optional)
    chatPostRequest: ...,
  } satisfies ChatPostOperationRequest;

  try {
    const data = await api.chatPost(body);
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
| **chatPostRequest** | [ChatPostRequest](ChatPostRequest.md) |  | [Optional] |

### Return type

[**ChatPost200Response**](ChatPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | LLM response |  -  |
| **400** | Invalid request |  -  |
| **502** | Hosted LLM request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

